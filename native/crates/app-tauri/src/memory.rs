//! The machine's memory as the viewer's budgets read it (`src/data/hostMemory.ts`):
//! in a browser the dev server answers `/__host/memory`; in the app, this command.
//! The viewer asks again every few seconds, so what it budgets follows what the
//! rest of the machine is using.
//!
//! The card is read three ways, as far as the system allows:
//!
//! - the OS's own budget for a process (DXGI `QueryVideoMemoryInfo` on Windows,
//!   `VK_EXT_memory_budget` elsewhere): the most the system means to give one
//!   process before it starts paging it out;
//! - what every program together holds on the card, and what this app's own
//!   processes hold (the window's WebView2 GPU process among them): Windows'
//!   "GPU Adapter Memory" and "GPU Process Memory" counters. Measured on a 16 GB
//!   card, the DXGI budget stayed at 15.95 GB while another process held 3 GB,
//!   so the budget alone does not say what others take; these counters do.
//! - the card's size, when nothing else answers.
//!
//! System memory: installed, and available now.

use serde_json::{json, Value};

/// What the card and the machine have, now. Blocking (the first counter query
/// takes a few hundred milliseconds), so the command runs it off the event loop.
#[tauri::command]
pub async fn host_memory() -> Value {
    tauri::async_runtime::spawn_blocking(read).await.unwrap_or(Value::Null)
}

fn read() -> Value {
    let card = card();
    json!({
        "totalBytes": heat3d_core::memory::total_bytes(),
        "freeBytes": heat3d_core::memory::available_bytes(),
        "cpus": std::thread::available_parallelism().map(|n| n.get()).unwrap_or(0),
        "platform": std::env::consts::OS,
        "vramBytes": card.as_ref().map(|c| c.total),
        "vramSource": card.as_ref().map(|c| c.source).unwrap_or(""),
        "vramBudgetBytes": card.as_ref().and_then(|c| c.budget),
        "vramBudgetNet": card.as_ref().is_some_and(|c| c.budget_net),
        "vramUsedBytes": card.as_ref().and_then(|c| c.used),
        "vramOwnBytes": card.as_ref().and_then(|c| c.own),
    })
}

/// The card the viewer draws on (the one with the most memory of its own).
#[derive(Debug, Clone, PartialEq)]
pub struct Card {
    /// Its own memory, bytes.
    pub total: u64,
    /// The OS's budget for one process, bytes.
    pub budget: Option<u64>,
    /// Whether that budget already leaves out what other processes hold. DXGI's
    /// does not (it stayed put while another process took 3 GB); Vulkan's does on
    /// Linux's drivers, which count the window's own GPU process among the others.
    pub budget_net: bool,
    /// Held by every program together, this app included, bytes.
    pub used: Option<u64>,
    /// Held by this app's processes (the window's included), bytes.
    pub own: Option<u64>,
    pub source: &'static str,
}

pub fn card() -> Option<Card> {
    #[cfg(windows)]
    if let Some(c) = dxgi::card() {
        return Some(c);
    }
    vulkan::card()
}

#[cfg(windows)]
mod dxgi {
    use super::Card;
    use windows::core::Interface;
    use windows::Win32::Foundation::LUID;
    use windows::Win32::Graphics::Dxgi::{
        CreateDXGIFactory1, IDXGIAdapter3, IDXGIFactory1, DXGI_MEMORY_SEGMENT_GROUP_LOCAL, DXGI_QUERY_VIDEO_MEMORY_INFO,
    };

    pub fn card() -> Option<Card> {
        // SAFETY: plain DXGI queries on interfaces DXGI handed out.
        unsafe {
            let f = CreateDXGIFactory1::<IDXGIFactory1>().ok()?;
            let mut best: Option<(u64, LUID, Option<u64>)> = None;
            let mut i = 0;
            while let Ok(a) = f.EnumAdapters1(i) {
                i += 1;
                let Ok(d) = a.GetDesc1() else { continue };
                let total = d.DedicatedVideoMemory as u64;
                if total == 0 || best.as_ref().is_some_and(|b| b.0 >= total) {
                    continue;
                }
                let budget = a.cast::<IDXGIAdapter3>().ok().and_then(|a3| {
                    let mut info = DXGI_QUERY_VIDEO_MEMORY_INFO::default();
                    a3.QueryVideoMemoryInfo(0, DXGI_MEMORY_SEGMENT_GROUP_LOCAL, &mut info).ok()?;
                    (info.Budget > 0).then_some(info.Budget)
                });
                best = Some((total, d.AdapterLuid, budget));
            }
            let (mut total, luid, budget) = best?;
            // A card sharing system memory (integrated) has little or none of its
            // own: its local budget is the shared memory it may use, and the
            // counters' dedicated figures say nothing about that.
            if total < 1 << 30 && budget.is_some_and(|b| b > total) {
                total = budget.unwrap_or(total);
                return Some(Card { total, budget, budget_net: false, used: None, own: None, source: "DXGI budget (shared memory)" });
            }
            let (used, own) = super::counters::usage(luid);
            let source = match (budget.is_some(), used.is_some()) {
                (true, true) => "DXGI budget, GPU memory counters",
                (true, false) => "DXGI budget",
                _ => "DXGI",
            };
            Some(Card { total, budget, budget_net: false, used, own, source })
        }
    }
}

/// Windows' performance counters for GPU memory: every program's, and this app's.
#[cfg(windows)]
mod counters {
    use std::collections::HashSet;
    use std::sync::Mutex;

    use windows::core::{w, PCWSTR};
    use windows::Win32::Foundation::{CloseHandle, LUID};
    use windows::Win32::System::Diagnostics::ToolHelp::{
        CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
    };
    use windows::Win32::System::Performance::{
        PdhAddEnglishCounterW, PdhCollectQueryData, PdhGetFormattedCounterArrayW, PdhOpenQueryW, PDH_FMT_COUNTERVALUE_ITEM_W,
        PDH_FMT_LARGE, PDH_HCOUNTER, PDH_HQUERY,
    };

    /// One query, kept open: the first collection takes a few hundred
    /// milliseconds, the ones after it about one.
    struct Query {
        query: PDH_HQUERY,
        adapters: PDH_HCOUNTER,
        processes: PDH_HCOUNTER,
    }
    // SAFETY: PDH handles may be used from any thread; access is serialised by the mutex.
    unsafe impl Send for Query {}

    static QUERY: Mutex<Option<Query>> = Mutex::new(None);

    /// Bytes on the card with this LUID: every program's, and this app's processes'.
    pub fn usage(luid: LUID) -> (Option<u64>, Option<u64>) {
        let mut guard = QUERY.lock().unwrap_or_else(|e| e.into_inner());
        if guard.is_none() {
            *guard = open();
        }
        let Some(q) = guard.as_ref() else { return (None, None) };
        // SAFETY: handles from `open`, alive for the process.
        if unsafe { PdhCollectQueryData(q.query) } != 0 {
            return (None, None);
        }
        let tag = format!("luid_0x{:08x}_0x{:08x}", luid.HighPart as u32, luid.LowPart).to_ascii_lowercase();
        let used: u64 = values(q.adapters).iter().filter(|(n, _)| n.to_ascii_lowercase().starts_with(&tag)).map(|(_, v)| *v).sum();
        let ours = own_processes();
        let own: u64 = values(q.processes)
            .iter()
            .filter(|(n, _)| {
                let n = n.to_ascii_lowercase();
                n.contains(&tag) && pid_of(&n).is_some_and(|p| ours.contains(&p))
            })
            .map(|(_, v)| *v)
            .sum();
        if used == 0 {
            return (None, None);
        }
        (Some(used), Some(own))
    }

    fn open() -> Option<Query> {
        // SAFETY: PDH calls writing handles into locals.
        unsafe {
            let mut query = PDH_HQUERY::default();
            if PdhOpenQueryW(PCWSTR::null(), 0, &mut query) != 0 {
                return None;
            }
            let mut adapters = PDH_HCOUNTER::default();
            let mut processes = PDH_HCOUNTER::default();
            if PdhAddEnglishCounterW(query, w!(r"\GPU Adapter Memory(*)\Dedicated Usage"), 0, &mut adapters) != 0
                || PdhAddEnglishCounterW(query, w!(r"\GPU Process Memory(*)\Dedicated Usage"), 0, &mut processes) != 0
            {
                return None;
            }
            Some(Query { query, adapters, processes })
        }
    }

    /// A counter's value per instance, as (instance name, value).
    fn values(counter: PDH_HCOUNTER) -> Vec<(String, u64)> {
        let mut out = Vec::new();
        // SAFETY: the first call asks for the size, the second fills a buffer of it.
        unsafe {
            let (mut size, mut count) = (0u32, 0u32);
            let _ = PdhGetFormattedCounterArrayW(counter, PDH_FMT_LARGE, &mut size, &mut count, None);
            if size == 0 {
                return out;
            }
            // u64 storage keeps the items aligned.
            let mut buf = vec![0u64; (size as usize).div_ceil(8) + 1];
            let items = buf.as_mut_ptr() as *mut PDH_FMT_COUNTERVALUE_ITEM_W;
            if PdhGetFormattedCounterArrayW(counter, PDH_FMT_LARGE, &mut size, &mut count, Some(items)) != 0 {
                return out;
            }
            for i in 0..count as usize {
                let it = &*items.add(i);
                if it.FmtValue.CStatus != 0 {
                    continue;
                }
                let v = it.FmtValue.Anonymous.largeValue;
                if v > 0 {
                    out.push((it.szName.to_string().unwrap_or_default(), v as u64));
                }
            }
        }
        out
    }

    /// `pid_1234_luid_...` -> 1234.
    pub(super) fn pid_of(instance: &str) -> Option<u32> {
        instance.strip_prefix("pid_")?.split('_').next()?.parse().ok()
    }

    /// This process and every process it started, and theirs (the WebView2 ones).
    fn own_processes() -> HashSet<u32> {
        let me = std::process::id();
        let mut pairs = Vec::new();
        // SAFETY: a process snapshot walked with a correctly sized entry.
        unsafe {
            if let Ok(snap) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
                let mut e = PROCESSENTRY32W { dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32, ..Default::default() };
                if Process32FirstW(snap, &mut e).is_ok() {
                    loop {
                        pairs.push((e.th32ProcessID, e.th32ParentProcessID));
                        if Process32NextW(snap, &mut e).is_err() {
                            break;
                        }
                    }
                }
                let _ = CloseHandle(snap);
            }
        }
        descendants(me, &pairs)
    }

    /// `root` and everything below it, from (pid, parent) pairs.
    pub(super) fn descendants(root: u32, pairs: &[(u32, u32)]) -> HashSet<u32> {
        let mut set = HashSet::from([root]);
        loop {
            let before = set.len();
            for &(pid, parent) in pairs {
                if pid != parent && set.contains(&parent) {
                    set.insert(pid);
                }
            }
            if set.len() == before {
                return set;
            }
        }
    }
}

/// `VK_EXT_memory_budget`, through a Vulkan loader found at run time (no link
/// dependency: without one, the card is simply not read).
mod vulkan {
    use super::Card;
    use ash::vk;
    use std::sync::OnceLock;

    struct Instance {
        _entry: ash::Entry,
        instance: ash::Instance,
        budget: bool,
        device: vk::PhysicalDevice,
    }
    // SAFETY: Vulkan instances and physical devices may be queried from any thread.
    unsafe impl Send for Instance {}
    unsafe impl Sync for Instance {}

    /// Made once: creating an instance loads every driver.
    static INSTANCE: OnceLock<Option<Instance>> = OnceLock::new();

    pub fn card() -> Option<Card> {
        let i = INSTANCE.get_or_init(open).as_ref()?;
        let mut budget = vk::PhysicalDeviceMemoryBudgetPropertiesEXT::default();
        let mut props = vk::PhysicalDeviceMemoryProperties2::default();
        if i.budget {
            props = props.push_next(&mut budget);
        }
        // SAFETY: a device of this instance, a correctly chained struct.
        unsafe { i.instance.get_physical_device_memory_properties2(i.device, &mut props) };
        let mp = props.memory_properties;
        let heaps = &mp.memory_heaps[..mp.memory_heap_count as usize];
        let (h, heap) = heaps.iter().enumerate().filter(|(_, h)| h.flags.contains(vk::MemoryHeapFlags::DEVICE_LOCAL)).max_by_key(|(_, h)| h.size)?;
        let b = budget.heap_budget[h];
        Some(Card {
            total: heap.size,
            budget: (i.budget && b > 0).then_some(b.min(heap.size)),
            budget_net: cfg!(not(windows)),
            used: None,
            own: None,
            source: if i.budget && b > 0 { "Vulkan memory budget" } else { "Vulkan" },
        })
    }

    fn open() -> Option<Instance> {
        // SAFETY: the loader's own entry points; the instance lives for the process.
        unsafe {
            let entry = ash::Entry::load().ok()?;
            let app = vk::ApplicationInfo::default().api_version(vk::API_VERSION_1_1);
            let instance = entry.create_instance(&vk::InstanceCreateInfo::default().application_info(&app), None).ok()?;
            // The device with the most memory of its own, a discrete card before others.
            let device = instance.enumerate_physical_devices().ok()?.into_iter().max_by_key(|&d| {
                let p = instance.get_physical_device_properties(d);
                let m = instance.get_physical_device_memory_properties(d);
                let local: u64 = m.memory_heaps[..m.memory_heap_count as usize]
                    .iter()
                    .filter(|h| h.flags.contains(vk::MemoryHeapFlags::DEVICE_LOCAL))
                    .map(|h| h.size)
                    .max()
                    .unwrap_or(0);
                (p.device_type == vk::PhysicalDeviceType::DISCRETE_GPU, local)
            })?;
            let budget = instance
                .enumerate_device_extension_properties(device)
                .map(|exts| exts.iter().any(|e| e.extension_name_as_c_str().is_ok_and(|n| n == ash::ext::memory_budget::NAME)))
                .unwrap_or(false);
            Some(Instance { _entry: entry, instance, budget, device })
        }
    }

    #[cfg(test)]
    pub fn probe() -> Option<Card> {
        card()
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn reads_the_card_where_there_is_one() {
        // Prints what this machine reports; a machine without a card or a loader reports nothing.
        let c = super::card();
        eprintln!("card: {c:?}");
        eprintln!("vulkan: {:?}", super::vulkan::probe());
        if let Some(c) = c {
            assert!(c.total > 0);
            if let (Some(u), Some(o)) = (c.used, c.own) {
                assert!(o <= u, "own {o} above every program's {u}");
            }
        }
        let free = heat3d_core::memory::available_bytes();
        assert!(free > 0 && free <= heat3d_core::memory::total_bytes());
    }

    #[cfg(windows)]
    #[test]
    fn finds_this_app_s_processes() {
        use super::counters::{descendants, pid_of};
        assert_eq!(pid_of("pid_71352_luid_0x00000000_0x0001f9a1_phys_0"), Some(71352));
        assert_eq!(pid_of("luid_0x00000000_0x0001f9a1_phys_0"), None);
        let tree = descendants(10, &[(10, 1), (11, 10), (12, 11), (13, 2), (0, 0)]);
        assert_eq!(tree, [10, 11, 12].into_iter().collect());
    }
}
