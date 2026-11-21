//! Generates the protocol types from `native/proto`, with a protobuf compiler in
//! Rust (protox), so no `protoc` is needed to build.

fn main() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../proto");
    let files = [root.join("heat3d/v1/heat3d.proto"), root.join("heat3d/session/v1/session.proto")];
    for f in &files {
        println!("cargo:rerun-if-changed={}", f.display());
    }
    let fds = protox::compile(&files, [&root]).expect("protocol schema compiles");
    prost_build::Config::new().compile_fds(fds).expect("protocol types generate");
}
