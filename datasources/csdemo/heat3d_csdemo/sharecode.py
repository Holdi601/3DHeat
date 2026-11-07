"""
Match share codes — the handle Valve gives a player for one of their matches.

A share code looks like `CSGO-ADkRz-6dHmX-8mE9M-ndBGE-eqnQF` and is not an
opaque identifier: it is three numbers packed into base 57. Decoding it locally
matters because it turns "the user pasted a code" into "we know which match this
is" without asking anyone's server, and because the match id is what everything
downstream is keyed on.

    match id    which match, in Valve's records
    outcome id  which outcome record, needed alongside the match id
    token       a short per-match token

The alphabet omits the characters people confuse when copying by hand — I, l, g,
0, 1 — which is why it is 57 letters rather than 62, and why a code cannot simply
be treated as base 62.

Nothing here contacts Valve. This is arithmetic on a string the user already has;
fetching anything with it is `matchhistory.py`, which needs credentials the user
supplies.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

#: 57 characters: A–Z without I, a–z without g and l, digits 2–9. The omissions
#: are the ones that look like each other in print.
DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789"

#: Codes are always this many characters once the prefix and dashes are gone.
BODY_LENGTH = 25

#: The packed form is eighteen bytes: two 64-bit numbers and a 16-bit one.
PACKED_BYTES = 18

_PATTERN = re.compile(r"^CSGO(-[%s]{5}){5}$" % re.escape(DICTIONARY))


class InvalidShareCode(ValueError):
    """The string is not a share code, and the message says what was wrong."""


@dataclass(frozen=True)
class ShareCode:
    """One decoded share code."""

    match_id: int
    outcome_id: int
    token: int

    def encode(self) -> str:
        """Back to the string form. Exact: `decode(encode(x)) == x` for all x."""
        return encode(self.match_id, self.outcome_id, self.token)


def looks_like(text: str) -> bool:
    """Whether a string is shaped like a share code, without decoding it."""
    return bool(_PATTERN.match(text.strip()))


def decode(code: str) -> ShareCode:
    """
    Turn `CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx` into the three numbers in it.

    Read least-significant character first, which is the part that is easy to
    get backwards: the code is written most-significant group leftmost like an
    ordinary number, but the *bytes* it packs to are then split little-endian.
    Getting either end the wrong way round yields a large plausible integer and
    a match id that no server has ever heard of.
    """
    text = code.strip()
    if not looks_like(text):
        raise InvalidShareCode(
            f"{code!r} is not a share code. They look like "
            "CSGO-ADkRz-6dHmX-8mE9M-ndBGE-eqnQF — five groups of five, from an "
            "alphabet with no I, l, g, 0 or 1 in it."
        )

    body = text[len("CSGO-") :].replace("-", "")
    if len(body) != BODY_LENGTH:
        raise InvalidShareCode(f"{code!r} has {len(body)} characters, not {BODY_LENGTH}")

    value = 0
    for character in reversed(body):
        value = value * len(DICTIONARY) + DICTIONARY.index(character)

    raw = value.to_bytes(PACKED_BYTES, "big")
    return ShareCode(
        match_id=int.from_bytes(raw[0:8], "little"),
        outcome_id=int.from_bytes(raw[8:16], "little"),
        token=int.from_bytes(raw[16:18], "little"),
    )


def encode(match_id: int, outcome_id: int, token: int) -> str:
    """The inverse of `decode`, so a round trip can be tested rather than assumed."""
    if not 0 <= token < 1 << 16:
        raise ValueError(f"token {token} does not fit in 16 bits")
    for name, number in (("match id", match_id), ("outcome id", outcome_id)):
        if not 0 <= number < 1 << 64:
            raise ValueError(f"{name} {number} does not fit in 64 bits")

    raw = (
        match_id.to_bytes(8, "little")
        + outcome_id.to_bytes(8, "little")
        + token.to_bytes(2, "little")
    )
    value = int.from_bytes(raw, "big")

    characters = []
    for _ in range(BODY_LENGTH):
        value, remainder = divmod(value, len(DICTIONARY))
        characters.append(DICTIONARY[remainder])
    body = "".join(characters)
    groups = [body[i : i + 5] for i in range(0, BODY_LENGTH, 5)]
    return "CSGO-" + "-".join(groups)


def find_all(text: str) -> list[str]:
    """
    Every share code in a block of text, in order, without duplicates.

    For pasting: people collect these from the game, from Discord, from a
    spreadsheet, and asking them to clean the list up first is asking them to do
    something a regular expression does better.
    """
    pattern = re.compile(r"CSGO(?:-[%s]{5}){5}" % re.escape(DICTIONARY))
    seen: list[str] = []
    for match in pattern.finditer(text):
        if match.group(0) not in seen:
            seen.append(match.group(0))
    return seen
