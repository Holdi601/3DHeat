//! Media Foundation's video encoders (Windows). The GPU makers register their
//! hardware encoders as MFTs (NVIDIA: NVENC, AMD: AMF, Intel: QSV), asynchronous
//! ones driven by events; Microsoft's software H.264 encoder is synchronous.
//! Pictures go in as NV12 in system memory (the viewport converts and reads
//! them back), low-latency mode, constant bitrate, no B-frames, a key frame
//! when asked.

#![allow(unsafe_code)]

use std::mem::ManuallyDrop;
use std::sync::Once;
use std::time::{Duration, Instant};

use anyhow::{anyhow, bail, Context};
use windows::core::{Interface, GUID, PWSTR};
use windows::Win32::Media::MediaFoundation::*;
use windows::Win32::System::Com::{CoInitializeEx, CoTaskMemFree, COINIT_MULTITHREADED};
use windows::Win32::System::Variant::VARIANT;

use super::{Codec, Encoded, Encoder, EncoderInfo, Settings};

fn startup() -> anyhow::Result<()> {
    static MF: Once = Once::new();
    // SAFETY: COM on this thread (multithreaded; already set up is fine), Media Foundation once a process.
    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
        let mut r = Ok(());
        MF.call_once(|| r = MFStartup(MF_VERSION, MFSTARTUP_FULL));
        r.context("MFStartup")
    }
}

fn subtype(c: Codec) -> GUID {
    match c {
        Codec::H264 => MFVideoFormat_H264,
        Codec::H265 => MFVideoFormat_HEVC,
        Codec::Av1 => MFVideoFormat_AV1,
    }
}

/// The encoders registered for NV12 to `codec`, best first.
fn enumerate(codec: Codec, hardware: bool) -> anyhow::Result<Vec<IMFActivate>> {
    startup()?;
    let flags = if hardware { MFT_ENUM_FLAG(MFT_ENUM_FLAG_HARDWARE.0 | MFT_ENUM_FLAG_SORTANDFILTER.0) } else { MFT_ENUM_FLAG(MFT_ENUM_FLAG_SYNCMFT.0 | MFT_ENUM_FLAG_SORTANDFILTER.0) };
    let input = MFT_REGISTER_TYPE_INFO { guidMajorType: MFMediaType_Video, guidSubtype: MFVideoFormat_NV12 };
    let output = MFT_REGISTER_TYPE_INFO { guidMajorType: MFMediaType_Video, guidSubtype: subtype(codec) };
    let mut list: *mut Option<IMFActivate> = std::ptr::null_mut();
    let mut n = 0u32;
    // SAFETY: MFTEnumEx fills `list` with `n` activation objects it allocated; each is taken out
    // (released when dropped) and the array freed with CoTaskMemFree.
    unsafe {
        MFTEnumEx(MFT_CATEGORY_VIDEO_ENCODER, flags, Some(&input), Some(&output), &mut list, &mut n).context("MFTEnumEx")?;
        if list.is_null() {
            return Ok(Vec::new());
        }
        let v = std::slice::from_raw_parts_mut(list, n as usize).iter_mut().filter_map(|a| a.take()).collect();
        CoTaskMemFree(Some(list as *const _));
        Ok(v)
    }
}

pub fn has_hardware(codec: Codec) -> bool {
    enumerate(codec, true).is_ok_and(|v| !v.is_empty())
}

pub fn has_software(codec: Codec) -> bool {
    enumerate(codec, false).is_ok_and(|v| !v.is_empty())
}

fn name_of(a: &IMFActivate) -> String {
    let mut p = PWSTR::null();
    let mut len = 0u32;
    // SAFETY: the string is allocated by the call and freed here after copying.
    unsafe {
        if a.GetAllocatedString(&MFT_FRIENDLY_NAME_Attribute, &mut p, &mut len).is_ok() && !p.is_null() {
            let s = p.to_string().unwrap_or_default();
            CoTaskMemFree(Some(p.0 as *const _));
            return s;
        }
    }
    "Media Foundation encoder".into()
}

pub struct MfEncoder {
    t: IMFTransform,
    events: Option<IMFMediaEventGenerator>,
    api: Option<ICodecAPI>,
    info: EncoderInfo,
    s: Settings,
    need_input: u32,
}

fn size(w: u32, h: u32) -> u64 {
    ((w as u64) << 32) | h as u64
}

impl MfEncoder {
    pub fn open(s: &Settings, hardware: bool) -> anyhow::Result<Self> {
        let list = enumerate(s.codec, hardware)?;
        if list.is_empty() {
            bail!("no {} {:?} encoder", if hardware { "hardware" } else { "software" }, s.codec);
        }
        let mut last = anyhow!("no encoder took the stream");
        for a in &list {
            match Self::try_one(a, s, hardware) {
                Ok(e) => return Ok(e),
                Err(e) => last = e.context(name_of(a)),
            }
        }
        Err(last)
    }

    fn try_one(a: &IMFActivate, s: &Settings, hardware: bool) -> anyhow::Result<Self> {
        let name = name_of(a);
        // SAFETY: plain COM calls on objects this function owns; every pointer passed lives through its call.
        unsafe {
            let t: IMFTransform = a.ActivateObject().context("ActivateObject")?;
            let attrs = t.GetAttributes().ok();
            let is_async = attrs.as_ref().is_some_and(|at| at.GetUINT32(&MF_TRANSFORM_ASYNC).unwrap_or(0) != 0);
            if let Some(at) = &attrs {
                if is_async {
                    at.SetUINT32(&MF_TRANSFORM_ASYNC_UNLOCK, 1).context("async unlock")?;
                }
                let _ = at.SetUINT32(&MF_LOW_LATENCY, 1);
            }
            let api: Option<ICodecAPI> = t.cast().ok();
            // Rate control before the types (some encoders read it when the output type is set).
            if let Some(api) = &api {
                let set = |g: &GUID, v: VARIANT| {
                    let _ = api.SetValue(g, &v);
                };
                set(&CODECAPI_AVLowLatencyMode, VARIANT::from(true));
                set(&CODECAPI_AVEncCommonRateControlMode, VARIANT::from(eAVEncCommonRateControlMode_CBR.0 as u32));
                set(&CODECAPI_AVEncCommonMeanBitRate, VARIANT::from(s.kbps * 1000));
                set(&CODECAPI_AVEncMPVDefaultBPictureCount, VARIANT::from(0u32));
                // Key frames when the receiver asks (a lost packet), else every ten seconds.
                set(&CODECAPI_AVEncMPVGOPSize, VARIANT::from(s.fps.max(1) * 10));
            }
            let out = MFCreateMediaType()?;
            out.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video)?;
            out.SetGUID(&MF_MT_SUBTYPE, &subtype(s.codec))?;
            out.SetUINT32(&MF_MT_AVG_BITRATE, s.kbps * 1000)?;
            out.SetUINT64(&MF_MT_FRAME_SIZE, size(s.width, s.height))?;
            out.SetUINT64(&MF_MT_FRAME_RATE, size(s.fps.max(1), 1))?;
            out.SetUINT64(&MF_MT_PIXEL_ASPECT_RATIO, size(1, 1))?;
            out.SetUINT32(&MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive.0 as u32)?;
            if s.codec == Codec::H264 {
                // Baseline: what every browser's decoder takes (profile-level-id 42e0..).
                out.SetUINT32(&MF_MT_MPEG2_PROFILE, eAVEncH264VProfile_Base.0 as u32)?;
            }
            t.SetOutputType(0, &out, 0).context("output type")?;
            let mut input = None;
            for i in 0..64 {
                match t.GetInputAvailableType(0, i) {
                    Ok(m) if m.GetGUID(&MF_MT_SUBTYPE).ok() == Some(MFVideoFormat_NV12) => {
                        input = Some(m);
                        break;
                    }
                    Ok(_) => {}
                    Err(_) => break,
                }
            }
            let input = match input {
                Some(m) => m,
                None => {
                    let m = MFCreateMediaType()?;
                    m.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video)?;
                    m.SetGUID(&MF_MT_SUBTYPE, &MFVideoFormat_NV12)?;
                    m
                }
            };
            input.SetUINT64(&MF_MT_FRAME_SIZE, size(s.width, s.height))?;
            input.SetUINT64(&MF_MT_FRAME_RATE, size(s.fps.max(1), 1))?;
            input.SetUINT32(&MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive.0 as u32)?;
            let _ = input.SetUINT32(&MF_MT_YUV_MATRIX, MFVideoTransferMatrix_BT601.0 as u32);
            let _ = input.SetUINT32(&MF_MT_VIDEO_NOMINAL_RANGE, MFNominalRange_16_235.0 as u32);
            t.SetInputType(0, &input, 0).context("input type")?;
            t.ProcessMessage(MFT_MESSAGE_NOTIFY_BEGIN_STREAMING, 0)?;
            t.ProcessMessage(MFT_MESSAGE_NOTIFY_START_OF_STREAM, 0)?;
            let events = if is_async { Some(t.cast::<IMFMediaEventGenerator>().context("event generator")?) } else { None };
            Ok(Self { t, events, api, info: EncoderInfo { name, hardware, codec: s.codec }, s: *s, need_input: 0 })
        }
    }

    fn sample(&self, nv12: &[u8], time: i64) -> anyhow::Result<IMFSample> {
        // SAFETY: the buffer is locked for exactly its own length while copying into it.
        unsafe {
            let buf = MFCreateMemoryBuffer(nv12.len() as u32)?;
            let mut p: *mut u8 = std::ptr::null_mut();
            let mut max = 0u32;
            buf.Lock(&mut p, Some(&mut max), None)?;
            if p.is_null() || (max as usize) < nv12.len() {
                let _ = buf.Unlock();
                bail!("buffer lock");
            }
            std::ptr::copy_nonoverlapping(nv12.as_ptr(), p, nv12.len());
            buf.Unlock()?;
            buf.SetCurrentLength(nv12.len() as u32)?;
            let s = MFCreateSample()?;
            s.AddBuffer(&buf)?;
            s.SetSampleTime(time)?;
            s.SetSampleDuration(10_000_000 / self.s.fps.max(1) as i64)?;
            Ok(s)
        }
    }

    /// One output, or None when the encoder wants more input.
    fn pull(&mut self) -> anyhow::Result<Option<Encoded>> {
        // SAFETY: the output buffer's sample and events are taken back out of their ManuallyDrop
        // after the call (released when dropped); the locked buffer is read for its current length only.
        unsafe {
            let info = self.t.GetOutputStreamInfo(0)?;
            let provides = info.dwFlags & (MFT_OUTPUT_STREAM_PROVIDES_SAMPLES.0 as u32 | MFT_OUTPUT_STREAM_CAN_PROVIDE_SAMPLES.0 as u32) != 0;
            let sample = if provides {
                None
            } else {
                let s = MFCreateSample()?;
                let cap = info.cbSize.max(self.s.width * self.s.height * 3 / 2);
                s.AddBuffer(&MFCreateMemoryBuffer(cap)?)?;
                Some(s)
            };
            let mut db = [MFT_OUTPUT_DATA_BUFFER { dwStreamID: 0, pSample: ManuallyDrop::new(sample), dwStatus: 0, pEvents: ManuallyDrop::new(None) }];
            let mut status = 0u32;
            let r = self.t.ProcessOutput(0, &mut db, &mut status);
            let sample = ManuallyDrop::take(&mut db[0].pSample);
            drop(ManuallyDrop::take(&mut db[0].pEvents));
            match r {
                Err(e) if e.code() == MF_E_TRANSFORM_NEED_MORE_INPUT => return Ok(None),
                Err(e) if e.code() == MF_E_TRANSFORM_STREAM_CHANGE => {
                    let t = self.t.GetOutputAvailableType(0, 0)?;
                    self.t.SetOutputType(0, &t, 0)?;
                    return Ok(None);
                }
                Err(e) => return Err(e).context("ProcessOutput"),
                Ok(()) => {}
            }
            let Some(sample) = sample else { return Ok(None) };
            let buf = sample.ConvertToContiguousBuffer()?;
            let mut p: *mut u8 = std::ptr::null_mut();
            let mut len = 0u32;
            buf.Lock(&mut p, None, Some(&mut len))?;
            let data = if p.is_null() { Vec::new() } else { std::slice::from_raw_parts(p, len as usize).to_vec() };
            buf.Unlock()?;
            let key = sample.GetUINT32(&MFSampleExtension_CleanPoint).unwrap_or(0) != 0;
            Ok(Some(Encoded { data, key }))
        }
    }

    /// The next event of an asynchronous encoder, waiting up to `wait`; output it announces is pulled into `out`.
    fn event(&mut self, out: &mut Vec<Encoded>, wait: Duration) -> anyhow::Result<()> {
        let ev = self.events.clone().expect("an asynchronous encoder");
        let until = Instant::now() + wait;
        loop {
            // SAFETY: a COM call without pointers.
            match unsafe { ev.GetEvent(MF_EVENT_FLAG_NO_WAIT) } {
                Ok(e) => {
                    // SAFETY: as above.
                    let kind = unsafe { e.GetType()? };
                    if kind == METransformNeedInput.0 as u32 {
                        self.need_input += 1;
                    } else if kind == METransformHaveOutput.0 as u32 {
                        if let Some(x) = self.pull()? {
                            out.push(x);
                        }
                    }
                    return Ok(());
                }
                Err(e) if e.code() == MF_E_NO_EVENTS_AVAILABLE => {
                    if Instant::now() >= until {
                        return Ok(());
                    }
                    std::thread::sleep(Duration::from_micros(200));
                }
                Err(e) => return Err(e).context("GetEvent"),
            }
        }
    }
}

impl Encoder for MfEncoder {
    fn info(&self) -> &EncoderInfo {
        &self.info
    }

    fn encode(&mut self, nv12: &[u8], time_100ns: i64, key: bool) -> anyhow::Result<Vec<Encoded>> {
        let need = (self.s.width * self.s.height * 3 / 2) as usize;
        if nv12.len() != need {
            bail!("picture of {} bytes, the encoder takes {need}", nv12.len());
        }
        if key {
            if let Some(api) = &self.api {
                // SAFETY: the VARIANT lives through the call.
                let _ = unsafe { api.SetValue(&CODECAPI_AVEncVideoForceKeyFrame, &VARIANT::from(1u32)) };
            }
        }
        let sample = self.sample(nv12, time_100ns)?;
        let mut out = Vec::new();
        if self.events.is_none() {
            // SAFETY: a COM call; the sample lives through it.
            unsafe { self.t.ProcessInput(0, &sample, 0).context("ProcessInput")? };
            while let Some(x) = self.pull()? {
                out.push(x);
            }
            return Ok(out);
        }
        // Asynchronous: input when the encoder asks for it, then its output for this picture.
        let until = Instant::now() + Duration::from_millis(500);
        while self.need_input == 0 {
            if Instant::now() > until {
                bail!("the encoder asked for no input");
            }
            self.event(&mut out, Duration::from_millis(50))?;
        }
        // SAFETY: as above.
        unsafe { self.t.ProcessInput(0, &sample, 0).context("ProcessInput")? };
        self.need_input -= 1;
        let had = out.len();
        let until = Instant::now() + Duration::from_millis(40);
        while out.len() == had && Instant::now() < until {
            self.event(&mut out, until.saturating_duration_since(Instant::now()))?;
        }
        Ok(out)
    }

    fn set_kbps(&mut self, kbps: u32) {
        self.s.kbps = kbps;
        if let Some(api) = &self.api {
            // SAFETY: the VARIANT lives through the call.
            let _ = unsafe { api.SetValue(&CODECAPI_AVEncCommonMeanBitRate, &VARIANT::from(kbps * 1000)) };
        }
    }
}

impl Drop for MfEncoder {
    fn drop(&mut self) {
        // SAFETY: plain COM calls.
        unsafe {
            let _ = self.t.ProcessMessage(MFT_MESSAGE_NOTIFY_END_OF_STREAM, 0);
            let _ = self.t.ProcessMessage(MFT_MESSAGE_NOTIFY_END_STREAMING, 0);
            if let Some(ev) = &self.events {
                if let Ok(s) = ev.cast::<IMFShutdown>() {
                    let _ = s.Shutdown();
                }
            }
        }
    }
}
