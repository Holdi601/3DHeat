<#
.SYNOPSIS
  Signs a draft release of 3DHeat on this machine: the updater signatures and latest.json.

.DESCRIPTION
  The release workflow (.github/workflows/release.yml) builds every package
  unsigned and leaves them, with SHA256SUMS, in a draft release. No signing key
  is on GitHub. This script, run by the maintainer where the private key is:

    1. refuses a release that is not a draft;
    2. downloads its files and checks each against SHA256SUMS;
    3. signs, with the private key (minisign, through `tauri signer sign`), what
       the updaters install: the Windows setup (.exe), the AppImage, and the
       server's portable zip and tar.gz files; each gets a .sig beside it;
    4. writes latest.json, the app updater's manifest: the version, the notes,
       and per platform the installer's address and its signature;
    5. uploads the .sig files and latest.json to the draft, and SHA256SUMS
       again with their lines added.

  It does not publish the release: that stays a separate, deliberate step
  (`gh release edit <tag> --draft=false`), after which the updaters see it.

.PARAMETER Tag
  The draft release, e.g. v0.1.0.

.PARAMETER KeyFile
  The private key (made once by `npx tauri signer generate -w <file>`). Default:
  the TAURI_SIGNING_PRIVATE_KEY_PATH environment variable.

.PARAMETER PasswordFile
  A file holding the key's password. Default: the
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD environment variable.

.EXAMPLE
  pwsh native/tools/sign-release.ps1 -Tag v0.1.0 -KeyFile <key file> -PasswordFile <password file>
#>
param(
  [Parameter(Mandatory = $true)][string]$Tag,
  [string]$KeyFile = $env:TAURI_SIGNING_PRIVATE_KEY_PATH,
  [string]$PasswordFile,
  [string]$Repo = 'Holdi601/3DHeat'
)

$ErrorActionPreference = 'Stop'
$native = Split-Path -Parent $PSScriptRoot

if (-not $KeyFile -or -not (Test-Path $KeyFile)) { throw "No private key: pass -KeyFile or set TAURI_SIGNING_PRIVATE_KEY_PATH." }
$password = $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD
if ($PasswordFile) { $password = (Get-Content -Raw $PasswordFile).Trim() }
if ($null -eq $password) { $password = '' }

# 1. A draft, and only a draft.
$info = gh release view $Tag --repo $Repo --json isDraft,body,name | ConvertFrom-Json
if (-not $info.isDraft) { throw "$Tag is published already; this script signs drafts only." }
$version = $Tag.TrimStart('v')

# 2. The files, checked against SHA256SUMS.
$work = Join-Path ([IO.Path]::GetTempPath()) "3dheat-sign-$Tag-$PID"
New-Item -ItemType Directory -Force $work | Out-Null
try {
  gh release download $Tag --repo $Repo --dir $work --clobber
  $sumsFile = Join-Path $work 'SHA256SUMS'
  if (-not (Test-Path $sumsFile)) { throw "$Tag has no SHA256SUMS." }
  $listed = @{}
  foreach ($line in Get-Content $sumsFile) {
    if ($line -match '^([0-9a-f]{64}) [ *](.+)$') { $listed[$Matches[2]] = $Matches[1] }
  }
  foreach ($name in $listed.Keys) {
    $file = Join-Path $work $name
    if (-not (Test-Path $file)) { throw "$name is in SHA256SUMS but not in the release." }
    $hash = (Get-FileHash -Algorithm SHA256 $file).Hash.ToLower()
    if ($hash -ne $listed[$name]) { throw "$name does not match SHA256SUMS: the download is not what CI built." }
  }
  Write-Output "SHA256SUMS: $($listed.Count) files match."

  # 3. Signatures for what the updaters install.
  $toSign = @(Get-ChildItem $work -File | Where-Object {
      $listed.ContainsKey($_.Name) -and ($_.Name -match '_x64-setup\.exe$' -or $_.Name -match '\.AppImage$' -or $_.Name -match '^3dheat-server-.*\.(zip|tar\.gz)$')
    })
  if ($toSign.Count -eq 0) { throw "Nothing to sign in $Tag." }
  Push-Location $native
  try {
    foreach ($f in $toSign) {
      Remove-Item -ErrorAction SilentlyContinue "$($f.FullName).sig"
      npx tauri signer sign --private-key-path $KeyFile --password $password $f.FullName | Out-Null
      if ($LASTEXITCODE -ne 0 -or -not (Test-Path "$($f.FullName).sig")) { throw "Signing $($f.Name) failed." }
      Write-Output "signed $($f.Name)"
    }
  } finally { Pop-Location }

  # 4. latest.json for the app's updater (Tauri's format).
  $base = "https://github.com/$Repo/releases/download/$Tag"
  $platforms = [ordered]@{}
  $setup = $toSign | Where-Object { $_.Name -match '_x64-setup\.exe$' } | Select-Object -First 1
  $appimage = $toSign | Where-Object { $_.Name -match '\.AppImage$' } | Select-Object -First 1
  if ($setup) { $platforms['windows-x86_64'] = [ordered]@{ signature = (Get-Content -Raw "$($setup.FullName).sig").Trim(); url = "$base/$($setup.Name)" } }
  if ($appimage) { $platforms['linux-x86_64'] = [ordered]@{ signature = (Get-Content -Raw "$($appimage.FullName).sig").Trim(); url = "$base/$($appimage.Name)" } }
  $notes = "$($info.body)"
  # The workflow's own line about the unsigned build is not news to a user.
  $notes = ($notes -split "`n" | Where-Object { $_ -notmatch '^Unsigned build of commit' }) -join "`n"
  $manifest = [ordered]@{
    version   = $version
    notes     = $notes.Trim()
    pub_date  = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    platforms = $platforms
  }
  $latest = Join-Path $work 'latest.json'
  [IO.File]::WriteAllText($latest, ($manifest | ConvertTo-Json -Depth 5), (New-Object Text.UTF8Encoding($false)))

  # 5. Upload, and SHA256SUMS with the new files.
  $sigs = @($toSign | ForEach-Object { "$($_.FullName).sig" })
  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($name in ($listed.Keys | Sort-Object)) { $lines.Add("$($listed[$name])  $name") }
  foreach ($p in ($sigs + $latest)) {
    $lines.Add("$((Get-FileHash -Algorithm SHA256 $p).Hash.ToLower())  $(Split-Path -Leaf $p)")
  }
  [IO.File]::WriteAllText($sumsFile, (($lines -join "`n") + "`n"), (New-Object Text.UTF8Encoding($false)))
  gh release upload $Tag --repo $Repo --clobber @($sigs + $latest + $sumsFile)
  Write-Output ""
  Write-Output "Signed and uploaded to the draft $Tag : $($sigs.Count) signatures, latest.json, SHA256SUMS."
  Write-Output "Not published. Publishing makes the updaters offer ${version}: gh release edit $Tag --repo $Repo --draft=false"
} finally {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $work
}
