//! Any text as a session file's documents and as an operation's JSON: checked, never a panic.

#![no_main]

use heat3d_session::doc::Doc;
use heat3d_session::session::{Config, Session};
use heat3d_session::text;
use libfuzzer_sys::fuzz_target;

fuzz_target!(|data: &[u8]| {
    let Ok(s) = std::str::from_utf8(data) else {
        return;
    };
    let _ = text::object(s);
    if let Ok(d) = Doc::from_json(s) {
        let _ = Doc::from_json(&d.to_json()).expect("its own JSON reads back");
    }
    let mut session = Session::new(Config::default(), "h".repeat(64));
    let _ = session.load_docs(s);
    let _ = text::name(s, "x");
});
