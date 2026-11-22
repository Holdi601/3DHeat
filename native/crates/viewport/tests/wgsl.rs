//! Every shader the viewport takes from the engine compiles with naga (no GPU needed).

#[test]
fn shaders_validate() {
    let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("wgsl");
    let mut n = 0;
    for entry in std::fs::read_dir(&dir).unwrap() {
        let path = entry.unwrap().path();
        if path.extension().and_then(|e| e.to_str()) != Some("wgsl") {
            continue;
        }
        let src = std::fs::read_to_string(&path).unwrap();
        let module = naga::front::wgsl::parse_str(&src).unwrap_or_else(|e| panic!("{}: {}", path.display(), e.emit_to_string(&src)));
        naga::valid::Validator::new(naga::valid::ValidationFlags::all(), naga::valid::Capabilities::all())
            .validate(&module)
            .unwrap_or_else(|e| panic!("{}: {}", path.display(), e.emit_to_string(&src)));
        n += 1;
    }
    assert!(n >= 10, "only {n} shaders");
}
