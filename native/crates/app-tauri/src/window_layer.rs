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

/// Once the window exists: the native viewport, when the page starts one, follows its size.
pub fn attach(window: &WebviewWindow) {
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

#[cfg(target_os = "linux")]
#[allow(dead_code)]
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
        _conn: Connection,
        pub surface: WlSurface,
        _sub: WlSubsurface,
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
            Some(Self { _conn: conn, surface, _sub: sub })
        }
    }
}
