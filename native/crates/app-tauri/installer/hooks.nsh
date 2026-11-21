; The NSIS installer's own checks (tauri.conf.json: bundle.windows.nsis.installerHooks).
;
; Before anything is copied: 64-bit Windows 10 (1809) or 11, else a clear message
; and no install. The WebView2 runtime is checked and installed by Tauri's own
; step (webviewInstallMode: embedBootstrapper). The Visual C++ runtime is linked
; into the programs, so no redistributable is needed (docs/native-app.md).
;
; Once the files are in place: the app checks the graphics card itself
; (`3dheat-app --check-requirements`: a DirectX 12 device, Vulkan, memory) and
; the installer shows what is missing, with the card maker's driver page.
; Drivers cannot be installed from here. Silent installs (the updater's) skip
; the message.

!include WinVer.nsh
!include x64.nsh

!macro NSIS_HOOK_PREINSTALL
  ${IfNot} ${RunningX64}
    MessageBox MB_ICONSTOP|MB_OK "3DHeat needs 64-bit Windows 10 (version 1809 or later) or Windows 11." /SD IDOK
    Abort
  ${EndIf}
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_ICONSTOP|MB_OK "3DHeat needs Windows 10 (version 1809 or later) or Windows 11." /SD IDOK
    Abort
  ${EndIf}
  ${IfNot} ${AtLeastBuild} 17763
    MessageBox MB_ICONSTOP|MB_OK "3DHeat needs Windows 10 version 1809 or later. Please update Windows first." /SD IDOK
    Abort
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTINSTALL
  StrCpy $R8 "$TEMP\3dheat-requirements.txt"
  Delete $R8
  ClearErrors
  ExecWait '"$INSTDIR\3dheat-app.exe" --check-requirements --report "$R8"' $R9
  ${If} $R9 == 1
    StrCpy $R7 ""
    ClearErrors
    FileOpen $R6 $R8 r
    ${IfNot} ${Errors}
      heat3d_req_read:
        FileRead $R6 $R5
        IfErrors heat3d_req_done
        StrCpy $R7 "$R7$R5"
        Goto heat3d_req_read
      heat3d_req_done:
      FileClose $R6
    ${EndIf}
    MessageBox MB_ICONEXCLAMATION|MB_OK "$R7" /SD IDOK
  ${EndIf}
  Delete $R8
!macroend
