# The reverse proxy image for a public session (docs/multiplayer.md, "Your own
# domain, through a reverse proxy"): an nginx release without known
# vulnerabilities, pinned by digest, with its Alpine packages brought up to
# date (fixes that land before the next nginx image). Raise the release and
# digest with every nginx security advisory; CI scans the built image daily
# (.github/workflows/cve-scan.yml).
FROM nginx:1.31.9-alpine@sha256:fb4658584bd9a916ffb6f6e365f97c25cfdb2923801f551ea08356e695f14ff7
RUN apk upgrade --no-cache
USER nginx
