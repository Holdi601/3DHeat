//! The gateway's sandbox holds: a gateway process started as `serve` starts
//! it cannot read or list the user's files, write there, reach this machine
//! over the network, listen, or start a program (`3dheat sandbox-check`).

#[test]
fn a_taken_over_gateway_can_do_nothing() {
    let out = std::process::Command::new(env!("CARGO_BIN_EXE_3dheat"))
        .arg("sandbox-check")
        .output()
        .expect("3dheat runs");
    let text = String::from_utf8_lossy(&out.stdout);
    println!("{text}");
    if cfg!(target_os = "linux") && text.contains("landlock: not available") {
        // A kernel without Landlock: seccomp still holds the network and programs.
        for l in [
            "connect to this machine: blocked",
            "be reached on a port of its own: blocked",
            "start a program: blocked",
        ] {
            assert!(text.contains(l), "{l}");
        }
        return;
    }
    assert!(out.status.success(), "something was allowed:\n{text}");
}
