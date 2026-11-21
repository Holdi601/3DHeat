//! Opening what a request names: a file on disk, memory-mapped, or a member of a
//! `.3dheat` container, as the bytes a reader reads.

use std::path::{Path, PathBuf};

use anyhow::{anyhow, Context, Result};
use bytes::Bytes;

use crate::container::{member_bytes, Container};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Format {
    Parquet,
    Csv,
    Acmi,
    Container,
}

/// The format a name says, as `detectFormat` (`src/data/sourcePreview.ts`) decides.
pub fn format_of(name: &str) -> Format {
    let n = name.to_ascii_lowercase();
    if n.ends_with(".3dheat") {
        Format::Container
    } else if n.ends_with(".acmi") {
        Format::Acmi
    } else if n.ends_with(".parquet") || n.ends_with(".pq") {
        Format::Parquet
    } else {
        Format::Csv
    }
}

/// A file's bytes, mapped rather than read: the operating system pages them in as
/// the readers touch them, and a file larger than memory still opens.
pub fn map(path: &Path) -> Result<Bytes> {
    let f = std::fs::File::open(path).with_context(|| format!("opening {}", path.display()))?;
    if f.metadata()?.len() == 0 {
        return Ok(Bytes::new());
    }
    // SAFETY: the file is opened read-only; a file changed underneath a load reads
    // as whatever it holds then, as it would for the browser.
    let m = unsafe { memmap2::Mmap::map(&f) }.with_context(|| format!("mapping {}", path.display()))?;
    Ok(Bytes::from_owner(m))
}

/// What a reader reads.
pub struct Source {
    pub path: PathBuf,
    /// The file's name, or for a member, the member's base name.
    pub name: String,
    pub format: Format,
    pub bytes: Bytes,
}

/// Opens `path`, or its member `member` when it is a container.
pub fn open(path: &Path, member: &str) -> Result<Source> {
    let file = map(path)?;
    let file_name = path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
    if member.is_empty() {
        return Ok(Source { path: path.to_owned(), format: format_of(&file_name), name: file_name, bytes: file });
    }
    let c = Container::open(&file).with_context(|| format!("reading the container {file_name}"))?;
    let e = c.entry(member).ok_or_else(|| anyhow!("{file_name} has no member {member}"))?;
    let bytes = match member_bytes(&file, e)? {
        std::borrow::Cow::Borrowed(_) => file.slice(e.data as usize..(e.data + e.compressed) as usize),
        std::borrow::Cow::Owned(v) => Bytes::from(v),
    };
    let name = member.rsplit('/').next().unwrap_or(member).to_owned();
    Ok(Source { path: path.to_owned(), format: format_of(&name), name, bytes })
}
