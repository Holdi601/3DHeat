//! A shared document as the server keeps it: its own fields (`meta`) and
//! named collections of entities by id, in order. The server applies every
//! sequenced operation to it the way the viewer does (`src/tactics/ops.ts`):
//! an add replaces an entity that is there, a set merges fields (the last
//! writer wins per field), an operation on an entity that is gone does
//! nothing. So a member who joins late gets the state itself, not the
//! history, and the server knows who made each entity.
//!
//! Documents are not known to the server in advance: a client registers
//! them by name ("tactics", "marks", "notes", ...), and the server holds any
//! up to `MAX_DOCS`.

use serde_json::{json, Map, Value};
use std::collections::BTreeMap;

use crate::proto::{Op, OpKind};
use crate::text;

/// Documents a session holds, at most.
pub const MAX_DOCS: usize = 32;
/// Entities in all documents together, at most.
pub const MAX_ENTITIES: usize = 200_000;
/// Collections in one document, at most.
pub const MAX_COLLS: usize = 64;
/// Operations in one batch, at most.
pub const MAX_OPS: usize = 512;

#[derive(Clone, Debug, Default)]
pub struct Entity {
    pub id: String,
    pub fields: Map<String, Value>,
    /// The client key of whoever added it; none for what a session file brought.
    pub owner: Option<String>,
}

#[derive(Clone, Debug, Default)]
pub struct Doc {
    pub meta: Map<String, Value>,
    pub colls: BTreeMap<String, Vec<Entity>>,
}

/// An operation checked and parsed, ready to apply.
#[derive(Clone, Debug)]
pub enum Checked {
    Add {
        coll: String,
        id: String,
        value: Map<String, Value>,
        index: Option<usize>,
    },
    Set {
        coll: String,
        id: String,
        fields: Map<String, Value>,
        unset: Vec<String>,
    },
    Del {
        coll: String,
        id: String,
    },
    Meta {
        fields: Map<String, Value>,
        unset: Vec<String>,
    },
}

impl Checked {
    pub fn target(&self) -> Option<(&str, &str)> {
        match self {
            Checked::Add { coll, id, .. }
            | Checked::Set { coll, id, .. }
            | Checked::Del { coll, id } => Some((coll, id)),
            Checked::Meta { .. } => None,
        }
    }
}

/// Why an operation was refused.
#[derive(Debug, PartialEq, Eq)]
pub enum OpError {
    Shape,
    Value(text::Refused),
    Full,
}

fn field_names(unset: &[String]) -> Result<Vec<String>, OpError> {
    if unset.len() > 256
        || !unset.iter().all(|k| {
            text::ident(k, 64) && !matches!(k.as_str(), "__proto__" | "constructor" | "prototype")
        })
    {
        return Err(OpError::Shape);
    }
    Ok(unset.to_vec())
}

/// Checks one operation's shape and values.
pub fn check_op(op: &Op) -> Result<Checked, OpError> {
    let kind = OpKind::try_from(op.kind).map_err(|_| OpError::Shape)?;
    let obj = |s: &str| text::object(if s.is_empty() { "{}" } else { s }).map_err(OpError::Value);
    if kind == OpKind::Meta {
        if !op.coll.is_empty() || !op.id.is_empty() {
            return Err(OpError::Shape);
        }
        return Ok(Checked::Meta {
            fields: obj(&op.json)?,
            unset: field_names(&op.unset)?,
        });
    }
    if !text::ident(&op.coll, 32) || !text::ident(&op.id, 96) {
        return Err(OpError::Shape);
    }
    let (coll, id) = (op.coll.clone(), op.id.clone());
    Ok(match kind {
        OpKind::Add => {
            if !op.unset.is_empty() {
                return Err(OpError::Shape);
            }
            let mut value = obj(&op.json)?;
            // The entity's id is the operation's.
            value.insert("id".into(), Value::String(id.clone()));
            Checked::Add {
                coll,
                id,
                value,
                index: op.index.map(|i| i as usize),
            }
        }
        OpKind::Set => {
            let mut fields = obj(&op.json)?;
            fields.remove("id");
            let unset = field_names(&op.unset)?;
            if unset.iter().any(|k| k == "id") {
                return Err(OpError::Shape);
            }
            Checked::Set {
                coll,
                id,
                fields,
                unset,
            }
        }
        OpKind::Del => {
            if !op.json.is_empty() || !op.unset.is_empty() {
                return Err(OpError::Shape);
            }
            Checked::Del { coll, id }
        }
        _ => return Err(OpError::Shape),
    })
}

impl Doc {
    pub fn entity(&self, coll: &str, id: &str) -> Option<&Entity> {
        self.colls.get(coll)?.iter().find(|e| e.id == id)
    }

    pub fn count(&self) -> usize {
        self.colls.values().map(Vec::len).sum()
    }

    /// Whether a batch fits: new collections and new entities within bounds
    /// (an upper bound: a batch that adds and deletes counts its adds).
    fn fits(&self, ops: &[Checked], room: usize) -> bool {
        let mut new_colls = std::collections::BTreeSet::new();
        let mut adds = 0usize;
        for o in ops {
            if let Checked::Add { coll, id, .. } = o {
                if !self.colls.contains_key(coll) {
                    new_colls.insert(coll.as_str());
                }
                if self.entity(coll, id).is_none() {
                    adds += 1;
                }
            }
        }
        self.colls.len() + new_colls.len() <= MAX_COLLS && adds <= room
    }

    /// Applies checked operations, all or none; `owner` is recorded for
    /// entities added. `room` is how many entities may still be added across
    /// the session.
    pub fn apply(
        &mut self,
        ops: &[Checked],
        owner: Option<&str>,
        room: &mut usize,
    ) -> Result<(), OpError> {
        if !self.fits(ops, *room) {
            return Err(OpError::Full);
        }
        for o in ops {
            match o {
                Checked::Meta { fields, unset } => {
                    for (k, v) in fields {
                        if !self.colls.contains_key(k) {
                            self.meta.insert(k.clone(), v.clone());
                        }
                    }
                    for k in unset {
                        self.meta.remove(k);
                    }
                }
                Checked::Add {
                    coll,
                    id,
                    value,
                    index,
                } => {
                    if !self.colls.contains_key(coll) && self.colls.len() >= MAX_COLLS {
                        return Err(OpError::Full);
                    }
                    let xs = self.colls.entry(coll.clone()).or_default();
                    let e = Entity {
                        id: id.clone(),
                        fields: value.clone(),
                        owner: owner.map(str::to_string),
                    };
                    if let Some(i) = xs.iter().position(|x| &x.id == id) {
                        // Replacing keeps who made it.
                        let keep = xs[i].owner.clone();
                        xs[i] = Entity { owner: keep, ..e };
                    } else {
                        if *room == 0 {
                            return Err(OpError::Full);
                        }
                        *room -= 1;
                        let at = index.unwrap_or(xs.len()).min(xs.len());
                        xs.insert(at, e);
                    }
                }
                Checked::Set {
                    coll,
                    id,
                    fields,
                    unset,
                } => {
                    if let Some(e) = self
                        .colls
                        .get_mut(coll)
                        .and_then(|xs| xs.iter_mut().find(|x| &x.id == id))
                    {
                        for (k, v) in fields {
                            e.fields.insert(k.clone(), v.clone());
                        }
                        for k in unset {
                            e.fields.remove(k);
                        }
                    }
                }
                Checked::Del { coll, id } => {
                    if let Some(xs) = self.colls.get_mut(coll) {
                        if let Some(i) = xs.iter().position(|x| &x.id == id) {
                            xs.remove(i);
                            *room += 1;
                        }
                    }
                }
            }
        }
        Ok(())
    }

    /// The document as JSON: `{"meta": {...}, "colls": {"name": [entity, ...]}}`.
    pub fn to_json(&self) -> String {
        let colls: Map<String, Value> = self
            .colls
            .iter()
            .map(|(k, xs)| {
                (
                    k.clone(),
                    Value::Array(xs.iter().map(|e| Value::Object(e.fields.clone())).collect()),
                )
            })
            .collect();
        json!({ "meta": self.meta, "colls": colls }).to_string()
    }

    /// A document from that JSON (a session file the host loads), checked like operations.
    pub fn from_json(s: &str) -> Result<Doc, OpError> {
        let root = text::object(s).map_err(OpError::Value)?;
        let mut doc = Doc::default();
        if let Some(Value::Object(m)) = root.get("meta") {
            doc.meta = m.clone();
        }
        if let Some(Value::Object(cs)) = root.get("colls") {
            if cs.len() > MAX_COLLS {
                return Err(OpError::Full);
            }
            for (name, xs) in cs {
                if !text::ident(name, 32) {
                    return Err(OpError::Shape);
                }
                let Value::Array(xs) = xs else {
                    return Err(OpError::Shape);
                };
                let mut out = Vec::with_capacity(xs.len());
                for x in xs {
                    let Value::Object(f) = x else {
                        return Err(OpError::Shape);
                    };
                    let Some(Value::String(id)) = f.get("id") else {
                        return Err(OpError::Shape);
                    };
                    if !text::ident(id, 96) {
                        return Err(OpError::Shape);
                    }
                    out.push(Entity {
                        id: id.clone(),
                        fields: f.clone(),
                        owner: None,
                    });
                }
                doc.colls.insert(name.clone(), out);
            }
        }
        Ok(doc)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn op(kind: OpKind, coll: &str, id: &str, json: &str) -> Op {
        Op {
            kind: kind as i32,
            coll: coll.into(),
            id: id.into(),
            json: json.into(),
            unset: vec![],
            index: None,
        }
    }

    fn apply(d: &mut Doc, ops: &[Op], who: &str) {
        let checked: Vec<_> = ops.iter().map(|o| check_op(o).unwrap()).collect();
        let mut room = 1000;
        d.apply(&checked, Some(who), &mut room).unwrap();
    }

    #[test]
    fn last_writer_wins_per_field() {
        let mut d = Doc::default();
        apply(
            &mut d,
            &[op(OpKind::Add, "marks", "m1", r#"{"x":1,"label":"a"}"#)],
            "alice",
        );
        apply(
            &mut d,
            &[op(OpKind::Set, "marks", "m1", r#"{"x":2}"#)],
            "bob",
        );
        apply(
            &mut d,
            &[op(OpKind::Set, "marks", "m1", r#"{"label":"b"}"#)],
            "carol",
        );
        let e = d.entity("marks", "m1").unwrap();
        assert_eq!(e.fields["x"], 2);
        assert_eq!(e.fields["label"], "b");
        assert_eq!(e.owner.as_deref(), Some("alice"));
    }

    #[test]
    fn set_after_delete_does_nothing_and_add_keeps_order() {
        let mut d = Doc::default();
        apply(
            &mut d,
            &[
                op(OpKind::Add, "a", "1", "{}"),
                op(OpKind::Add, "a", "2", "{}"),
            ],
            "x",
        );
        let mut first = op(OpKind::Add, "a", "0", "{}");
        first.index = Some(0);
        apply(&mut d, &[first], "x");
        let ids: Vec<_> = d.colls["a"].iter().map(|e| e.id.as_str()).collect();
        assert_eq!(ids, ["0", "1", "2"]);
        apply(
            &mut d,
            &[
                op(OpKind::Del, "a", "1", ""),
                op(OpKind::Set, "a", "1", r#"{"q":1}"#),
            ],
            "x",
        );
        assert!(d.entity("a", "1").is_none());
        assert_eq!(d.count(), 2);
    }

    #[test]
    fn meta_never_overwrites_a_collection() {
        let mut d = Doc::default();
        apply(&mut d, &[op(OpKind::Add, "figures", "f", "{}")], "x");
        apply(
            &mut d,
            &[Op {
                kind: OpKind::Meta as i32,
                json: r#"{"figures":5,"title":"T"}"#.into(),
                ..Default::default()
            }],
            "x",
        );
        assert_eq!(d.meta.get("figures"), None);
        assert_eq!(d.meta["title"], "T");
    }

    #[test]
    fn shapes_are_checked() {
        assert_eq!(
            check_op(&op(OpKind::Add, "bad coll", "1", "{}")).unwrap_err(),
            OpError::Shape
        );
        assert_eq!(
            check_op(&op(OpKind::Add, "c", "", "{}")).unwrap_err(),
            OpError::Shape
        );
        assert_eq!(
            check_op(&Op {
                kind: 99,
                ..Default::default()
            })
            .unwrap_err(),
            OpError::Shape
        );
        assert_eq!(
            check_op(&op(OpKind::Del, "c", "1", "{}")).unwrap_err(),
            OpError::Shape
        );
        assert!(matches!(
            check_op(&op(OpKind::Add, "c", "1", r#"{"__proto__":1}"#)),
            Err(OpError::Value(_))
        ));
        let mut u = op(OpKind::Set, "c", "1", "{}");
        u.unset = vec!["id".into()];
        assert_eq!(check_op(&u).unwrap_err(), OpError::Shape);
    }

    #[test]
    fn json_round_trip() {
        let mut d = Doc::default();
        apply(
            &mut d,
            &[
                op(OpKind::Add, "marks", "m1", r#"{"x":1}"#),
                Op {
                    kind: OpKind::Meta as i32,
                    json: r#"{"t":"x"}"#.into(),
                    ..Default::default()
                },
            ],
            "a",
        );
        let back = Doc::from_json(&d.to_json()).unwrap();
        assert_eq!(back.to_json(), d.to_json());
        assert!(back.entity("marks", "m1").unwrap().owner.is_none());
    }

    #[test]
    fn room_bounds_entities() {
        let mut d = Doc::default();
        let mut room = 1;
        let a = check_op(&op(OpKind::Add, "c", "1", "{}")).unwrap();
        let b = check_op(&op(OpKind::Add, "c", "2", "{}")).unwrap();
        d.apply(&[a.clone()], None, &mut room).unwrap();
        // Replacing takes no room.
        d.apply(&[a], None, &mut room).unwrap();
        assert_eq!(d.apply(&[b], None, &mut room), Err(OpError::Full));
    }
}
