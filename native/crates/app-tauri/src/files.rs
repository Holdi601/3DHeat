//! Files the page picked or dropped, handed to the core by path.
//!
//! In the page a picked file is a `File` and stays one, so everything that reads
//! it works as in a browser. On Windows the page can also post the same `File`
//! objects to the host (`chrome.webview.postMessageWithAdditionalObjects`), and
//! WebView2 gives the host each one's path. The core registers each path under a
//! token and posts the tokens back; the page then names the files by token in
//! its requests, and the core maps them in place instead of the page reading them.
//!
//! The message is `{"cmd":"heat3d_files","payload":{"id":N},...}`, shaped as a
//! Tauri message so that Tauri's own handler of the same event passes it over
//! quietly (its key is not Tauri's); the answer is
//! `{"heat3d":"files","id":N,"tokens":["f1",...]}`, `null` for an object that is
//! not a file on disk. Elsewhere (Linux) nothing is attached: the page reads its
//! files itself, as it does in a browser.

use std::sync::Arc;

use heat3d_core::service::Core;
use tauri::WebviewWindow;

#[cfg(windows)]
pub fn attach(window: &WebviewWindow, core: Arc<Core>) {
    let _ = window.with_webview(move |wv| {
        // SAFETY: WebView2 COM calls on the thread that owns the controller.
        unsafe { install(wv.controller(), core) }.unwrap_or_else(|e| eprintln!("file handover not available: {e}"));
    });
}

#[cfg(not(windows))]
pub fn attach(_window: &WebviewWindow, _core: Arc<Core>) {}

#[cfg(windows)]
unsafe fn install(
    controller: webview2_com::Microsoft::Web::WebView2::Win32::ICoreWebView2Controller,
    core: Arc<Core>,
) -> windows_core::Result<()> {
    use webview2_com::Microsoft::Web::WebView2::Win32::{
        ICoreWebView2File, ICoreWebView2WebMessageReceivedEventArgs2,
    };
    use webview2_com::{take_pwstr, WebMessageReceivedEventHandler};
    use windows_core::{Interface, HSTRING, PWSTR};

    let webview = controller.CoreWebView2()?;
    let mut token = 0i64;
    webview.add_WebMessageReceived(
        &WebMessageReceivedEventHandler::create(Box::new(move |sender, args| {
            let (Some(sender), Some(args)) = (sender, args) else { return Ok(()) };
            let mut text = PWSTR::null();
            if args.TryGetWebMessageAsString(&mut text).is_err() {
                return Ok(());
            }
            let text = take_pwstr(text);
            let Ok(msg) = serde_json::from_str::<serde_json::Value>(&text) else { return Ok(()) };
            if msg.get("cmd").and_then(|v| v.as_str()) != Some("heat3d_files") {
                return Ok(());
            }
            let id = msg.pointer("/payload/id").cloned().unwrap_or(serde_json::Value::Null);
            let mut tokens = Vec::new();
            if let Ok(args2) = args.cast::<ICoreWebView2WebMessageReceivedEventArgs2>() {
                if let Ok(objects) = args2.AdditionalObjects() {
                    let mut n = 0u32;
                    objects.Count(&mut n)?;
                    for i in 0..n {
                        let path = objects.GetValueAtIndex(i).ok().and_then(|o| o.cast::<ICoreWebView2File>().ok()).and_then(|f| {
                            let mut p = PWSTR::null();
                            f.Path(&mut p).ok()?;
                            Some(take_pwstr(p))
                        });
                        tokens.push(match path {
                            Some(p) if !p.is_empty() => serde_json::Value::String(core.register_file(p.into())),
                            _ => serde_json::Value::Null,
                        });
                    }
                }
            }
            let reply = serde_json::json!({ "heat3d": "files", "id": id, "tokens": tokens });
            sender.PostWebMessageAsJson(&HSTRING::from(reply.to_string()))?;
            Ok(())
        })),
        &mut token,
    )?;
    Ok(())
}
