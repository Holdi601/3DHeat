"""
Finding a player's matches automatically, through Valve's own interface.

Valve publishes one endpoint for this — `GetNextMatchSharingCode` — and it works
by walking a chain: given the share code of a match you already know about, it
returns the code of the *next* one. Start from the oldest code you have and keep
asking, and you end up with everything since.

That shape is worth understanding before using it, because it explains both the
credentials and the limits:

    steamid      whose history to walk
    steamidkey   an authentication code the player generates for themselves
    knowncode    where in the chain to continue from
    key          a Steam Web API key, which is per-developer, not per-player

The `steamidkey` is the important one. It is issued by Valve to the *account
holder*, from Steam's own support pages, and it authorises reading that account's
match history and nothing else. So this can only ever see matches belonging to
someone who has chosen to hand over their own code — which is the right property
for a tool like this to have, and it is why there is no way here to point it at
another player.

Nothing is stored. The credentials are passed in, used, and forgotten; writing
them to a config file would make them this project's problem to protect.

What this does not do
---------------------
Turn a share code into a downloadable demo. That step goes through the game
coordinator rather than the web API, needs a logged-in Steam connection, and is
`download.py`'s business — and on the days Valve's demo service is behind, no
amount of correct code produces a file.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field

from .sharecode import ShareCode, decode, looks_like

ENDPOINT = (
    "https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1"
)

#: Where a player gets the two things they need. Printed rather than linked-to
#: in a comment, because someone hitting an authentication error needs it there.
AUTH_HELP = (
    "Match history authentication code: "
    "https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128\n"
    "Steam Web API key: https://steamcommunity.com/dev/apikey"
)

#: Valve answers this when the chain has reached the newest match. It is the
#: normal end of a walk, not a failure.
NO_MORE = "n/a"

#: Seconds between requests. Valve does not publish a rate limit for this
#: endpoint; one a second is unhurried and has never been refused in testing.
INTERVAL = 1.0


class MatchHistoryError(Exception):
    """The walk could not continue, and the message says whether that is fixable."""


@dataclass
class Credentials:
    """What Valve needs to let someone read their own history."""

    steam_id: str
    #: The per-account code from Valve's support page. Not a password, and not
    #: reusable for anything else.
    auth_code: str
    #: A Steam Web API key.
    web_api_key: str

    def validate(self) -> None:
        missing = [
            name
            for name, value in (
                ("steam id", self.steam_id),
                ("authentication code", self.auth_code),
                ("web API key", self.web_api_key),
            )
            if not str(value).strip()
        ]
        if missing:
            raise MatchHistoryError(
                f"missing {', '.join(missing)}.\n{AUTH_HELP}"
            )
        if not str(self.steam_id).isdigit() or len(str(self.steam_id)) != 17:
            raise MatchHistoryError(
                f"{self.steam_id!r} is not a 64-bit Steam id. It is 17 digits and "
                "starts with 7656119."
            )


@dataclass
class Walk:
    """What one walk found, including where it stopped and why."""

    codes: list[str] = field(default_factory=list)
    #: The last code successfully reached, to resume from next time.
    last: str = ""
    #: "caught up", "limit", or an error description.
    stopped: str = ""

    def decoded(self) -> list[ShareCode]:
        return [decode(c) for c in self.codes]


def _request(credentials: Credentials, known: str, *, timeout: float) -> str | None:
    query = urllib.parse.urlencode(
        {
            "key": credentials.web_api_key,
            "steamid": credentials.steam_id,
            "steamidkey": credentials.auth_code,
            "knowncode": known,
        }
    )
    try:
        with urllib.request.urlopen(f"{ENDPOINT}?{query}", timeout=timeout) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as exc:
        # Valve's codes here are specific and each means something different to
        # the user, so they are translated rather than passed through.
        if exc.code == 403:
            raise MatchHistoryError(
                "Valve refused the credentials. Either the Web API key is wrong, "
                f"or the authentication code does not belong to that Steam id.\n{AUTH_HELP}"
            ) from exc
        if exc.code == 412:
            raise MatchHistoryError(
                f"Valve did not recognise {known!r} as one of this account's "
                "matches. Start from a share code taken from your own match "
                "history, not someone else's."
            ) from exc
        if exc.code == 429:
            raise MatchHistoryError("Valve is rate limiting; wait and try again.") from exc
        raise MatchHistoryError(f"Valve answered {exc.code} {exc.reason}") from exc
    except urllib.error.URLError as exc:
        raise MatchHistoryError(f"could not reach Valve: {exc.reason}") from exc

    code = (payload.get("result") or {}).get("nextcode")
    if code in (None, NO_MORE):
        return None
    return str(code)


def walk(
    credentials: Credentials,
    known_code: str,
    *,
    limit: int = 500,
    timeout: float = 20.0,
    interval: float = INTERVAL,
    on_found=None,
) -> Walk:
    """
    Follow the chain from `known_code` to the newest match.

    `limit` is a guard rather than a preference: the chain is walked one request
    per match, and an account with a thousand matches would otherwise make a
    thousand requests before returning anything. Stopping early is reported, so
    a caller can resume from `Walk.last` rather than starting over.
    """
    credentials.validate()
    if not looks_like(known_code):
        raise MatchHistoryError(
            f"{known_code!r} is not a share code. Copy one from your own match "
            "history in the game — any match, and the walk continues from there."
        )

    found = Walk(last=known_code)
    current = known_code
    while len(found.codes) < limit:
        try:
            nxt = _request(credentials, current, timeout=timeout)
        except MatchHistoryError as exc:
            found.stopped = str(exc)
            return found
        if nxt is None:
            found.stopped = "caught up"
            return found
        found.codes.append(nxt)
        found.last = nxt
        current = nxt
        if on_found is not None:
            on_found(nxt, len(found.codes))
        if interval:
            time.sleep(interval)

    found.stopped = f"stopped at the limit of {limit}"
    return found
