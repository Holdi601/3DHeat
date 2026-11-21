//! What the server lets through of the text and values clients send: names
//! and notes NFC-normalised, without control or direction-override
//! characters, cut to length; the JSON of an operation bounded in depth,
//! size and string length, with no key a browser would treat as an object's
//! prototype.

use serde_json::{Map, Value};
use unicode_normalization::UnicodeNormalization;

/// A member's name, at most.
pub const NAME_CHARS: usize = 40;
/// A "look here" note or an invite label, at most.
pub const NOTE_CHARS: usize = 200;
/// A string inside an operation (a note's text, a document's paragraph), at most.
pub const VALUE_CHARS: usize = 16_000;
/// Nesting of an operation's JSON, at most.
pub const JSON_DEPTH: usize = 12;
/// Coordinates beyond this are refused (metres, any game's world fits).
pub const WORLD_LIMIT: f64 = 1.0e8;
/// Numbers in an operation's JSON beyond this are refused (a timestamp in milliseconds fits).
pub const NUMBER_LIMIT: f64 = 9.0e15;

/// Whether a character is dropped from text: controls (but newline and tab
/// in multi-line text) and the bidirectional overrides and isolates that
/// make text read other than it is stored.
fn dropped(c: char, multiline: bool) -> bool {
    if multiline && (c == '\n' || c == '\t') {
        return false;
    }
    c.is_control()
        || matches!(c, '\u{200B}'..='\u{200F}' | '\u{202A}'..='\u{202E}' | '\u{2060}'..='\u{2064}' | '\u{2066}'..='\u{2069}' | '\u{FEFF}' | '\u{FFF9}'..='\u{FFFB}')
}

/// Text as the server keeps it: NFC, cleaned, trimmed, at most `max` characters.
pub fn clean(s: &str, max: usize, multiline: bool) -> String {
    let out: String = s
        .nfc()
        .filter(|&c| !dropped(c, multiline))
        .take(max)
        .collect();
    out.trim().to_string()
}

/// A member's name: cleaned; empty becomes `fallback`.
pub fn name(s: &str, fallback: &str) -> String {
    let n = clean(s, NAME_CHARS, false);
    if n.is_empty() {
        fallback.to_string()
    } else {
        n
    }
}

/// An identifier (a document, collection or entity id): 1..=max of `[A-Za-z0-9_.:-]`.
pub fn ident(s: &str, max: usize) -> bool {
    !s.is_empty()
        && s.len() <= max
        && s.bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'_' | b'-' | b'.' | b':'))
}

/// Keys that would reach an object's prototype in a browser.
fn bad_key(k: &str) -> bool {
    matches!(k, "__proto__" | "constructor" | "prototype")
}

/// Why a value was refused.
#[derive(Debug, PartialEq, Eq)]
pub enum Refused {
    Json,
    Depth,
    Key,
    Number,
    TooLong,
}

/// A JSON object from an operation, checked and cleaned: strings normalised
/// and bounded, numbers finite and inside the world, depth bounded, no
/// prototype keys.
pub fn object(json: &str) -> Result<Map<String, Value>, Refused> {
    let v: Value = serde_json::from_str(json).map_err(|_| Refused::Json)?;
    match check(v, 0)? {
        Value::Object(m) => Ok(m),
        _ => Err(Refused::Json),
    }
}

fn check(v: Value, depth: usize) -> Result<Value, Refused> {
    if depth > JSON_DEPTH {
        return Err(Refused::Depth);
    }
    Ok(match v {
        Value::String(s) => {
            if s.chars().count() > VALUE_CHARS {
                return Err(Refused::TooLong);
            }
            Value::String(clean_value(&s))
        }
        Value::Number(n) => {
            let f = n.as_f64().ok_or(Refused::Number)?;
            if !f.is_finite() || f.abs() > NUMBER_LIMIT {
                return Err(Refused::Number);
            }
            Value::Number(n)
        }
        Value::Array(xs) => Value::Array(
            xs.into_iter()
                .map(|x| check(x, depth + 1))
                .collect::<Result<_, _>>()?,
        ),
        Value::Object(m) => {
            let mut out = Map::new();
            for (k, x) in m {
                if bad_key(&k) || k.len() > 64 {
                    return Err(Refused::Key);
                }
                out.insert(k, check(x, depth + 1)?);
            }
            Value::Object(out)
        }
        other => other,
    })
}

/// A string value: NFC, no controls but newline and tab, no direction overrides (not trimmed).
fn clean_value(s: &str) -> String {
    s.nfc().filter(|&c| !dropped(c, true)).collect()
}

/// Whether a float is a usable coordinate.
pub fn coord(f: f32) -> bool {
    f.is_finite() && (f as f64).abs() <= WORLD_LIMIT
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_lose_controls_and_overrides() {
        assert_eq!(name("  Al\u{202E}ice\u{0007} ", "Guest"), "Alice");
        assert_eq!(name("\u{200B}\u{2066}", "Guest 3"), "Guest 3");
        assert_eq!(name(&"x".repeat(100), "g").chars().count(), NAME_CHARS);
        // NFC: e + combining acute is one character.
        assert_eq!(name("e\u{0301}", "g"), "\u{00E9}");
    }

    #[test]
    fn objects_are_bounded() {
        assert!(object(r#"{"a":1,"b":[1,2,{"c":"x"}]}"#).is_ok());
        assert_eq!(object(r#"{"__proto__":{"x":1}}"#), Err(Refused::Key));
        assert_eq!(object(r#"{"a":{"constructor":1}}"#), Err(Refused::Key));
        assert_eq!(object(r#"{"a":1e300}"#), Err(Refused::Number));
        assert_eq!(object(r#"[1]"#), Err(Refused::Json));
        assert_eq!(object("{"), Err(Refused::Json));
        let deep = format!("{}1{}", "{\"a\":".repeat(20), "}".repeat(20));
        assert_eq!(object(&deep), Err(Refused::Depth));
        let long = format!("{{\"t\":\"{}\"}}", "x".repeat(VALUE_CHARS + 1));
        assert_eq!(object(&long), Err(Refused::TooLong));
        let m = object("{\"t\":\"a\u{202E}b\\nc\"}").unwrap();
        assert_eq!(m["t"], "ab\nc");
    }

    #[test]
    fn idents() {
        assert!(ident("tactics", 32));
        assert!(ident("f_12-x.y:z", 64));
        assert!(!ident("", 32));
        assert!(!ident("a b", 32));
        assert!(!ident("ä", 32));
        assert!(!ident(&"a".repeat(33), 32));
    }
}
