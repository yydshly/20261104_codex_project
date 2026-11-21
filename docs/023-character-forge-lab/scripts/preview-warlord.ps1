param([switch]$OpenBrowser)
$ErrorActionPreference = 'Stop'
$previewRoot = Split-Path -Parent $PSScriptRoot
$previewPort = 5222
$previewUrl = "http://127.0.0.1:$previewPort/"
$existingPreview = $false
try {
    $response = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 2
    if ($response.Content -notmatch '赤霄') { throw 'Port 5222 is used by another application.' }
    $existingPreview = $true
} catch {
    if ($_.Exception.Message -match 'another application') { throw }
}
if (-not $existingPreview) {
    $nodeProgram = (Get-Command node -ErrorAction Stop).Source
    $previewContent = if (Test-Path -LiteralPath (Join-Path $previewRoot 'dist/index.html')) { 'dist' } else { '.' }
    $previewLogs = Join-Path $previewRoot 'logs'
    New-Item -ItemType Directory -Path $previewLogs -Force | Out-Null
    $previewProcess = Start-Process -FilePath $nodeProgram -ArgumentList @('scripts/serve.mjs','--host','127.0.0.1','--port',"$previewPort",'--root',$previewContent) -WorkingDirectory $previewRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $previewLogs 'preview.out.log') -RedirectStandardError (Join-Path $previewLogs 'preview.err.log') -PassThru
    Write-Output "Started local preview process $($previewProcess.Id)."
}
Write-Output $previewUrl
if ($OpenBrowser) { Start-Process $previewUrl }
