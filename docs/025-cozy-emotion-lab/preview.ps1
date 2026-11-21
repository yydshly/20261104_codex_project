param([ValidateRange(1024, 65535)][int]$Port = 5198)
$env:COZY_PORT = [string]$Port
Push-Location -LiteralPath $PSScriptRoot
try {
    node server.mjs
} finally {
    Pop-Location
}
