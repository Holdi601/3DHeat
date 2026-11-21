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
