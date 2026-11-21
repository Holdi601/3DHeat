//! The machine's memory and this process's peak use, for reports and budgets.

/// Peak resident memory of this process so far, bytes.
pub fn peak_bytes() -> u64 {
    imp::peak()
}

/// Resident memory now, bytes.
pub fn current_bytes() -> u64 {
    imp::current()
}

/// Physical memory of the machine, bytes.
pub fn total_bytes() -> u64 {
    imp::total()
}

#[cfg(windows)]
mod imp {
    #[repr(C)]
    #[derive(Default)]
    struct ProcessMemoryCounters {
        cb: u32,
        page_fault_count: u32,
        peak_working_set_size: usize,
        working_set_size: usize,
        quota_peak_paged_pool_usage: usize,
        quota_paged_pool_usage: usize,
        quota_peak_non_paged_pool_usage: usize,
        quota_non_paged_pool_usage: usize,
        pagefile_usage: usize,
        peak_pagefile_usage: usize,
    }

    #[repr(C)]
    #[derive(Default)]
    struct MemoryStatusEx {
        length: u32,
        memory_load: u32,
        total_phys: u64,
        avail_phys: u64,
        total_page_file: u64,
        avail_page_file: u64,
        total_virtual: u64,
        avail_virtual: u64,
        avail_extended_virtual: u64,
    }

    #[link(name = "psapi")]
    extern "system" {
        fn GetProcessMemoryInfo(process: isize, counters: *mut ProcessMemoryCounters, cb: u32) -> i32;
    }

    #[link(name = "kernel32")]
    extern "system" {
        fn GetCurrentProcess() -> isize;
        fn GlobalMemoryStatusEx(status: *mut MemoryStatusEx) -> i32;
    }

    fn counters() -> ProcessMemoryCounters {
        let mut c = ProcessMemoryCounters { cb: std::mem::size_of::<ProcessMemoryCounters>() as u32, ..Default::default() };
        // SAFETY: plain Win32 call writing into a correctly sized struct.
        unsafe { GetProcessMemoryInfo(GetCurrentProcess(), &mut c, c.cb) };
        c
    }

    pub fn peak() -> u64 {
        // Private bytes are what a load allocates; the working set also counts mapped file pages.
        counters().peak_pagefile_usage as u64
    }

    pub fn current() -> u64 {
        counters().pagefile_usage as u64
    }

    pub fn total() -> u64 {
        let mut s = MemoryStatusEx { length: std::mem::size_of::<MemoryStatusEx>() as u32, ..Default::default() };
        // SAFETY: as above.
        unsafe { GlobalMemoryStatusEx(&mut s) };
        s.total_phys
    }
}

#[cfg(not(windows))]
mod imp {
    fn status(key: &str) -> u64 {
        let s = std::fs::read_to_string("/proc/self/status").unwrap_or_default();
        s.lines()
            .find(|l| l.starts_with(key))
            .and_then(|l| l.split_whitespace().nth(1))
            .and_then(|v| v.parse::<u64>().ok())
            .map(|kb| kb * 1024)
            .unwrap_or(0)
    }

    pub fn peak() -> u64 {
        status("VmHWM:")
    }

    pub fn current() -> u64 {
        status("VmRSS:")
    }

    pub fn total() -> u64 {
        let s = std::fs::read_to_string("/proc/meminfo").unwrap_or_default();
        s.lines()
            .find(|l| l.starts_with("MemTotal:"))
            .and_then(|l| l.split_whitespace().nth(1))
            .and_then(|v| v.parse::<u64>().ok())
            .map(|kb| kb * 1024)
            .unwrap_or(0)
    }
}
