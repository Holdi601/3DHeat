"""How should a *session* be labelled, given the team sizes found inside it?

The landing rule finds mostly singletons — 83% of teams are one player, robustly
across radii from 25m to 100m — so the modal team size labels 94% of sessions
"solo". That may be true of how people queue, but it makes a poor filter and it
is not obviously what "a trio session" means: a trio lobby with ten trios and
twenty solo queuers is still a trio lobby.

So: three candidate definitions, and what each does to the distribution. The
choice is a judgement about the game rather than about the data, which is exactly
the kind of thing to put numbers next to before deciding.

    python tools/sweep_modes.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_teams as dt  # noqa: E402


def main():
    if not os.path.exists(dt.RAW_CACHE):
        print("no cached scan; run: python tools/derive_teams.py --scan --limit 6")
        return 1
    with open(dt.RAW_CACHE) as fh:
        raw = json.load(fh)
    seen = {}
    for k, v in raw["seen"].items():
        s, n = k.split("\t", 1)
        seen[(s, n)] = [v[0], tuple(v[1]) if v[1] else None, tuple(v[2]) if v[2] else None]

    # The per-session groupings, once, with the chosen thresholds.
    by_session = {}
    for key, (first_t, ocean, shore) in seen.items():
        o = ocean if ocean is not None and ocean[0] - first_t <= dt.WINDOW_S else None
        s = shore if shore is not None and shore[0] - first_t <= dt.WINDOW_S else None
        if o is None or s is None:
            continue
        by_session.setdefault(key[0], []).append((key[1], s))

    defs = {"modal": {}, "max": {}, "max seen twice": {}}
    for session, members in by_session.items():
        sizes = [len(g) for g in dt._components(members)]
        if not sizes:
            continue
        counts = {n: sizes.count(n) for n in set(sizes)}
        # Modal: the commonest size, ties to the larger.
        modal = max(counts, key=lambda n: (counts[n], n))
        # Max: any occurrence of a size decides the lobby.
        biggest = max(counts)
        # Max seen twice: a lobby type ought to appear more than once, so a single
        # coincidental pair among solo queuers does not relabel the session.
        twice = max([n for n, c in counts.items() if c >= 2] or [min(counts)])
        for name, val in (("modal", modal), ("max", biggest), ("max seen twice", twice)):
            defs[name][session] = val

    print("{:,} sessions with at least one full offshore-to-shore transition\n".format(
        len(by_session)))
    print("{:>16} {:>9} {:>9} {:>9} {:>9}".format("definition", "solo", "duo", "trio", "4+"))
    for name, table in defs.items():
        total = len(table) or 1
        c = {}
        for v in table.values():
            c[v] = c.get(v, 0) + 1
        four = sum(v for k, v in c.items() if k >= 4)
        print(
            "{:>16} {:>8.1%} {:>8.1%} {:>8.1%} {:>8.1%}".format(
                name, c.get(1, 0) / total, c.get(2, 0) / total, c.get(3, 0) / total, four / total
            )
        )

    # How many players a session has a transition for at all. If it is two or
    # three, no definition can tell a solo lobby from a trio one — there is not
    # enough of the lobby visible to say.
    sizes = sorted(len(v) for v in by_session.values())
    q = lambda f: sizes[int((len(sizes) - 1) * f)]  # noqa: E731
    print(
        "\nplayers per session with a transition: min {}, 25% {}, median {}, 75% {}, max {}".format(
            q(0), q(0.25), q(0.5), q(0.75), q(1)
        )
    )
    thin = sum(1 for n in sizes if n < 6)
    print("sessions with fewer than 6 such players: {:,} ({:.0%})".format(thin, thin / len(sizes)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
