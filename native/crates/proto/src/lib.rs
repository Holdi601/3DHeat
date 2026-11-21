//! The 3DHeat protocol (`native/proto/heat3d/v1/heat3d.proto`) as Rust types.
//!
//! A frame is a little-endian u32 length, an `Envelope` of that length, zero
//! padding to the next multiple of 8, then the envelope's raw payload; `frame` and
//! `unframe` build and split one. The padding lets a reader view the payload's
//! buffers in place as typed arrays.

pub mod v1 {
    include!(concat!(env!("OUT_DIR"), "/heat3d.v1.rs"));
}

/// The multiplayer session's messages (`proto/heat3d/session/v1/session.proto`).
pub mod session {
    pub mod v1 {
        #![allow(clippy::all)]
        include!(concat!(env!("OUT_DIR"), "/heat3d.session.v1.rs"));
    }
}

use prost::Message;

/// The protocol major version this build speaks.
pub const PROTOCOL: u32 = v1::ProtocolVersion::Current as u32;

/// Where a frame's payload starts, for an envelope of `len` bytes.
pub fn payload_start(len: usize) -> usize {
    (4 + len).div_ceil(8) * 8
}

/// An envelope and its payload as one frame.
pub fn frame(env: &v1::Envelope, payload: &[u8]) -> Vec<u8> {
    let len = env.encoded_len();
    let start = payload_start(len);
    let mut out = Vec::with_capacity(start + payload.len());
    out.extend_from_slice(&(len as u32).to_le_bytes());
    env.encode(&mut out).expect("a Vec grows");
    out.resize(start, 0);
    out.extend_from_slice(payload);
    out
}

/// A frame's envelope and payload.
pub fn unframe(bytes: &[u8]) -> Result<(v1::Envelope, &[u8]), prost::DecodeError> {
    if bytes.len() < 4 {
        return Err(decode_error("frame shorter than its length"));
    }
    let len = u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]) as usize;
    if bytes.len() < 4 + len {
        return Err(decode_error("frame shorter than its envelope"));
    }
    let env = v1::Envelope::decode(&bytes[4..4 + len])?;
    Ok((env, bytes.get(payload_start(len)..).unwrap_or(&[])))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn frame_round_trip() {
        let env = v1::Envelope {
            protocol: PROTOCOL,
            id: 7,
            body: Some(v1::envelope::Body::Echo(v1::Echo { payload_bytes: 3 })),
            ..Default::default()
        };
        let f = frame(&env, &[1, 2, 3]);
        let (back, payload) = unframe(&f).unwrap();
        assert_eq!(back, env);
        assert_eq!(payload, &[1, 2, 3]);
    }
}

#[allow(deprecated)]
fn decode_error(what: &'static str) -> prost::DecodeError {
    prost::DecodeError::new(what)
}
