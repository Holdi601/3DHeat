"""
Tests for walking a player's match history.

Nothing here talks to Valve. The endpoint is stubbed, because what is worth
testing is the walk's own behaviour: that it stops when it catches up rather
than looping, that it bounds itself, that it can be resumed, and — most of all —
that each way Valve says no is translated into something the user can act on.

That last point is why the error mapping is tested case by case. "403" tells a
user nothing; "the authentication code does not belong to that Steam id" tells
them which of the two things they pasted is wrong.
"""

from __future__ import annotations

import urllib.error

import pytest

from heat3d_csdemo import matchhistory
from heat3d_csdemo.matchhistory import Credentials, MatchHistoryError, walk
from heat3d_csdemo.sharecode import encode


def good_credentials() -> Credentials:
    return Credentials(
        steam_id="76561198000000000",
        auth_code="ABCD-EFGHI-JKLM",
        web_api_key="0123456789ABCDEF0123456789ABCDEF",
    )


@pytest.fixture
def chain(monkeypatch):
    """Stub Valve: a fixed sequence of matches, then 'caught up'."""
    codes = [encode(i, i + 1, i) for i in range(1, 5)]
    calls: list[str] = []

    def fake(credentials, known, *, timeout):
        calls.append(known)
        if known in codes:
            index = codes.index(known)
            return codes[index + 1] if index + 1 < len(codes) else None
        return codes[0]

    monkeypatch.setattr(matchhistory, "_request", fake)
    return codes, calls


class TestWalking:
    def test_it_follows_the_chain_to_the_end(self, chain):
        codes, _ = chain
        start = encode(0, 1, 0)

        found = walk(good_credentials(), start, interval=0)

        assert found.codes == codes
        assert found.stopped == "caught up"
        assert found.last == codes[-1]

    def test_it_reports_each_code_as_it_arrives(self, chain):
        """A walk is one request per match; a caller showing progress needs them
        as they come, not in a batch at the end."""
        seen = []

        walk(good_credentials(), encode(0, 1, 0), interval=0, on_found=lambda c, n: seen.append((c, n)))

        assert [n for _, n in seen] == [1, 2, 3, 4]

    def test_the_limit_is_a_guard_and_is_reported(self, chain):
        found = walk(good_credentials(), encode(0, 1, 0), limit=2, interval=0)

        assert len(found.codes) == 2
        assert "limit" in found.stopped

    def test_a_stopped_walk_can_be_resumed_from_where_it_got_to(self, chain):
        codes, _ = chain
        first = walk(good_credentials(), encode(0, 1, 0), limit=2, interval=0)

        second = walk(good_credentials(), first.last, interval=0)

        assert first.codes + second.codes == codes

    def test_an_account_with_nothing_new_returns_nothing_and_says_so(self, monkeypatch):
        monkeypatch.setattr(matchhistory, "_request", lambda c, k, *, timeout: None)

        found = walk(good_credentials(), encode(1, 2, 3), interval=0)

        assert found.codes == []
        assert found.stopped == "caught up"


class TestTranslatingValvesRefusals:
    def raising(self, code, reason):
        """Stub `urlopen` itself, so the real error handling is what runs."""

        def fake(url, timeout=None):
            raise urllib.error.HTTPError(
                matchhistory.ENDPOINT, code, reason, None, None
            )

        return fake

    @pytest.mark.parametrize(
        "code,expected",
        [
            (403, "credentials"),
            (412, "did not recognise"),
            (429, "rate limiting"),
        ],
    )
    def test_each_refusal_becomes_something_actionable(self, monkeypatch, code, expected):
        monkeypatch.setattr(
            matchhistory.urllib.request, "urlopen", self.raising(code, "nope")
        )

        found = walk(good_credentials(), encode(1, 2, 3), interval=0)

        assert expected in found.stopped

    def test_an_unreachable_server_is_not_confused_with_a_refusal(self, monkeypatch):
        def unreachable(*args, **kwargs):
            raise urllib.error.URLError("no route to host")

        monkeypatch.setattr(matchhistory.urllib.request, "urlopen", unreachable)

        found = walk(good_credentials(), encode(1, 2, 3), interval=0)

        assert "could not reach" in found.stopped


class TestCheckingWhatTheUserTyped:
    def test_a_missing_credential_names_itself_and_where_to_get_it(self):
        credentials = Credentials(steam_id="76561198000000000", auth_code="", web_api_key="k")

        with pytest.raises(MatchHistoryError, match="authentication code"):
            credentials.validate()

    def test_the_help_links_are_in_the_message(self):
        credentials = Credentials(steam_id="", auth_code="", web_api_key="")

        with pytest.raises(MatchHistoryError, match="help.steampowered.com"):
            credentials.validate()

    def test_something_that_is_not_a_steam_id(self):
        credentials = Credentials(
            steam_id="someone", auth_code="a", web_api_key="k"
        )

        with pytest.raises(MatchHistoryError, match="17 digits"):
            credentials.validate()

    def test_a_starting_point_that_is_not_a_share_code(self):
        with pytest.raises(MatchHistoryError, match="not a share code"):
            walk(good_credentials(), "last tuesday", interval=0)
