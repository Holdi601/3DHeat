//! Compiles `native/proto/heat3d/session/v1/session.proto` with protox, a
//! protobuf compiler in Rust, so building needs no `protoc`.

fn main() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../proto");
    let file = root.join("heat3d/session/v1/session.proto");
    println!("cargo:rerun-if-changed={}", file.display());
    let fds = protox::compile([&file], [&root]).expect("session.proto compiles");
    prost_build::Config::new()
        .compile_fds(fds)
        .expect("prost generates the session types");
}
