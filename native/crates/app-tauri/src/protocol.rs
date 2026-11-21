//! The `heat3d` scheme: `POST heat3d://core/v1` (on Windows `http://heat3d.localhost/v1`)
//! with one protocol frame as the body, answered with one frame.
//!
//! The page's origin is the app's own (`tauri.localhost`), so the answer allows
//! it explicitly, and a preflight is answered too.

use heat3d_core::service::Core;
use tauri::http::{header, Method, Request, Response, StatusCode};

pub fn answer(core: &Core, request: Request<Vec<u8>>) -> Response<Vec<u8>> {
    let base = Response::builder()
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .header(header::ACCESS_CONTROL_ALLOW_METHODS, "POST, OPTIONS")
        .header(header::ACCESS_CONTROL_ALLOW_HEADERS, "content-type")
        .header(header::ACCESS_CONTROL_MAX_AGE, "86400");
    let result = match *request.method() {
        Method::OPTIONS => base.status(StatusCode::NO_CONTENT).body(Vec::new()),
        Method::POST => base
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, "application/x-heat3d-frame")
            .body(core.handle(request.body())),
        _ => base.status(StatusCode::METHOD_NOT_ALLOWED).body(Vec::new()),
    };
    result.unwrap_or_else(|_| Response::new(Vec::new()))
}
