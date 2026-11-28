//! How the window is layered, per platform.
//!
//! The page draws everything itself unless it starts the native viewport (Stage 5,
//! `viewport.rs`, a preview behind a setting); the layering for that:
//!
//! - **Windows:** the webview covers the window, transparent where the viewport
//!   shows, and wgpu draws into the window below it (measured in the spike).
//!   Vulkan is the default backend there, DX12 the fallback.
//! - **Linux: Wayland only.** Tauri's webview is a GTK widget that draws into the
//!   same surface as wgpu would, so on X11 and XWayland the two overwrite each
//!   other. What works is wgpu in a `wl_subsurface` of its own placed below a
//!   transparent GTK window, which the compositor blends (`ViewportSurface`).
//!   The app therefore runs as a Wayland client and refuses X11.

use tauri::WebviewWindow;

/// Before the toolkit starts.
pub fn prepare() {
    #[cfg(target_os = "linux")]
    linux::prepare();
}

/// How a window is built for that. Linux: an RGBA window from the start (GTK cannot change
/// its visual later), so the viewport's subsurface can show through the page; `attach` turns
/// the page opaque again until a viewport starts.
pub fn options<'a, R: tauri::Runtime, M: tauri::Manager<R>>(b: tauri::WebviewWindowBuilder<'a, R, M>) -> tauri::WebviewWindowBuilder<'a, R, M> {
    #[cfg(target_os = "linux")]
    return b.transparent(true);
    #[cfg(not(target_os = "linux"))]
    b
}

/// Once the window exists: the native viewport, when the page starts one, follows its size.
/// (On Linux the viewport follows the page's own widget instead: `linux::start`.)
pub fn attach(window: &WebviewWindow) {
    #[cfg(not(target_os = "linux"))]
    {
        let w = window.as_ref().window();
        window.on_window_event(move |e| {
            if let tauri::WindowEvent::Resized(s) = e {
                crate::viewport::resized(&w, s.width, s.height);
            }
            if let tauri::WindowEvent::ScaleFactorChanged { new_inner_size, .. } = e {
                crate::viewport::resized(&w, new_inner_size.width, new_inner_size.height);
            }
        });
    }
    // The page opaque (white, the web engine's own background) while the web engine draws.
    #[cfg(target_os = "linux")]
    let _ = window.set_background_color(None);
}

#[cfg(target_os = "linux")]
pub mod linux {
    use wayland_client::backend::{Backend, ObjectId};
    use wayland_client::globals::{registry_queue_init, GlobalListContents};
    use wayland_client::protocol::{
        wl_compositor::WlCompositor, wl_region::WlRegion, wl_registry::WlRegistry, wl_subcompositor::WlSubcompositor,
        wl_subsurface::WlSubsurface, wl_surface::WlSurface,
    };
    use wayland_client::{Connection, Dispatch, Proxy, QueueHandle};

    pub fn prepare() {
        if std::env::var_os("WAYLAND_DISPLAY").is_none() {
            let session = std::env::var("XDG_SESSION_TYPE").unwrap_or_else(|_| "unknown".into());
            let msg = format!(
                "3DHeat needs a Wayland session; this one is {session}. X11 is not supported.\n\
                 Log out and pick a Wayland session at the login screen (GNOME, KDE Plasma and most\n\
                 desktops offer one), then start 3DHeat again."
            );
            eprintln!("{msg}");
            // Started from a menu there is no terminal to read that in: say it in a dialog
            // where the desktop has a tool for one.
            for (tool, args) in [
                ("zenity", vec!["--error", "--title=3DHeat", "--no-wrap", "--text"]),
                ("kdialog", vec!["--title", "3DHeat", "--error"]),
                ("notify-send", vec!["-u", "critical", "3DHeat"]),
            ] {
                if std::process::Command::new(tool).args(&args).arg(&msg).status().is_ok() {
                    break;
                }
            }
            std::process::exit(1);
        }
        if crate::requirements::run().iter().any(|c| c.id == "vulkan" && c.status != "ok") {
            // Not fatal: the first-run check page says what to install.
            eprintln!("3DHeat: no usable Vulkan driver was found; see Settings > System check.");
        }
        // GTK picks X11 when DISPLAY is set too; the layering needs Wayland.
        std::env::set_var("GDK_BACKEND", "wayland");
    }

    struct State;

    impl Dispatch<WlRegistry, GlobalListContents> for State {
        fn event(
            _: &mut Self,
            _: &WlRegistry,
            _: wayland_client::protocol::wl_registry::Event,
            _: &GlobalListContents,
            _: &Connection,
            _: &QueueHandle<Self>,
        ) {
        }
    }

    wayland_client::delegate_noop!(State: ignore WlCompositor);
    wayland_client::delegate_noop!(State: ignore WlSubcompositor);
    wayland_client::delegate_noop!(State: ignore WlSubsurface);
    wayland_client::delegate_noop!(State: ignore WlSurface);
    wayland_client::delegate_noop!(State: ignore WlRegion);

    /// The surface the native viewport draws into: below the window's GTK surface,
    /// taking no input (everything goes to the webview above).
    pub struct ViewportSurface {
        conn: Connection,
        pub surface: WlSurface,
        sub: WlSubsurface,
    }

    impl ViewportSurface {
        /// # Safety
        /// `display` and `parent` are the window's live `wl_display` and `wl_surface`.
        /// The subsurface's place applies on the parent's next commit: the caller asks
        /// GTK for one redraw afterwards.
        pub unsafe fn create(display: *mut std::ffi::c_void, parent: *mut std::ffi::c_void) -> Option<Self> {
            let conn = Connection::from_backend(Backend::from_foreign_display(display as *mut _));
            let (globals, mut queue) = registry_queue_init::<State>(&conn).ok()?;
            let qh = queue.handle();
            let comp: WlCompositor = globals.bind(&qh, 1..=4, ()).ok()?;
            let subc: WlSubcompositor = globals.bind(&qh, 1..=1, ()).ok()?;
            let parent = WlSurface::from_id(&conn, ObjectId::from_ptr(WlSurface::interface(), parent as *mut _).ok()?).ok()?;
            let surface = comp.create_surface(&qh, ());
            let sub = subc.get_subsurface(&surface, &parent, &qh, ());
            sub.set_position(0, 0);
            sub.place_below(&parent);
            sub.set_desync();
            let region = comp.create_region(&qh, ());
            surface.set_input_region(Some(&region));
            region.destroy();
            surface.commit();
            queue.roundtrip(&mut State).ok();
            Some(Self { conn, surface, sub })
        }

        /// Where the page sits: the subsurface's corner (applied on the parent's next commit)
        /// and the buffer scale its pictures come in (on its own next commit).
        fn apply(&self, p: &Place) {
            self.sub.set_position(p.x, p.y);
            // wl_surface v3 has the buffer scale; the compositor was bound at up to v4.
            if self.surface.version() >= 3 {
                self.surface.set_buffer_scale(p.scale);
            }
            let _ = self.conn.flush();
        }

        /// The raw `wl_display` and `wl_surface` for wgpu, as addresses (they cross threads).
        fn handles(&self) -> (usize, usize) {
            (self.conn.backend().display_ptr() as usize, self.surface.id().as_ptr() as usize)
        }
    }

    impl Drop for ViewportSurface {
        fn drop(&mut self) {
            self.sub.destroy();
            self.surface.destroy();
            let _ = self.conn.flush();
        }
    }

    /// Where the page's widget sits in the window's surface (logical pixels), the scale,
    /// and its size in the buffer's pixels.
    #[derive(Clone, Copy)]
    struct Place {
        x: i32,
        y: i32,
        scale: i32,
        width: u32,
        height: u32,
    }

    /// GTK draws the window's frame (client-side decorations, their shadow) into the same
    /// surface, so the page's widget is offset in it; the offset changes when the window is
    /// maximized or tiled.
    fn place(vbox: &gtk::Box, top: &gtk::ApplicationWindow) -> Place {
        use gtk::prelude::*;
        let (x, y) = vbox.translate_coordinates(top, 0, 0).unwrap_or((0, 0));
        let a = vbox.allocation();
        let scale = vbox.scale_factor().max(1);
        Place { x, y, scale, width: (a.width().max(1) * scale) as u32, height: (a.height().max(1) * scale) as u32 }
    }

    /// A running viewport's subsurface, and the handlers that keep it under the page.
    struct Layer {
        surface: ViewportSurface,
        handlers: Vec<gtk::glib::SignalHandlerId>,
    }

    fn layers() -> &'static std::sync::Mutex<std::collections::HashMap<String, Layer>> {
        static LAYERS: std::sync::OnceLock<std::sync::Mutex<std::collections::HashMap<String, Layer>>> = std::sync::OnceLock::new();
        LAYERS.get_or_init(Default::default)
    }

    /// On the main thread: the viewport's subsurface below this window's page, following the
    /// page's widget from here on. Answers the raw `wl_display` and `wl_surface` for wgpu
    /// (addresses), and the size in pixels.
    pub fn start(window: &tauri::Window) -> Result<(usize, usize, (u32, u32)), String> {
        use gtk::prelude::*;
        use heat3d_viewport::wgpu::rwh::{HasDisplayHandle, HasWindowHandle, RawDisplayHandle, RawWindowHandle};
        if layers().lock().unwrap().contains_key(window.label()) {
            return Err("the viewport's surface is already there".into());
        }
        let top = window.gtk_window().map_err(|e| e.to_string())?;
        let vbox = window.default_vbox().map_err(|e| e.to_string())?;
        let display = match window.display_handle().map_err(|e| e.to_string())?.as_raw() {
            RawDisplayHandle::Wayland(d) => d.display.as_ptr(),
            _ => return Err("the window is not on Wayland".into()),
        };
        let parent = match window.window_handle().map_err(|e| e.to_string())?.as_raw() {
            RawWindowHandle::Wayland(w) => w.surface.as_ptr(),
            _ => return Err("the window is not on Wayland".into()),
        };
        // SAFETY: GTK's own display and the window's surface, both live while the window is.
        let surface = unsafe { ViewportSurface::create(display, parent) }.ok_or("the compositor gave no subsurface")?;
        let p = place(&vbox, &top);
        surface.apply(&p);
        let (d, s) = surface.handles();
        let (w, t) = (window.clone(), top.clone());
        let on_size = vbox.connect_size_allocate(move |b, _| follow(&w, b, &t));
        let (w, t) = (window.clone(), top.clone());
        let on_scale = vbox.connect_scale_factor_notify(move |b| follow(&w, b, &t));
        layers().lock().unwrap().insert(window.label().to_owned(), Layer { surface, handlers: vec![on_size, on_scale] });
        // The subsurface's place takes effect when GTK commits the window next.
        top.queue_draw();
        Ok((d, s, (p.width, p.height)))
    }

    /// The page's widget moved or resized (or the scale changed): the subsurface and the
    /// viewport's pictures follow.
    fn follow(window: &tauri::Window, vbox: &gtk::Box, top: &gtk::ApplicationWindow) {
        let p = place(vbox, top);
        if let Some(l) = layers().lock().unwrap().get(window.label()) {
            l.surface.apply(&p);
        }
        crate::viewport::resized(window, p.width, p.height);
    }

    /// On the main thread, once the viewport (and its wgpu surface) is gone: the subsurface goes.
    pub fn stop(window: &tauri::Window) {
        use gtk::prelude::*;
        let Some(layer) = layers().lock().unwrap().remove(window.label()) else { return };
        if let Ok(vbox) = window.default_vbox() {
            for h in layer.handlers {
                vbox.disconnect(h);
            }
        }
        drop(layer.surface);
        if let Ok(top) = window.gtk_window() {
            top.queue_draw();
        }
    }
}
