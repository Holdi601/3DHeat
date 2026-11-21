# The reverse proxy image for a public session (docs/multiplayer.md, "Your own
# domain, through a reverse proxy"): an nginx release without known
# vulnerabilities, pinned by digest, with its Alpine packages brought up to
# date (fixes that land before the next nginx image). Raise the release and
# digest with every nginx security advisory; CI scans the built image daily
# (.github/workflows/cve-scan.yml).
FROM nginx:1.30.7-alpine@sha256:caf4e1e032a20f9c3c5e28fc7f25ffd768ad8677b4975c54193075997b3a97e3
RUN apk upgrade --no-cache
USER nginx
