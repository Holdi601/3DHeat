#!/usr/bin/env bash
# Packs the headless server (`3dheat`) with the web build, for a release:
#   server-package.sh VERSION PLATFORM BIN DIST OUT
# PLATFORM: windows-x64 | linux-x64 | linux-arm64. Writes into OUT:
#   3dheat-server-VERSION-PLATFORM.zip      (Windows: the portable server)
#   3dheat-server-VERSION-PLATFORM.tar.gz   (Linux: the portable server)
#   3dheat-server_VERSION_ARCH.deb          (Linux: the package, with a systemd unit, disabled)
# Each archive holds one folder of the same name: the program, dist/ (the web
# viewer it serves), LICENSE and README.txt; the program finds dist/ beside itself.
set -euo pipefail

version=$1 platform=$2 bin=$3 dist=$4 out=$5
here=$(cd "$(dirname "$0")" && pwd)
repo=$(cd "$here/../.." && pwd)
name="3dheat-server-$version-$platform"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p "$out"
out=$(cd "$out" && pwd)

top="$work/$name"
mkdir -p "$top"
cp -R "$dist" "$top/dist"
cp "$repo/LICENSE" "$top/LICENSE"
case "$platform" in
  windows-*) exe=3dheat.exe ;;
  *) exe=3dheat ;;
esac
cp "$bin" "$top/$exe"
chmod 755 "$top/$exe" 2>/dev/null || true

cat > "$top/README.txt" <<EOF
3DHeat server $version ($platform)

The headless 3DHeat server: multiplayer sessions, the web viewer and the
native core's data API in one program. Start it in this folder:

  $exe serve                          LAN session, self-signed TLS, port 7878
  $exe serve --password-env VAR       with the password in an environment variable
  $exe serve --help                   every option

Open the "Host" address it prints in a browser yourself; others open "Join".
At start it checks the port and any --cert/--key files and says clearly what
is wrong.

Updates: \`serve\` says when a newer release is out and goes on. \`$exe update\`
asks, then updates this folder (the package's signature is checked first);
\`$exe --check-update\` only says. \`serve --auto-update\` updates by itself,
used from the next start. HEAT3D_NO_UPDATE=1 turns the check off.

Documentation: https://github.com/Holdi601/3DHeat/blob/main/docs/native-app.md
EOF

case "$platform" in
  windows-*)
    (cd "$work" && if command -v 7z >/dev/null; then 7z a -tzip -mx=9 "$out/$name.zip" "$name" >/dev/null
      elif command -v zip >/dev/null; then zip -qr9 "$out/$name.zip" "$name"
      else python -I -c 'import shutil, sys; shutil.make_archive(sys.argv[1], "zip", ".", sys.argv[2])' "$out/$name" "$name"; fi)
    ;;
  linux-*)
    cp "$here/linux/3dheat.service" "$top/3dheat.service"
    tar -C "$work" --owner=0 --group=0 -czf "$out/$name.tar.gz" "$name"

    arch=amd64
    [ "$platform" = linux-arm64 ] && arch=arm64
    deb="$work/deb"
    mkdir -p "$deb/DEBIAN" "$deb/usr/bin" "$deb/usr/share/3dheat" "$deb/usr/share/doc/3dheat-server" "$deb/lib/systemd/system" "$deb/etc/default"
    install -m 755 "$bin" "$deb/usr/bin/3dheat"
    cp -R "$dist" "$deb/usr/share/3dheat/dist"
    install -m 644 "$here/linux/3dheat.service" "$deb/lib/systemd/system/3dheat.service"
    install -m 644 "$here/linux/default-3dheat" "$deb/etc/default/3dheat"
    install -m 644 "$repo/LICENSE" "$deb/usr/share/doc/3dheat-server/copyright"
    size=$(du -sk "$deb" | cut -f1)
    cat > "$deb/DEBIAN/control" <<EOF
Package: 3dheat-server
Version: $version
Architecture: $arch
Maintainer: 3DHeat <Holdi601@users.noreply.github.com>
Installed-Size: $size
Depends: libc6 (>= 2.35)
Suggests: systemd
Section: net
Priority: optional
Homepage: https://github.com/Holdi601/3DHeat
Description: 3DHeat server: multiplayer sessions and the web viewer
 The headless 3DHeat server (3dheat serve): hosts multiplayer sessions,
 serves the web viewer and answers the native core's data API. A systemd
 unit (3dheat.service) is installed disabled; enable it to run the server
 as a service.
EOF
    echo "/etc/default/3dheat" > "$deb/DEBIAN/conffiles"
    # The unit is installed, never enabled or started by the package.
    cat > "$deb/DEBIAN/postinst" <<'EOF'
#!/bin/sh
set -e
if [ -d /run/systemd/system ]; then systemctl daemon-reload >/dev/null 2>&1 || true; fi
echo "3dheat-server: the service is installed but not enabled. Options: /etc/default/3dheat;"
echo "  start it with: sudo systemctl enable --now 3dheat"
exit 0
EOF
    cat > "$deb/DEBIAN/prerm" <<'EOF'
#!/bin/sh
set -e
if [ "$1" = remove ] && [ -d /run/systemd/system ]; then systemctl stop 3dheat >/dev/null 2>&1 || true; fi
exit 0
EOF
    cat > "$deb/DEBIAN/postrm" <<'EOF'
#!/bin/sh
set -e
if [ -d /run/systemd/system ]; then systemctl daemon-reload >/dev/null 2>&1 || true; fi
exit 0
EOF
    chmod 755 "$deb/DEBIAN/postinst" "$deb/DEBIAN/prerm" "$deb/DEBIAN/postrm"
    dpkg-deb --root-owner-group --build "$deb" "$out/3dheat-server_${version}_${arch}.deb" >/dev/null
    ;;
  *) echo "unknown platform $platform" >&2; exit 2 ;;
esac
ls -l "$out"
