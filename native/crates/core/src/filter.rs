//! The load plan's row filter (`src/data/rowFilter.ts`), decided while a file is read.
//!
//! Clauses combine with AND. A set clause keeps a row whose value, written the way
//! the preview shows it, is one of its values (`""` stands for empty, and so for a
//! null); a range keeps a row whose numeric value lies in `[min, max]`, an open
//! bound being no bound, and an unreadable value fails. A set with no values and
//! a range with no bounds restrict nothing and are dropped (`active`).

use std::collections::HashSet;

#[derive(Debug, Clone, PartialEq)]
pub enum Clause {
    Set { column: String, values: Vec<String> },
    Range { column: String, min: Option<f64>, max: Option<f64> },
}

impl Clause {
    pub fn column(&self) -> &str {
        match self {
            Clause::Set { column, .. } | Clause::Range { column, .. } => column,
        }
    }

    pub fn is_active(&self) -> bool {
        match self {
            Clause::Set { values, .. } => !values.is_empty(),
            Clause::Range { min, max, .. } => min.is_some() || max.is_some(),
        }
    }

    pub fn compile(&self) -> Test {
        match self {
            Clause::Set { values, .. } => {
                let set: HashSet<String> = values.iter().cloned().collect();
                Test::Set { empty: set.contains(""), set }
            }
            Clause::Range { min, max, .. } => Test::Range {
                lo: min.unwrap_or(f64::NEG_INFINITY),
                hi: max.unwrap_or(f64::INFINITY),
            },
        }
    }
}

/// The clauses that restrict something.
pub fn active(clauses: &[Clause]) -> Vec<Clause> {
    clauses.iter().filter(|c| c.is_active()).cloned().collect()
}

/// One clause, ready to test values.
#[derive(Debug, Clone)]
pub enum Test {
    Set { set: HashSet<String>, empty: bool },
    Range { lo: f64, hi: f64 },
}

impl Test {
    /// A missing value: a null, or a column the file does not have.
    pub fn null(&self) -> bool {
        match self {
            Test::Set { empty, .. } => *empty,
            Test::Range { .. } => false,
        }
    }

    /// A value already written as text (`displayValue`).
    pub fn text(&self, s: &str) -> bool {
        match self {
            Test::Set { set, .. } => set.contains(s),
            Test::Range { lo, hi } => {
                // `toNumber` of a string: `Number(s)` when finite, else NaN.
                let x = crate::jsnum::js_number(s);
                x.is_finite() && x >= *lo && x <= *hi
            }
        }
    }

    /// A number. For a set it is compared as `String(number)`.
    pub fn number(&self, x: f64) -> bool {
        match self {
            Test::Set { set, .. } => set.contains(&crate::jsnum::js_string(x)),
            Test::Range { lo, hi } => x >= *lo && x <= *hi,
        }
    }

    /// A 64-bit integer, which JavaScript reads as a BigInt: written exactly, compared as `Number`.
    pub fn int64(&self, x: i64) -> bool {
        match self {
            Test::Set { set, .. } => set.contains(&x.to_string()),
            Test::Range { lo, hi } => {
                let v = x as f64;
                v >= *lo && v <= *hi
            }
        }
    }

    pub fn uint64(&self, x: u64) -> bool {
        match self {
            Test::Set { set, .. } => set.contains(&x.to_string()),
            Test::Range { lo, hi } => {
                let v = x as f64;
                v >= *lo && v <= *hi
            }
        }
    }

    pub fn is_set(&self) -> bool {
        matches!(self, Test::Set { .. })
    }
}

/// What the filter did to one file, as `SourceBlock.filtered`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct FilterStats {
    pub rows: u64,
    pub kept: u64,
    pub rows_skipped: u64,
    pub groups: u64,
    pub groups_skipped: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn set_and_range() {
        let s = Clause::Set { column: "k".into(), values: vec!["a".into(), "".into()] }.compile();
        assert!(s.text("a") && !s.text("b") && s.null());
        let r = Clause::Range { column: "v".into(), min: Some(1.0), max: None }.compile();
        assert!(r.number(1.0) && !r.number(0.5) && !r.number(f64::NAN) && !r.null());
        let n = Clause::Set { column: "n".into(), values: vec!["1.5".into(), "3".into()] }.compile();
        assert!(n.number(1.5) && n.number(3.0) && n.int64(3) && !n.number(2.0));
        assert!(!Clause::Set { column: "k".into(), values: vec![] }.is_active());
    }
}
