//! Bulk bytes into the page through WebView2 shared memory, for measuring the
//! fastest way the app has: the core writes into a buffer the page then sees as an
//! `ArrayBuffer`, with no copy on the way (`chrome.webview` `sharedbufferreceived`).
//!
//! Windows only, and main thread only on the page's side. Measured beside the
//! loopback server the window uses today (`docs/native-app.md`); the chunk path of
//! Stage 2b/5 is where it pays.

use tauri::WebviewWindow;

/// Sends `bytes` of shared memory to the page, tagged `{"heat3d":"shared","id":id}`.
#[tauri::command]
pub fn shared_echo(window: WebviewWindow, bytes: u64, id: u32) -> Result<(), String> {
    #[cfg(windows)]
    {
        window
            .with_webview(move |wv| {
                // SAFETY: WebView2 COM calls on the thread that owns the controller.
                if let Err(e) = unsafe { post(wv.controller(), bytes, id) } {
                    eprintln!("shared buffer: {e}");
                }
            })
            .map_err(|e| e.to_string())
    }
    #[cfg(not(windows))]
    {
        let _ = (window, bytes, id);
        Err("shared buffers are a WebView2 feature".into())
    }
}

#[cfg(windows)]
unsafe fn post(
    controller: webview2_com::Microsoft::Web::WebView2::Win32::ICoreWebView2Controller,
    bytes: u64,
    id: u32,
) -> windows_core::Result<()> {
    use webview2_com::Microsoft::Web::WebView2::Win32::{
        ICoreWebView2Environment12, ICoreWebView2_17, ICoreWebView2_2, COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_ONLY,
    };
    use windows_core::{Interface, HSTRING};

    let webview = controller.CoreWebView2()?;
    let env: ICoreWebView2Environment12 = webview.cast::<ICoreWebView2_2>()?.Environment()?.cast()?;
    let buf = env.CreateSharedBuffer(bytes)?;
    let mut ptr = std::ptr::null_mut();
    buf.Buffer(&mut ptr)?;
    // Written as the core would write a chunk: every byte touched.
    let data = std::slice::from_raw_parts_mut(ptr, bytes as usize);
    for (i, b) in data.iter_mut().enumerate().step_by(4096) {
        *b = i as u8;
    }
    let meta = HSTRING::from(format!(r#"{{"heat3d":"shared","id":{id}}}"#));
    webview.cast::<ICoreWebView2_17>()?.PostSharedBufferToScript(&buf, COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_ONLY, &meta)?;
    // The page holds its own reference until it releases the buffer.
    drop(buf);
    Ok(())
}

/// The core's shared memory (`heat3d_core::dataset::SharedSink`) as WebView2
/// shared buffers: columns and chunks reach the page with no copy on the way.
///
/// WebView2 objects belong to the window's thread, so every buffer is made,
/// posted and released there (`with_webview`), and kept in a table on that
/// thread; the core holds only the memory's address, length and the buffer's
/// number. A buffer is posted read-write: the page's arrays are ordinary
/// arrays to the page, and some of its code writes into them.
#[cfg(windows)]
pub mod sink {
    use std::cell::RefCell;
    use std::collections::HashMap;
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::sync::{mpsc, Arc};

    use anyhow::{anyhow, Result};
    use heat3d_core::dataset::{SharedMemory, SharedSink};
    use tauri::WebviewWindow;
    use webview2_com::Microsoft::Web::WebView2::Win32::ICoreWebView2SharedBuffer;

    thread_local! {
        /// The window thread's buffers, by number.
        static BUFFERS: RefCell<HashMap<u64, ICoreWebView2SharedBuffer>> = RefCell::new(HashMap::new());
    }

    static NEXT: AtomicU64 = AtomicU64::new(1);

    pub struct WebviewSink {
        pub window: WebviewWindow,
    }

    struct Memory {
        key: u64,
        ptr: usize,
        len: usize,
        window: WebviewWindow,
    }

    impl SharedMemory for Memory {
        fn ptr(&self) -> *mut u8 {
            self.ptr as *mut u8
        }

        fn len(&self) -> usize {
            self.len
        }
    }

    impl Drop for Memory {
        fn drop(&mut self) {
            // Released on the window's thread; the page keeps its own reference until it lets go.
            let key = self.key;
            let _ = self.window.with_webview(move |_| {
                BUFFERS.with(|b| b.borrow_mut().remove(&key));
            });
        }
    }

    impl SharedSink for WebviewSink {
        fn create(&self, bytes: usize) -> Result<Arc<dyn SharedMemory>> {
            let key = NEXT.fetch_add(1, Ordering::Relaxed);
            let (tx, rx) = mpsc::channel::<Result<usize, String>>();
            self.window
                .with_webview(move |wv| {
                    // SAFETY: WebView2 COM calls on the thread that owns the controller.
                    let r = unsafe { make(wv.controller(), bytes as u64) };
                    let _ = tx.send(match r {
                        Ok((buf, ptr)) => {
                            BUFFERS.with(|b| b.borrow_mut().insert(key, buf));
                            Ok(ptr as usize)
                        }
                        Err(e) => Err(format!("{e}")),
                    });
                })
                .map_err(|e| anyhow!("{e}"))?;
            let ptr = rx.recv().map_err(|_| anyhow!("the window went away"))?.map_err(|e| anyhow!("shared buffer of {bytes} bytes: {e}"))?;
            Ok(Arc::new(Memory { key, ptr, len: bytes, window: self.window.clone() }))
        }

        fn post(&self, mem: &Arc<dyn SharedMemory>, id: u64) -> Result<()> {
            // Only memory this sink made is posted: find it by address.
            let ptr = mem.ptr() as usize;
            let (tx, rx) = mpsc::channel::<Result<(), String>>();
            self.window
                .with_webview(move |wv| {
                    let r = BUFFERS.with(|b| {
                        let b = b.borrow();
                        let buf = b.values().find(|buf| {
                            let mut p = std::ptr::null_mut();
                            // SAFETY: a live buffer of this thread.
                            unsafe { buf.Buffer(&mut p) }.is_ok() && p as usize == ptr
                        });
                        match buf {
                            // SAFETY: WebView2 COM calls on the thread that owns the controller.
                            Some(buf) => unsafe { post_buffer(wv.controller(), buf, id) }.map_err(|e| format!("{e}")),
                            None => Err("no such buffer".into()),
                        }
                    });
                    let _ = tx.send(r);
                })
                .map_err(|e| anyhow!("{e}"))?;
            rx.recv().map_err(|_| anyhow!("the window went away"))?.map_err(|e| anyhow!("posting a shared buffer: {e}"))
        }
    }

    unsafe fn make(
        controller: webview2_com::Microsoft::Web::WebView2::Win32::ICoreWebView2Controller,
        bytes: u64,
    ) -> windows_core::Result<(ICoreWebView2SharedBuffer, *mut u8)> {
        use webview2_com::Microsoft::Web::WebView2::Win32::{ICoreWebView2Environment12, ICoreWebView2_2};
        use windows_core::Interface;
        let webview = controller.CoreWebView2()?;
        let env: ICoreWebView2Environment12 = webview.cast::<ICoreWebView2_2>()?.Environment()?.cast()?;
        let buf = env.CreateSharedBuffer(bytes)?;
        let mut ptr = std::ptr::null_mut();
        buf.Buffer(&mut ptr)?;
        Ok((buf, ptr))
    }

    unsafe fn post_buffer(
        controller: webview2_com::Microsoft::Web::WebView2::Win32::ICoreWebView2Controller,
        buf: &ICoreWebView2SharedBuffer,
        id: u64,
    ) -> windows_core::Result<()> {
        use webview2_com::Microsoft::Web::WebView2::Win32::{ICoreWebView2_17, COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_WRITE};
        use windows_core::{Interface, HSTRING};
        let webview = controller.CoreWebView2()?;
        let meta = HSTRING::from(format!(r#"{{"heat3d":"shared","id":{id}}}"#));
        webview.cast::<ICoreWebView2_17>()?.PostSharedBufferToScript(buf, COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_WRITE, &meta)
    }

    /// Lets `core` hand columns and chunks to `window` in shared memory.
    pub fn attach(window: &WebviewWindow, core: &heat3d_core::service::Core) {
        core.set_shared_sink(Arc::new(WebviewSink { window: window.clone() }));
    }
}
