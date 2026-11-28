//! The video fallback's pictures (Stage 8): session members' views drawn by the
//! main window's native viewport (`heat3d_viewport::video`), handed to their
//! streams (`heat3d_video`). Without the viewport (Settings > Native viewport
//! off, or not started yet) a member's offer is refused with a reason.

use std::sync::Arc;

use heat3d_video::{Frame, FrameSink, FrameSource, ViewParams};
use heat3d_viewport::{MemberCamera, Msg, VideoFrame, VideoSink};
use tauri::{AppHandle, Manager};

use crate::viewport::Viewports;

pub struct AppVideo {
    pub app: AppHandle,
}

fn camera(v: &ViewParams) -> MemberCamera {
    MemberCamera { view: v.view, fov: v.fov, ortho: v.ortho, ortho_height: v.ortho_height, width: v.width, height: v.height, follow_host: v.follow_host }
}

impl AppVideo {
    /// The main window's viewport (the one the host looks at), or any running one.
    fn with<R>(&self, f: impl FnOnce(&heat3d_viewport::Viewport) -> R) -> Option<R> {
        let all = self.app.state::<Viewports>();
        let map = all.0.lock().unwrap();
        map.get("main").or_else(|| map.values().next()).map(f)
    }
}

impl FrameSource for AppVideo {
    fn open(&self, id: u64, view: ViewParams, fps: u32, sink: FrameSink) -> Result<(), String> {
        let s: VideoSink = Arc::new(move |f: VideoFrame| sink(Frame { width: f.width, height: f.height, nv12: f.nv12, seq: f.seq, sent_ms: f.sent_ms, drawn: f.drawn, render_ms: f.render_ms }));
        self.with(|v| v.send(Msg::VideoOpen { id, cam: camera(&view), seq: view.seq, sent_ms: view.sent_ms, fps, sink: s }))
            .ok_or_else(|| "the host's native viewport is not running (Settings > Native viewport)".to_owned())
    }

    fn update(&self, id: u64, view: ViewParams) {
        self.with(|v| v.send(Msg::VideoCamera { id, cam: camera(&view), seq: view.seq, sent_ms: view.sent_ms }));
    }

    fn set_fps(&self, id: u64, fps: u32) {
        self.with(|v| v.send(Msg::VideoFps(id, fps)));
    }

    fn close(&self, id: u64) {
        self.with(|v| v.send(Msg::VideoClose(id)));
    }

    fn ready(&self) -> bool {
        self.with(|_| ()).is_some()
    }

    fn host_frames(&self) -> Option<(f32, f32, f32)> {
        self.with(|v| v.snapshot.lock().host_frames).flatten()
    }

    fn saturated(&self) -> bool {
        self.with(|v| v.snapshot.lock().video_saturated).unwrap_or(false)
    }
}
