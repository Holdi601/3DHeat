# The 3DHeat server (`3dheat serve`) with the web viewer, as a container image.
# Built from the repository root:
#   docker build -f native/packaging/docker/Dockerfile -t 3dheat-server:local .
# Runs as an unprivileged user on a read-only filesystem; its state (the
# self-signed certificate, uploads) lives in the /state volume. See
# compose.yaml beside this file and docs/native-app.md.

# ---- the web viewer
FROM node:24-bookworm-slim AS web
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- the server
FROM rust:1-bookworm AS server
WORKDIR /src/native
COPY native/ ./
RUN cargo build --release --locked -p heat3d-server \
 && install -D -m 755 target/release/3dheat /out/3dheat \
 && mkdir -p /out/state

# ---- the image: glibc and libgcc only, no shell, no package manager
FROM gcr.io/distroless/cc-debian12:nonroot
ARG VERSION=dev
LABEL org.opencontainers.image.title="3DHeat server" \
      org.opencontainers.image.description="3DHeat multiplayer sessions, the web viewer and the native core's data API" \
      org.opencontainers.image.source="https://github.com/Holdi601/3DHeat" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.version="${VERSION}"
COPY --from=server /out/3dheat /usr/bin/3dheat
COPY --from=web /src/dist /usr/share/3dheat/dist
# Owned by the server's user, so a new volume mounted here starts out writable for it.
COPY --from=server --chown=65532:65532 /out/state /state
# The update check knows it is in a container: it only says when a newer image is out.
ENV HEAT3D_CONTAINER=1 \
    HOME=/state \
    XDG_CACHE_HOME=/state/cache
USER 65532:65532
VOLUME ["/state"]
EXPOSE 7878
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["/usr/bin/3dheat", "healthcheck", "--port", "7878"]
ENTRYPOINT ["/usr/bin/3dheat", "serve", "--web", "/usr/share/3dheat/dist", "--state-dir", "/state", "--bind", "0.0.0.0", "--port", "7878"]
