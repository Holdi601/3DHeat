//! The session server's gateway (TLS, HTTP, WebSocket, the session's rules:
//! everything a stranger's bytes reach) runs as a process of its own that
//! has given up what it does not need. The core starts it with `spawn` and
//! talks to it over its standard input and output; the gateway calls
//! `lockdown` before it reads anything from the network.
//!
//! What each system takes away (docs/multiplayer.md, "Security"):
//!
//! - **Windows**: an **AppContainer** without a single capability (no
//!   network at all: the core accepts the connections and relays the bytes;
//!   none of the user's files, folders or registry, read or write; only what
//!   Windows grants every app package, such as its own system files; low
//!   integrity), a **job** (one process: no child processes; 2 GiB of memory;
//!   no clipboard, desktop or system settings; killed with the core), the
//!   child-process policy (no process creation at all, also through other
//!   APIs), mitigations (no dynamic code, no images from the network or of
//!   low integrity, no legacy extension points, strict handle checks, no
//!   fonts), and an environment of its system folders only. Where an AppContainer
//!   cannot be made, a restricted token at low integrity instead (it could
//!   then still read what the user can read).
//! - **Linux**: `no_new_privs`, **Landlock** with no access granted (no file
//!   read, write or execute; on kernels 6.7+ no TCP bind or connect),
//!   **seccomp** refusing sockets, `exec`, `ptrace`, namespaces, mounts,
//!   kernel modules, BPF and the like, no core dumps, an empty environment,
//!   and a different user (`nobody`) when started as root.
//! - Elsewhere: an ordinary child process with an empty environment.

use std::io;
use std::path::Path;
use tokio::io::{AsyncRead, AsyncWrite};

/// The gateway, started.
pub struct Child {
    pub stdin: Box<dyn AsyncWrite + Send + Unpin>,
    pub stdout: Box<dyn AsyncRead + Send + Unpin>,
    pub stderr: Box<dyn AsyncRead + Send + Unpin>,
    imp: imp::Proc,
}

impl Child {
    /// Ends it (it also ends when the core does).
    pub fn kill(&mut self) {
        self.imp.kill();
    }

    /// Waits until it has exited.
    pub async fn wait(&mut self) {
        self.imp.wait().await;
    }
}

/// Starts `exe args` as the locked-down gateway.
pub fn spawn(exe: &Path, args: &[&str]) -> io::Result<Child> {
    imp::spawn(exe, args)
}

/// How the last gateway started was locked down, as the core saw it (empty
/// where the gateway says it itself).
pub fn started_as() -> &'static str {
    #[cfg(windows)]
    {
        *imp::HOW.lock().unwrap()
    }
    #[cfg(not(windows))]
    {
        ""
    }
}

/// In the gateway, before it handles anything from the network: gives up
/// what is left to give up. Returns what is in force, in words.
pub fn lockdown() -> Result<String, String> {
    imp::lockdown()
}

#[cfg(windows)]
mod imp {
    use super::Child;
    use std::io;
    use std::os::windows::ffi::OsStrExt;
    use std::os::windows::io::FromRawHandle;
    use std::path::Path;
    use std::ptr::null_mut;
    use windows_sys::Win32::Foundation::*;
    use windows_sys::Win32::Security::Authorization::ConvertStringSidToSidW;
    use windows_sys::Win32::Security::*;
    use windows_sys::Win32::System::JobObjects::*;
    use windows_sys::Win32::System::Pipes::CreatePipe;
    use windows_sys::Win32::System::Threading::*;

    const SE_GROUP_INTEGRITY: u32 = 0x20;
    const CHILD_PROCESS_RESTRICTED: u32 = 0x1;
    const STRICT_HANDLE_CHECKS: u64 = 1 << 24;
    const EXTENSION_POINT_DISABLE: u64 = 1 << 32;
    const PROHIBIT_DYNAMIC_CODE: u64 = 1 << 36;
    const FONT_DISABLE: u64 = 1 << 48;
    const IMAGE_LOAD_NO_REMOTE: u64 = 1 << 52;
    const IMAGE_LOAD_NO_LOW_LABEL: u64 = 1 << 56;
    const MEMORY_LIMIT: usize = 2 << 30;

    /// A handle that is closed when dropped (and may cross threads).
    struct Owned(usize);
    impl Owned {
        fn h(&self) -> HANDLE {
            self.0 as HANDLE
        }
    }
    impl Drop for Owned {
        fn drop(&mut self) {
            if self.0 != 0 {
                unsafe { CloseHandle(self.0 as HANDLE) };
            }
        }
    }

    pub struct Proc {
        process: Owned,
        job: Option<Owned>,
    }

    impl Proc {
        pub fn kill(&mut self) {
            unsafe { TerminateProcess(self.process.h(), 1) };
            // Closing the job kills whatever is left in it.
            self.job = None;
        }

        pub async fn wait(&mut self) {
            let h = self.process.0;
            let _ = tokio::task::spawn_blocking(move || unsafe {
                WaitForSingleObject(h as HANDLE, INFINITE);
            })
            .await;
        }
    }

    fn last(what: &str) -> io::Error {
        let e = io::Error::last_os_error();
        io::Error::new(e.kind(), format!("{what}: {e}"))
    }

    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain([0]).collect()
    }

    fn sid(s: &str) -> io::Result<PSID> {
        let mut p: PSID = null_mut();
        if unsafe { ConvertStringSidToSidW(wide(s).as_ptr(), &mut p) } == 0 {
            return Err(last("SID"));
        }
        Ok(p)
    }

    /// The core's own token, restricted: no privileges, Administrators deny-only, low integrity.
    fn restricted_token() -> io::Result<Owned> {
        unsafe {
            let mut tok: HANDLE = null_mut();
            if OpenProcessToken(
                GetCurrentProcess(),
                TOKEN_DUPLICATE | TOKEN_QUERY | TOKEN_ASSIGN_PRIMARY | TOKEN_ADJUST_DEFAULT,
                &mut tok,
            ) == 0
            {
                return Err(last("OpenProcessToken"));
            }
            let tok = Owned(tok as usize);
            let admins = sid("S-1-5-32-544")?;
            let deny = [SID_AND_ATTRIBUTES {
                Sid: admins,
                Attributes: 0,
            }];
            let mut rt: HANDLE = null_mut();
            let ok = CreateRestrictedToken(
                tok.h(),
                DISABLE_MAX_PRIVILEGE,
                deny.len() as u32,
                deny.as_ptr(),
                0,
                null_mut(),
                0,
                null_mut(),
                &mut rt,
            );
            LocalFree(admins as _);
            if ok == 0 {
                return Err(last("CreateRestrictedToken"));
            }
            let rt = Owned(rt as usize);
            let low = sid("S-1-16-4096")?;
            let label = TOKEN_MANDATORY_LABEL {
                Label: SID_AND_ATTRIBUTES {
                    Sid: low,
                    Attributes: SE_GROUP_INTEGRITY,
                },
            };
            let ok = SetTokenInformation(
                rt.h(),
                TokenIntegrityLevel,
                &label as *const _ as _,
                std::mem::size_of::<TOKEN_MANDATORY_LABEL>() as u32 + GetLengthSid(low),
            );
            LocalFree(low as _);
            if ok == 0 {
                return Err(last("SetTokenInformation(integrity)"));
            }
            Ok(rt)
        }
    }

    fn job() -> io::Result<Owned> {
        unsafe {
            let job = CreateJobObjectW(null_mut(), null_mut());
            if job.is_null() {
                return Err(last("CreateJobObject"));
            }
            let job = Owned(job as usize);
            let mut lim: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = std::mem::zeroed();
            lim.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
                | JOB_OBJECT_LIMIT_ACTIVE_PROCESS
                | JOB_OBJECT_LIMIT_PROCESS_MEMORY
                | JOB_OBJECT_LIMIT_DIE_ON_UNHANDLED_EXCEPTION;
            lim.BasicLimitInformation.ActiveProcessLimit = 1;
            lim.ProcessMemoryLimit = MEMORY_LIMIT;
            if SetInformationJobObject(
                job.h(),
                JobObjectExtendedLimitInformation,
                &lim as *const _ as _,
                std::mem::size_of_val(&lim) as u32,
            ) == 0
            {
                return Err(last("job limits"));
            }
            let ui = JOBOBJECT_BASIC_UI_RESTRICTIONS {
                UIRestrictionsClass: JOB_OBJECT_UILIMIT_DESKTOP
                    | JOB_OBJECT_UILIMIT_DISPLAYSETTINGS
                    | JOB_OBJECT_UILIMIT_EXITWINDOWS
                    | JOB_OBJECT_UILIMIT_GLOBALATOMS
                    | JOB_OBJECT_UILIMIT_HANDLES
                    | JOB_OBJECT_UILIMIT_READCLIPBOARD
                    | JOB_OBJECT_UILIMIT_SYSTEMPARAMETERS
                    | JOB_OBJECT_UILIMIT_WRITECLIPBOARD,
            };
            if SetInformationJobObject(
                job.h(),
                JobObjectBasicUIRestrictions,
                &ui as *const _ as _,
                std::mem::size_of_val(&ui) as u32,
            ) == 0
            {
                return Err(last("job UI limits"));
            }
            Ok(job)
        }
    }

    /// A pipe: (read end, write end); `child_reads` says which end the child gets (inheritable).
    fn pipe(child_reads: bool) -> io::Result<(Owned, Owned)> {
        unsafe {
            let sa = SECURITY_ATTRIBUTES {
                nLength: std::mem::size_of::<SECURITY_ATTRIBUTES>() as u32,
                lpSecurityDescriptor: null_mut(),
                bInheritHandle: 1,
            };
            let (mut r, mut w) = (null_mut(), null_mut());
            if CreatePipe(&mut r, &mut w, &sa, 1 << 20) == 0 {
                return Err(last("CreatePipe"));
            }
            let (r, w) = (Owned(r as usize), Owned(w as usize));
            // The core's end is not inherited.
            let mine = if child_reads { w.h() } else { r.h() };
            SetHandleInformation(mine, HANDLE_FLAG_INHERIT, 0);
            Ok((r, w))
        }
    }

    fn file(h: Owned) -> tokio::fs::File {
        let raw = h.0;
        std::mem::forget(h);
        tokio::fs::File::from_std(unsafe { std::fs::File::from_raw_handle(raw as _) })
    }

    /// The AppContainer's SID ("3DHeat.SessionGateway", made once per user).
    fn app_container() -> io::Result<PSID> {
        use windows_sys::Win32::Security::Isolation::{
            CreateAppContainerProfile, DeriveAppContainerSidFromAppContainerName,
        };
        let name = wide("3DHeat.SessionGateway");
        let shown = wide("3DHeat session gateway");
        let mut sid: PSID = null_mut();
        unsafe {
            if CreateAppContainerProfile(
                name.as_ptr(),
                shown.as_ptr(),
                shown.as_ptr(),
                null_mut(),
                0,
                &mut sid,
            ) != 0
            {
                // Made before: the same name gives the same SID.
                let hr = DeriveAppContainerSidFromAppContainerName(name.as_ptr(), &mut sid);
                if hr != 0 {
                    return Err(io::Error::other(format!("AppContainer: {hr:#x}")));
                }
            }
        }
        Ok(sid)
    }

    /// Which way the gateway was locked down the last time, in words.
    pub static HOW: std::sync::Mutex<&'static str> = std::sync::Mutex::new("");

    pub fn spawn(exe: &Path, args: &[&str]) -> io::Result<Child> {
        let container = if std::env::var_os("HEAT3D_SANDBOX_NO_APPCONTAINER").is_some() {
            None
        } else {
            app_container().ok()
        };
        let token = match container {
            Some(_) => None,
            None => Some(restricted_token()?),
        };
        let job = job()?;
        let (in_r, in_w) = pipe(true)?;
        let (out_r, out_w) = pipe(false)?;
        let (err_r, err_w) = pipe(false)?;
        unsafe {
            let mut size = 0usize;
            InitializeProcThreadAttributeList(null_mut(), 4, 0, &mut size);
            let mut buf = vec![0u8; size];
            let al = buf.as_mut_ptr() as LPPROC_THREAD_ATTRIBUTE_LIST;
            if InitializeProcThreadAttributeList(al, 4, 0, &mut size) == 0 {
                return Err(last("attribute list"));
            }
            // Only the three pipe ends are inherited, nothing else of the core's.
            let handles = [in_r.h(), out_w.h(), err_w.h()];
            let child_policy: u32 = CHILD_PROCESS_RESTRICTED;
            let mitigations: [u64; 2] = [
                STRICT_HANDLE_CHECKS
                    | EXTENSION_POINT_DISABLE
                    | PROHIBIT_DYNAMIC_CODE
                    | FONT_DISABLE
                    | IMAGE_LOAD_NO_REMOTE
                    | IMAGE_LOAD_NO_LOW_LABEL,
                0,
            ];
            let set = |attr: usize, v: *const core::ffi::c_void, n: usize| {
                UpdateProcThreadAttribute(al, 0, attr, v, n, null_mut(), null_mut()) != 0
            };
            // No capabilities at all: not even the network.
            let mut caps: SECURITY_CAPABILITIES = std::mem::zeroed();
            caps.AppContainerSid = container.unwrap_or(null_mut());
            let ok = set(
                PROC_THREAD_ATTRIBUTE_HANDLE_LIST as usize,
                handles.as_ptr() as _,
                std::mem::size_of_val(&handles),
            ) && set(
                PROC_THREAD_ATTRIBUTE_CHILD_PROCESS_POLICY as usize,
                &child_policy as *const u32 as _,
                4,
            ) && set(
                PROC_THREAD_ATTRIBUTE_MITIGATION_POLICY as usize,
                mitigations.as_ptr() as _,
                16,
            ) && (container.is_none()
                || set(
                    PROC_THREAD_ATTRIBUTE_SECURITY_CAPABILITIES as usize,
                    &caps as *const _ as _,
                    std::mem::size_of_val(&caps),
                ));
            if !ok {
                DeleteProcThreadAttributeList(al);
                return Err(last("process attributes"));
            }
            let mut si: STARTUPINFOEXW = std::mem::zeroed();
            si.StartupInfo.cb = std::mem::size_of::<STARTUPINFOEXW>() as u32;
            si.StartupInfo.dwFlags = STARTF_USESTDHANDLES;
            si.StartupInfo.hStdInput = in_r.h();
            si.StartupInfo.hStdOutput = out_w.h();
            si.StartupInfo.hStdError = err_w.h();
            si.lpAttributeList = al;
            let exe_w: Vec<u16> = exe.as_os_str().encode_wide().chain([0]).collect();
            let mut cmd = format!("\"{}\"", exe.display());
            for a in args {
                cmd.push(' ');
                cmd.push_str(a);
            }
            let mut cmd_w = wide(&cmd);
            // Nothing of the core's environment (it may hold the password): only what Windows
            // itself needs to start a process in an AppContainer (its folders; sorted).
            let mut env: Vec<u16> = Vec::new();
            for k in [
                "LOCALAPPDATA",
                "SystemDrive",
                "SystemRoot",
                "TEMP",
                "TMP",
                "USERPROFILE",
                "windir",
            ] {
                if let Ok(v) = std::env::var(k) {
                    env.extend(format!("{k}={v}").encode_utf16());
                    env.push(0);
                }
            }
            env.extend([0, 0]);
            let mut pi: PROCESS_INFORMATION = std::mem::zeroed();
            let flags = EXTENDED_STARTUPINFO_PRESENT
                | CREATE_SUSPENDED
                | DETACHED_PROCESS
                | CREATE_UNICODE_ENVIRONMENT;
            let ok = match &token {
                Some(t) => CreateProcessAsUserW(
                    t.h(),
                    exe_w.as_ptr(),
                    cmd_w.as_mut_ptr(),
                    null_mut(),
                    null_mut(),
                    1,
                    flags,
                    env.as_ptr() as _,
                    null_mut(),
                    &si.StartupInfo,
                    &mut pi,
                ),
                None => CreateProcessW(
                    exe_w.as_ptr(),
                    cmd_w.as_mut_ptr(),
                    null_mut(),
                    null_mut(),
                    1,
                    flags,
                    env.as_ptr() as _,
                    null_mut(),
                    &si.StartupInfo,
                    &mut pi,
                ),
            };
            DeleteProcThreadAttributeList(al);
            if ok == 0 {
                return Err(last("CreateProcessAsUser"));
            }
            let process = Owned(pi.hProcess as usize);
            let thread = Owned(pi.hThread as usize);
            if AssignProcessToJobObject(job.h(), process.h()) == 0 {
                TerminateProcess(process.h(), 1);
                return Err(last("AssignProcessToJobObject"));
            }
            ResumeThread(thread.h());
            drop((in_r, out_w, err_w));
            *HOW.lock().unwrap() = if container.is_some() {
                "windows: AppContainer without capabilities (no network, none of the user's files), job (1 process, 2 GiB, no UI), no child processes, mitigations"
            } else {
                "windows: restricted token at low integrity (no AppContainer here), job (1 process, 2 GiB, no UI), no child processes, mitigations"
            };
            Ok(Child {
                stdin: Box::new(file(in_w)),
                stdout: Box::new(file(out_r)),
                stderr: Box::new(file(err_r)),
                imp: Proc {
                    process,
                    job: Some(job),
                },
            })
        }
    }

    pub fn lockdown() -> Result<String, String> {
        // The container, the job and the policies were set by the core when it started this process.
        Ok("windows: as started by the core".into())
    }
}

#[cfg(target_os = "linux")]
mod imp {
    use super::Child;
    use std::io;
    use std::path::Path;

    pub struct Proc {
        child: tokio::process::Child,
    }

    impl Proc {
        pub fn kill(&mut self) {
            let _ = self.child.start_kill();
        }

        pub async fn wait(&mut self) {
            let _ = self.child.wait().await;
        }
    }

    pub fn spawn(exe: &Path, args: &[&str]) -> io::Result<Child> {
        use std::process::Stdio;
        let mut cmd = tokio::process::Command::new(exe);
        cmd.args(args)
            .env_clear()
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);
        // Started as root: not as root.
        if unsafe { libc::geteuid() } == 0 {
            cmd.uid(65534).gid(65534);
        }
        let mut child = cmd.spawn()?;
        let stdin = child
            .stdin
            .take()
            .ok_or_else(|| io::Error::other("no stdin"))?;
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| io::Error::other("no stdout"))?;
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| io::Error::other("no stderr"))?;
        Ok(Child {
            stdin: Box::new(stdin),
            stdout: Box::new(stdout),
            stderr: Box::new(stderr),
            imp: Proc { child },
        })
    }

    pub fn lockdown() -> Result<String, String> {
        use landlock::{Access, AccessFs, AccessNet, Ruleset, RulesetAttr, RulesetStatus, ABI};
        let mut said = Vec::new();
        // No core dumps (they would hold the session's secrets), no files written.
        unsafe {
            let zero = libc::rlimit {
                rlim_cur: 0,
                rlim_max: 0,
            };
            libc::setrlimit(libc::RLIMIT_CORE, &zero);
            libc::setrlimit(libc::RLIMIT_FSIZE, &zero);
        }
        // Landlock: every file access and TCP bind/connect handled, none allowed.
        let abi = ABI::V5;
        let status = Ruleset::default()
            .handle_access(AccessFs::from_all(abi))
            .and_then(|r| r.handle_access(AccessNet::from_all(abi)))
            .and_then(|r| r.create())
            .and_then(|r| r.restrict_self())
            .map_err(|e| format!("landlock: {e}"))?;
        said.push(match status.ruleset {
            RulesetStatus::FullyEnforced => "landlock: no files, no TCP",
            RulesetStatus::PartiallyEnforced => "landlock: no files (this kernel: partly)",
            RulesetStatus::NotEnforced => "landlock: not available on this kernel",
        });
        seccomp()?;
        said.push("seccomp: no sockets, exec, ptrace, namespaces, mounts, modules, bpf");
        Ok(format!("linux: no_new_privs; {}", said.join("; ")))
    }

    fn seccomp() -> Result<(), String> {
        use seccompiler::{BpfProgram, SeccompAction, SeccompFilter, SeccompRule, TargetArch};
        use std::collections::BTreeMap;
        let denied = [
            libc::SYS_socket,
            libc::SYS_socketpair,
            libc::SYS_connect,
            libc::SYS_bind,
            libc::SYS_listen,
            libc::SYS_accept,
            libc::SYS_accept4,
            libc::SYS_execve,
            libc::SYS_execveat,
            libc::SYS_ptrace,
            libc::SYS_process_vm_readv,
            libc::SYS_process_vm_writev,
            libc::SYS_kexec_load,
            libc::SYS_mount,
            libc::SYS_umount2,
            libc::SYS_unshare,
            libc::SYS_setns,
            libc::SYS_pivot_root,
            libc::SYS_chroot,
            libc::SYS_init_module,
            libc::SYS_finit_module,
            libc::SYS_delete_module,
            libc::SYS_bpf,
            libc::SYS_perf_event_open,
            libc::SYS_userfaultfd,
            libc::SYS_keyctl,
            libc::SYS_add_key,
            libc::SYS_request_key,
            libc::SYS_open_by_handle_at,
            libc::SYS_io_uring_setup,
            libc::SYS_personality,
        ];
        let rules: BTreeMap<i64, Vec<SeccompRule>> = denied.iter().map(|s| (*s, vec![])).collect();
        #[cfg(target_arch = "x86_64")]
        let arch = TargetArch::x86_64;
        #[cfg(target_arch = "aarch64")]
        let arch = TargetArch::aarch64;
        let filter = SeccompFilter::new(
            rules,
            SeccompAction::Allow,
            SeccompAction::Errno(libc::EPERM as u32),
            arch,
        )
        .map_err(|e| format!("seccomp: {e}"))?;
        let prog: BpfProgram = filter
            .try_into()
            .map_err(|e: seccompiler::BackendError| format!("seccomp: {e}"))?;
        seccompiler::apply_filter_all_threads(&prog).map_err(|e| format!("seccomp: {e}"))
    }
}

#[cfg(not(any(windows, target_os = "linux")))]
mod imp {
    use super::Child;
    use std::io;
    use std::path::Path;

    pub struct Proc {
        child: tokio::process::Child,
    }

    impl Proc {
        pub fn kill(&mut self) {
            let _ = self.child.start_kill();
        }

        pub async fn wait(&mut self) {
            let _ = self.child.wait().await;
        }
    }

    pub fn spawn(exe: &Path, args: &[&str]) -> io::Result<Child> {
        use std::process::Stdio;
        let mut child = tokio::process::Command::new(exe)
            .args(args)
            .env_clear()
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true)
            .spawn()?;
        let stdin = child
            .stdin
            .take()
            .ok_or_else(|| io::Error::other("no stdin"))?;
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| io::Error::other("no stdout"))?;
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| io::Error::other("no stderr"))?;
        Ok(Child {
            stdin: Box::new(stdin),
            stdout: Box::new(stdout),
            stderr: Box::new(stderr),
            imp: Proc { child },
        })
    }

    pub fn lockdown() -> Result<String, String> {
        Ok("this system: a separate process with an empty environment (no further sandbox)".into())
    }
}

/// What a gateway that someone took over could still do: tries to read
/// `file`, list `dir`, write into `dir`, connect to `port` on this machine,
/// be reached on a port of its own (it prints `PORT n` and waits three
/// seconds for the caller to connect), and start a program. One line each,
/// `ALLOWED` or `blocked` (`3dheat sandbox-check` runs this inside the sandbox).
pub fn probe(file: &str, dir: &str, port: u16) -> Vec<String> {
    use std::io::Write;
    use std::time::{Duration, Instant};
    let mut out = Vec::new();
    let mut t = |name: &str, ok: bool| {
        out.push(format!(
            "{name}: {}",
            if ok { "ALLOWED" } else { "blocked" }
        ))
    };
    t("read a file of the user's", std::fs::read(file).is_ok());
    t(
        "list a folder of the user's",
        std::fs::read_dir(dir).is_ok(),
    );
    t(
        "write into a folder of the user's",
        std::fs::write(std::path::Path::new(dir).join("written-by-gateway"), b"x").is_ok(),
    );
    let to = std::net::SocketAddr::from(([127, 0, 0, 1], port));
    t(
        "connect to this machine",
        std::net::TcpStream::connect_timeout(&to, Duration::from_secs(2)).is_ok(),
    );
    // Listening is not enough: whether anyone gets through to it.
    let reached = match std::net::TcpListener::bind("127.0.0.1:0") {
        Ok(l) => {
            let _ = l.set_nonblocking(true);
            println!("PORT {}", l.local_addr().map(|a| a.port()).unwrap_or(0));
            let _ = std::io::stdout().flush();
            let end = Instant::now() + Duration::from_secs(3);
            let mut got = false;
            while Instant::now() < end && !got {
                got = l.accept().is_ok();
                std::thread::sleep(Duration::from_millis(20));
            }
            got
        }
        Err(_) => false,
    };
    t("be reached on a port of its own", reached);
    #[cfg(windows)]
    let started = std::process::Command::new("cmd")
        .args(["/c", "exit 0"])
        .output()
        .is_ok();
    #[cfg(not(windows))]
    let started = std::process::Command::new("/bin/sh")
        .args(["-c", "true"])
        .output()
        .is_ok();
    t("start a program", started);
    out
}
