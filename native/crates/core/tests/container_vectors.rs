//! The shared `.3dheat` test vectors (`native/vectors/container`), read by the
//! core's reader. The web app's reader is checked against the same files and the
//! same `expected.json` (`src/data/containerVectors.test.ts`).

use std::path::PathBuf;

use heat3d_core::container::{member_bytes, Container};
use serde_json::Value;
use sha2::{Digest, Sha256};

#[test]
fn shared_vectors() {
    let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../vectors/container");
    let expected: Value = serde_json::from_str(&std::fs::read_to_string(dir.join("expected.json")).unwrap()).unwrap();
    let vectors = expected.as_object().unwrap();
    assert!(vectors.len() >= 3);
    for (name, want) in vectors {
        let bytes = std::fs::read(dir.join(name)).unwrap();
        let c = Container::open(&bytes).unwrap_or_else(|e| panic!("{name}: {e}"));
        assert_eq!(c.manifest["format_version"], want["formatVersion"], "{name}");
        assert_eq!(c.manifest["roles"], want["roles"], "{name}");
        let tables: Vec<&str> = c.tables().iter().map(|e| e.name.as_str()).collect();
        let want_tables: Vec<&str> = want["tables"].as_array().unwrap().iter().map(|v| v.as_str().unwrap()).collect();
        assert_eq!(tables, want_tables, "{name}");
        let members = want["members"].as_array().unwrap();
        assert_eq!(c.entries.len(), members.len(), "{name}");
        for (e, m) in c.entries.iter().zip(members) {
            assert_eq!(e.name, m["name"].as_str().unwrap(), "{name}");
            assert_eq!(e.method as u64, m["method"].as_u64().unwrap(), "{name} {}", e.name);
            assert_eq!(e.compressed, m["compressed"].as_u64().unwrap(), "{name} {}", e.name);
            assert_eq!(e.size, m["size"].as_u64().unwrap(), "{name} {}", e.name);
            assert_eq!(e.data, m["dataOffset"].as_u64().unwrap(), "{name} {}", e.name);
            let data = member_bytes(&bytes, e).unwrap();
            let hex: String = Sha256::digest(&data).iter().map(|b| format!("{b:02x}")).collect();
            assert_eq!(hex, m["sha256"].as_str().unwrap(), "{name} {}", e.name);
        }
        // Each table opens as Parquet in place.
        for t in c.tables() {
            let b = bytes::Bytes::copy_from_slice(&member_bytes(&bytes, t).unwrap());
            let pf = heat3d_core::parquet::ParquetFile::open(b).unwrap();
            assert!(pf.rows() > 0);
        }
    }
}
