//! What the app needs from the machine, checked: the system, the webview, a
//! graphics card the viewer can draw with (WebGPU on DirectX 12 or Vulkan), a
//! Wayland session on Linux. Each check says what is missing and where the fix
//! is; graphics drivers cannot be installed by the app, so for those it names
//! the card maker's driver page.
//!
//! Used twice: the viewer's first-run check page (`requirements` command, the
//! page adds its own WebGPU check), and the Windows installer, which runs
//! `3dheat-app --check-requirements --report FILE` once the files are in place
//! and shows what is missing (`installer/hooks.nsh`).

use serde::Serialize;

#[derive(Clone, Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Check {
    pub id: &'static str,
    /// "ok", "warn" (works, but worse), or "missing" (the app will not work).
    pub status: &'static str,
    /// What was found, in words.
    pub detail: String,
    /// Where to fix it (a fixed address; the page opens it through `open_fix`).
    pub fix: Option<&'static str>,
}

const NVIDIA: &str = "https://www.nvidia.com/en-us/drivers/";
const AMD: &str = "https://www.amd.com/en/support/download/drivers.html";
const INTEL: &str = "https://www.intel.com/content/www/us/en/support/detect.html";
#[allow(dead_code)]
const WEBVIEW2: &str = "https://developer.microsoft.com/en-us/microsoft-edge/webview2/";
#[allow(dead_code)]
const WINDOWS_UPDATE: &str = "https://support.microsoft.com/en-us/windows/get-the-latest-windows-update-7d20e88c-0568-483a-37bc-c3885390d212";
#[allow(dead_code)]
const LINUX_HELP: &str = "https://github.com/Holdi601/3DHeat/blob/main/docs/native-app.md#linux";

/// The driver page of a card's maker, by its PCI vendor id.
#[cfg_attr(not(windows), allow(dead_code))]
pub fn driver_page(vendor: u32) -> Option<&'static str> {
    match vendor {
        0x10de => Some(NVIDIA),
        0x1002 | 0x1022 => Some(AMD),
        0x8086 => Some(INTEL),
        _ => None,
    }
}

/// Every address a check may name: `open_fix` opens only these.
pub fn known_link(url: &str) -> bool {
    [NVIDIA, AMD, INTEL, WEBVIEW2, WINDOWS_UPDATE, LINUX_HELP].contains(&url)
}

/// Every check, now. Blocking (it starts the graphics drivers once).
pub fn run() -> Vec<Check> {
    let mut out = Vec::new();
    #[cfg(windows)]
    win::checks(&mut out);
    #[cfg(target_os = "linux")]
    linux::checks(&mut out);
    vulkan_check(&mut out);
    let total = heat3d_core::memory::total_bytes();
    out.push(Check {
        id: "memory",
        status: if total >= 8 << 30 { "ok" } else { "warn" },
        detail: format!("{:.1} GB installed{}", total as f64 / 1e9, if total >= 8 << 30 { "" } else { "; 8 GB or more is recommended" }),
        fix: None,
    });
    out
}

/// The `requirements` command: the checks, off the event loop.
#[tauri::command]
pub async fn requirements() -> Vec<Check> {
    tauri::async_runtime::spawn_blocking(run).await.unwrap_or_default()
}

/// Opens a check's fix page in the system's browser; only the addresses the checks name.
#[tauri::command]
pub fn open_fix(url: String) -> Result<(), String> {
    if !known_link(&url) {
        return Err("not a page a check names".into());
    }
    open_url(&url)
}

pub fn open_url(url: &str) -> Result<(), String> {
    #[cfg(windows)]
    let r = std::process::Command::new("rundll32").args(["url.dll,FileProtocolHandler", url]).spawn();
    #[cfg(not(windows))]
    let r = std::process::Command::new("xdg-open").arg(url).spawn();
    r.map(|_| ()).map_err(|e| e.to_string())
}

/// The installer's check: a short report (to `report`, else standard output) and
/// the exit code 1 when something the app needs is missing, else 0.
pub fn cli(args: &[String]) -> i32 {
    let checks = run();
    let missing: Vec<&Check> = checks.iter().filter(|c| c.status == "missing").collect();
    let warn: Vec<&Check> = checks.iter().filter(|c| c.status == "warn").collect();
    let mut text = String::new();
    if missing.is_empty() && warn.is_empty() {
        text.push_str("3DHeat: everything it needs is there.\r\n");
    } else {
        if !missing.is_empty() {
            text.push_str("3DHeat is installed, but this computer lacks something it needs:\r\n\r\n");
        } else {
            text.push_str("3DHeat is installed. Worth knowing:\r\n\r\n");
        }
        for c in missing.iter().chain(warn.iter()) {
            text.push_str(&format!("- {}{}\r\n", c.detail, c.fix.map(|f| format!("\r\n  {f}")).unwrap_or_default()));
        }
        text.push_str("\r\nThe app's first start shows this again (Settings > System check).\r\n");
    }
    // A message box holds about a thousand characters.
    text.truncate(1000);
    match args.iter().position(|a| a == "--report").and_then(|i| args.get(i + 1)) {
        Some(f) => {
            let _ = std::fs::write(f, &text);
        }
        None => print!("{text}"),
    }
    if !missing.is_empty() {
        1
    } else if !warn.is_empty() {
        2
    } else {
        0
    }
}

fn vulkan_check(out: &mut Vec<Check>) {
    use ash::vk;
    // SAFETY: the loader's own entry points; the instance is destroyed before returning.
    let found = unsafe {
        ash::Entry::load().ok().and_then(|entry| {
            let app = vk::ApplicationInfo::default().api_version(vk::API_VERSION_1_1);
            let instance = entry.create_instance(&vk::InstanceCreateInfo::default().application_info(&app), None).ok()?;
            let devices: Vec<(String, vk::PhysicalDeviceType, u32)> = instance
                .enumerate_physical_devices()
                .unwrap_or_default()
                .into_iter()
                .map(|d| {
                    let p = instance.get_physical_device_properties(d);
                    let name = p.device_name_as_c_str().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
                    (name, p.device_type, p.vendor_id)
                })
                .collect();
            instance.destroy_instance(None);
            Some(devices)
        })
    };
    let windows = cfg!(windows);
    let check = match found {
        None => Check {
            id: "vulkan",
            // On Windows DirectX 12 is enough; Vulkan is the other way in.
            status: if windows { "ok" } else { "missing" },
            detail: if windows {
                "Vulkan: no loader (DirectX 12 is used)".into()
            } else {
                "Vulkan: no Vulkan loader (install libvulkan1 / vulkan-loader and your card's Vulkan driver, e.g. mesa-vulkan-drivers)".into()
            },
            fix: if windows { None } else { Some(LINUX_HELP) },
        },
        Some(devs) => {
            let hw: Vec<&(String, vk::PhysicalDeviceType, u32)> = devs.iter().filter(|d| d.1 != vk::PhysicalDeviceType::CPU).collect();
            if let Some(best) = hw.iter().find(|d| d.1 == vk::PhysicalDeviceType::DISCRETE_GPU).or(hw.first()) {
                Check { id: "vulkan", status: "ok", detail: format!("Vulkan: {}", best.0), fix: None }
            } else if let Some(cpu) = devs.first() {
                Check {
                    id: "vulkan",
                    status: if windows { "ok" } else { "warn" },
                    detail: format!("Vulkan: only a software device ({}): install your card's Vulkan driver", cpu.0),
                    fix: if windows { None } else { Some(LINUX_HELP) },
                }
            } else {
                Check {
                    id: "vulkan",
                    status: if windows { "ok" } else { "missing" },
                    detail: "Vulkan: a loader, but no device (install your card's Vulkan driver)".into(),
                    fix: if windows { None } else { Some(LINUX_HELP) },
                }
            }
        }
    };
    out.push(check);
}

#[cfg(target_os = "linux")]
mod linux {
    use super::{Check, LINUX_HELP};

    pub fn checks(out: &mut Vec<Check>) {
        let wayland = std::env::var_os("WAYLAND_DISPLAY").is_some();
        let kind = std::env::var("XDG_SESSION_TYPE").unwrap_or_default();
        out.push(Check {
            id: "wayland",
            status: if wayland { "ok" } else { "missing" },
            detail: if wayland {
                "Wayland session".into()
            } else {
                format!("No Wayland session ({}): 3DHeat runs on Wayland only; log in to a Wayland session", if kind.is_empty() { "unknown session" } else { kind.as_str() })
            },
            fix: (!wayland).then_some(LINUX_HELP),
        });
    }
}

#[cfg(windows)]
mod win {
    use super::{driver_page, Check, WEBVIEW2, WINDOWS_UPDATE};

    #[repr(C)]
    struct OsVersionInfo {
        size: u32,
        major: u32,
        minor: u32,
        build: u32,
        platform: u32,
        csd: [u16; 128],
    }

    #[link(name = "ntdll")]
    extern "system" {
        fn RtlGetVersion(info: *mut OsVersionInfo) -> i32;
    }

    /// (major, build): the real version, not the compatibility one.
    pub fn version() -> (u32, u32) {
        let mut v = OsVersionInfo { size: std::mem::size_of::<OsVersionInfo>() as u32, major: 0, minor: 0, build: 0, platform: 0, csd: [0; 128] };
        // SAFETY: a correctly sized struct for the call to fill.
        unsafe { RtlGetVersion(&mut v) };
        (v.major, v.build)
    }

    pub fn checks(out: &mut Vec<Check>) {
        let (major, build) = version();
        let ok = major >= 10 && build >= 17763;
        out.push(Check {
            id: "windows",
            status: if ok { "ok" } else { "missing" },
            detail: if ok {
                format!("Windows {} (build {build})", if build >= 22000 { "11" } else { "10" })
            } else {
                format!("Windows {major} build {build}: 3DHeat needs Windows 10 (version 1809 or later) or Windows 11")
            },
            fix: (!ok).then_some(WINDOWS_UPDATE),
        });

        let webview = webview2();
        out.push(Check {
            id: "webview2",
            status: if webview.is_some() { "ok" } else { "missing" },
            detail: match &webview {
                Some(v) => format!("WebView2 runtime {v}"),
                None => "The Microsoft Edge WebView2 runtime is not installed".into(),
            },
            fix: webview.is_none().then_some(WEBVIEW2),
        });

        out.push(gpu());
    }

    fn webview2() -> Option<String> {
        use webview2_com::Microsoft::Web::WebView2::Win32::GetAvailableCoreWebView2BrowserVersionString;
        use windows::core::{PCWSTR, PWSTR};
        let mut v = PWSTR::null();
        // SAFETY: the loader writes a string it allocated, which take_pwstr frees.
        unsafe { GetAvailableCoreWebView2BrowserVersionString(PCWSTR::null(), &mut v).ok()? };
        let s = webview2_com::take_pwstr(v);
        (!s.is_empty()).then_some(s)
    }

    /// The best hardware adapter that makes a DirectX 12 device.
    fn gpu() -> Check {
        use windows::Win32::Graphics::Direct3D::D3D_FEATURE_LEVEL_11_0;
        use windows::Win32::Graphics::Direct3D12::{D3D12CreateDevice, ID3D12Device};
        use windows::Win32::Graphics::Dxgi::{CreateDXGIFactory1, IDXGIFactory1, DXGI_ADAPTER_FLAG_SOFTWARE};
        let mut best: Option<(u64, String, u32, bool)> = None;
        let mut any_hw: Option<(String, u32)> = None;
        // SAFETY: DXGI and D3D12 calls on interfaces DXGI handed out; the device is dropped at once.
        unsafe {
            if let Ok(f) = CreateDXGIFactory1::<IDXGIFactory1>() {
                let mut i = 0;
                while let Ok(a) = f.EnumAdapters1(i) {
                    i += 1;
                    let Ok(d) = a.GetDesc1() else { continue };
                    if d.Flags & DXGI_ADAPTER_FLAG_SOFTWARE.0 as u32 != 0 {
                        continue;
                    }
                    let name = String::from_utf16_lossy(&d.Description).trim_end_matches('\0').to_string();
                    any_hw.get_or_insert((name.clone(), d.VendorId));
                    let mut dev: Option<ID3D12Device> = None;
                    let dx12 = D3D12CreateDevice(&a, D3D_FEATURE_LEVEL_11_0, &mut dev).is_ok();
                    let mem = d.DedicatedVideoMemory as u64;
                    if best.as_ref().is_none_or(|b| (dx12, mem) > (b.3, b.0)) {
                        best = Some((mem, name, d.VendorId, dx12));
                    }
                }
            }
        }
        match best {
            Some((mem, name, _, true)) => Check {
                id: "gpu",
                status: "ok",
                detail: format!("{name} ({:.1} GB), DirectX 12", mem as f64 / 1e9),
                fix: None,
            },
            Some((_, name, vendor, false)) => Check {
                id: "gpu",
                status: "missing",
                detail: format!("{name}: no DirectX 12 device. Update its driver"),
                fix: driver_page(vendor),
            },
            None => Check {
                id: "gpu",
                status: "missing",
                detail: match any_hw {
                    Some((n, _)) => format!("{n}: no usable graphics driver"),
                    None => "No graphics card with a driver was found (only the software adapter). Install your card's driver".into(),
                },
                fix: None,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn checks_run_and_name_only_known_pages() {
        let checks = super::run();
        eprintln!("{checks:#?}");
        assert!(checks.iter().any(|c| c.id == "memory"));
        for c in &checks {
            assert!(["ok", "warn", "missing"].contains(&c.status));
            if let Some(f) = c.fix {
                assert!(super::known_link(f), "{f}");
            }
        }
        assert!(!super::known_link("https://example.com/"));
    }
}
