//! Columns as the readers hand them on: numbers, or text as a dictionary.

use std::collections::HashMap;

/// Text interned in order of first appearance, as the web app's `Dictionary` does:
/// the first distinct value is id 0, the next new one id 1, and so on. The order
/// matters - it decides which person or team is index 0 in the viewer.
#[derive(Debug, Default, Clone)]
pub struct Dict {
    pub labels: Vec<String>,
    pub ids: Vec<u32>,
    index: HashMap<String, u32>,
}

impl Dict {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_capacity(rows: usize) -> Self {
        Self { labels: Vec::new(), ids: Vec::with_capacity(rows), index: HashMap::new() }
    }

    /// The id of `s`, adding it when new.
    pub fn intern(&mut self, s: &str) -> u32 {
        if let Some(&id) = self.index.get(s) {
            return id;
        }
        let id = self.labels.len() as u32;
        self.labels.push(s.to_owned());
        self.index.insert(s.to_owned(), id);
        id
    }

    /// Interns `s` and appends its id as the next row.
    pub fn push(&mut self, s: &str) {
        let id = self.intern(s);
        self.ids.push(id);
    }

    pub fn len(&self) -> usize {
        self.ids.len()
    }

    pub fn is_empty(&self) -> bool {
        self.ids.is_empty()
    }

    /// Appends `other` after this one: its labels re-interned in its own order of
    /// first appearance, so the result is what one pass over both would have built.
    pub fn append(&mut self, other: &Dict) {
        let remap: Vec<u32> = other.labels.iter().map(|l| self.intern(l)).collect();
        self.ids.extend(other.ids.iter().map(|&i| remap[i as usize]));
    }

    /// Labels and ids, dropping the lookup table.
    pub fn into_parts(self) -> (Vec<String>, Vec<u32>) {
        (self.labels, self.ids)
    }
}

/// One column of a table a reader produced.
#[derive(Debug, Clone)]
pub enum Column {
    /// Numbers; NaN where absent.
    Num(Vec<f64>),
    /// Text, dictionary-encoded.
    Text(Dict),
}

impl Column {
    pub fn len(&self) -> usize {
        match self {
            Column::Num(v) => v.len(),
            Column::Text(d) => d.len(),
        }
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn is_numeric(&self) -> bool {
        matches!(self, Column::Num(_))
    }
}

/// A whole table in memory: what the ACMI reader builds, as `MemoryTable` in
/// `src/data/tableIngest.ts`.
#[derive(Debug, Clone, Default)]
pub struct MemoryTable {
    pub columns: Vec<String>,
    pub data: Vec<Column>,
    pub rows: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn append_keeps_first_appearance_order() {
        let mut a = Dict::new();
        for s in ["b", "a", "b"] {
            a.push(s);
        }
        let mut b = Dict::new();
        for s in ["c", "a", "c"] {
            b.push(s);
        }
        a.append(&b);
        assert_eq!(a.labels, ["b", "a", "c"]);
        assert_eq!(a.ids, [0, 1, 0, 2, 1, 2]);
    }
}
