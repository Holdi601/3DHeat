//! Who may do what (docs/multiplayer.md, "Roles"). The server checks every
//! message against these; the viewer only hides what a role cannot do.

use crate::doc::{Checked, Doc};
use crate::proto::Role;

/// A role's rank: a member may moderate members below their own only.
pub fn rank(r: Role) -> u8 {
    match r {
        Role::Unspecified => 0,
        Role::Viewer => 1,
        Role::Draw => 2,
        Role::Elevated => 3,
        Role::Admin => 4,
        Role::Host => 5,
    }
}

pub fn at_least(r: Role, min: Role) -> bool {
    rank(r) >= rank(min)
}

/// Collections a draw-only member may add to (and change and erase their
/// own in), per document; any document not named here: all of them.
fn draw_colls(doc: &str) -> Option<&'static [&'static str]> {
    match doc {
        // The tactics board: drawings and notes, not figures, routes or tasks.
        "tactics" => Some(&["drawings", "notes"]),
        // The mission plan: nothing.
        "mission" => Some(&[]),
        _ => None,
    }
}

/// Whether a member of role `role` and client key `me` may apply `op` to `doc` (named `name`).
pub fn may_op(role: Role, me: &str, name: &str, doc: Option<&Doc>, op: &Checked) -> bool {
    if at_least(role, Role::Elevated) {
        return true;
    }
    if role != Role::Draw {
        return false;
    }
    let Some((coll, id)) = op.target() else {
        // The document's own fields: elevated and up.
        return false;
    };
    if let Some(allowed) = draw_colls(name) {
        if !allowed.contains(&coll) {
            return false;
        }
    }
    let existing = doc.and_then(|d| d.entity(coll, id));
    match op {
        // A new one is theirs; replacing one is changing it.
        Checked::Add { .. } => existing.is_none_or(|e| e.owner.as_deref() == Some(me)),
        // Their own only; one that is gone may be "changed" (it does nothing) only by its maker, unknown here.
        Checked::Set { .. } | Checked::Del { .. } => {
            existing.is_some_and(|e| e.owner.as_deref() == Some(me))
        }
        Checked::Meta { .. } => false,
    }
}

/// Whether `actor` may mute, kick, ban or set the role of `target`.
pub fn may_moderate(actor: Role, target: Role) -> bool {
    at_least(actor, Role::Admin) && rank(actor) > rank(target)
}

/// A role's name, for the audit log.
pub fn name(r: Role) -> &'static str {
    match r {
        Role::Unspecified => "none",
        Role::Viewer => "viewer",
        Role::Draw => "draw",
        Role::Elevated => "elevated",
        Role::Admin => "admin",
        Role::Host => "host",
    }
}

/// Whether `actor` may give the role `to` (on joining, by invite, or changing one).
pub fn may_grant(actor: Role, to: Role) -> bool {
    match actor {
        Role::Host => matches!(to, Role::Viewer | Role::Draw | Role::Elevated | Role::Admin),
        Role::Admin => matches!(to, Role::Viewer | Role::Draw | Role::Elevated),
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::doc::check_op;
    use crate::proto::{Op, OpKind};

    fn add(coll: &str, id: &str) -> Checked {
        check_op(&Op {
            kind: OpKind::Add as i32,
            coll: coll.into(),
            id: id.into(),
            json: "{}".into(),
            ..Default::default()
        })
        .unwrap()
    }
    fn del(coll: &str, id: &str) -> Checked {
        check_op(&Op {
            kind: OpKind::Del as i32,
            coll: coll.into(),
            id: id.into(),
            ..Default::default()
        })
        .unwrap()
    }
    fn meta() -> Checked {
        check_op(&Op {
            kind: OpKind::Meta as i32,
            json: r#"{"title":"x"}"#.into(),
            ..Default::default()
        })
        .unwrap()
    }

    #[test]
    fn matrix_of_ops() {
        let mut d = Doc::default();
        let mut room = 10;
        d.apply(
            &[add("drawings", "mine"), add("figures", "fig")],
            Some("me"),
            &mut room,
        )
        .unwrap();
        d.apply(&[add("drawings", "theirs")], Some("other"), &mut room)
            .unwrap();
        let d = Some(&d);
        for role in [Role::Elevated, Role::Admin, Role::Host] {
            assert!(may_op(role, "x", "tactics", d, &del("drawings", "theirs")));
            assert!(may_op(role, "x", "tactics", d, &meta()));
            assert!(may_op(role, "x", "tactics", d, &add("figures", "new")));
        }
        assert!(!may_op(Role::Viewer, "me", "marks", d, &add("marks", "n")));
        assert!(!may_op(
            Role::Unspecified,
            "me",
            "marks",
            d,
            &add("marks", "n")
        ));
        // Draw-only: own drawings and notes on the board, nothing else there.
        assert!(may_op(
            Role::Draw,
            "me",
            "tactics",
            d,
            &add("drawings", "n")
        ));
        assert!(may_op(
            Role::Draw,
            "me",
            "tactics",
            d,
            &del("drawings", "mine")
        ));
        assert!(!may_op(
            Role::Draw,
            "me",
            "tactics",
            d,
            &del("drawings", "theirs")
        ));
        assert!(!may_op(
            Role::Draw,
            "me",
            "tactics",
            d,
            &add("drawings", "theirs")
        ));
        assert!(!may_op(
            Role::Draw,
            "me",
            "tactics",
            d,
            &add("figures", "n")
        ));
        assert!(!may_op(Role::Draw, "me", "tactics", d, &meta()));
        assert!(!may_op(
            Role::Draw,
            "me",
            "tactics",
            d,
            &del("drawings", "gone")
        ));
        assert!(!may_op(Role::Draw, "me", "mission", d, &add("routes", "n")));
        // Other documents (marks, notes): any collection, own entities.
        assert!(may_op(Role::Draw, "me", "marks", None, &add("pins", "n")));
        assert!(!may_op(Role::Draw, "me", "marks", None, &meta()));
    }

    #[test]
    fn moderation_goes_down_only() {
        assert!(may_moderate(Role::Host, Role::Admin));
        assert!(may_moderate(Role::Admin, Role::Elevated));
        assert!(!may_moderate(Role::Admin, Role::Admin));
        assert!(!may_moderate(Role::Admin, Role::Host));
        assert!(!may_moderate(Role::Elevated, Role::Viewer));
        assert!(!may_moderate(Role::Host, Role::Host));
        assert!(may_grant(Role::Host, Role::Admin));
        assert!(!may_grant(Role::Admin, Role::Admin));
        assert!(!may_grant(Role::Host, Role::Host));
        assert!(!may_grant(Role::Elevated, Role::Viewer));
    }
}
