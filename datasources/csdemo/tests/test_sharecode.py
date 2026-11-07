"""
Tests for match share codes.

There is no server involved and no fixture to trust, so the tests lean on the
one thing that is checkable without either: `decode` and `encode` are exact
inverses. A round trip over a wide spread of values pins the byte order, the
digit order and the alphabet all at once — and those are precisely what a
hand-written base-57 codec gets wrong, in ways that still produce a plausible
number.
"""

from __future__ import annotations

import pytest

from heat3d_csdemo.sharecode import (
    BODY_LENGTH,
    DICTIONARY,
    InvalidShareCode,
    ShareCode,
    decode,
    encode,
    find_all,
    looks_like,
)


class TestTheAlphabet:
    def test_it_has_fifty_seven_distinct_characters(self):
        assert len(DICTIONARY) == 57
        assert len(set(DICTIONARY)) == 57

    def test_it_omits_exactly_the_confusable_ones(self):
        """
        I, l, g, 0 and 1 are absent — which is why this is base 57 and not base
        62, and why treating a code as ordinary base 62 decodes to nonsense.
        """
        for character in "Ilg01":
            assert character not in DICTIONARY
        assert set(DICTIONARY) == set(
            "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789"
        )


class TestRoundTrip:
    @pytest.mark.parametrize(
        "match_id,outcome_id,token",
        [
            (0, 0, 0),
            (1, 1, 1),
            (3_300_000_000_000_000_000, 3_300_000_000_000_000_001, 1234),
            (2**64 - 1, 2**64 - 1, 2**16 - 1),
            (123456789, 987654321, 42),
        ],
    )
    def test_encode_then_decode_is_the_identity(self, match_id, outcome_id, token):
        code = encode(match_id, outcome_id, token)

        assert looks_like(code)
        assert decode(code) == ShareCode(match_id, outcome_id, token)

    def test_decode_then_encode_is_the_identity(self):
        original = encode(3_300_123_456_789_012_345, 3_300_123_456_789_012_346, 30000)

        assert decode(original).encode() == original

    def test_the_three_fields_are_independent(self):
        """
        Changing one number must change the code, and changing it back must
        restore it. A codec that packs the bytes in the wrong order can still
        round-trip while mixing the fields up, so this checks them one at a time.
        """
        base = ShareCode(1000, 2000, 300)
        for changed in (
            ShareCode(1001, 2000, 300),
            ShareCode(1000, 2001, 300),
            ShareCode(1000, 2000, 301),
        ):
            assert changed.encode() != base.encode()
            assert decode(changed.encode()) == changed


class TestShape:
    def test_a_code_has_five_groups_of_five(self):
        code = encode(1, 2, 3)

        parts = code.split("-")
        assert parts[0] == "CSGO"
        assert len(parts) == 6
        assert all(len(p) == 5 for p in parts[1:])
        assert len(code.replace("CSGO-", "").replace("-", "")) == BODY_LENGTH

    def test_surrounding_whitespace_is_ignored(self):
        code = encode(7, 8, 9)

        assert decode(f"  {code}\n") == ShareCode(7, 8, 9)


class TestRefusing:
    def test_something_that_is_not_a_code(self):
        with pytest.raises(InvalidShareCode, match="not a share code"):
            decode("hello there")

    def test_a_code_with_a_confusable_character_in_it(self):
        """
        `l` is not in the alphabet, so a code containing one was mistyped — very
        likely a `1`. Refusing beats decoding it as something else.
        """
        broken = encode(1, 2, 3).replace(encode(1, 2, 3)[5], "l", 1)

        with pytest.raises(InvalidShareCode):
            decode(broken)

    def test_the_wrong_number_of_groups(self):
        with pytest.raises(InvalidShareCode):
            decode("CSGO-ADkRz-6dHmX-8mE9M-ndBGE")

    def test_a_token_that_does_not_fit(self):
        with pytest.raises(ValueError, match="16 bits"):
            encode(1, 2, 1 << 16)

    def test_an_id_that_does_not_fit(self):
        with pytest.raises(ValueError, match="64 bits"):
            encode(1 << 64, 2, 3)


class TestPickingCodesOutOfText:
    def test_it_finds_several_in_a_paste(self):
        first, second = encode(1, 2, 3), encode(4, 5, 6)
        text = f"here are mine:\n{first}\nand also {second} thanks"

        assert find_all(text) == [first, second]

    def test_duplicates_are_collapsed_but_order_is_kept(self):
        first, second = encode(1, 2, 3), encode(4, 5, 6)

        assert find_all(f"{first} {second} {first}") == [first, second]

    def test_text_with_no_codes_gives_nothing(self):
        assert find_all("no codes here, just words") == []
