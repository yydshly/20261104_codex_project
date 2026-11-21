param([int]$Port = 5217)
$projectDirectory = $PSScriptRoot
& node (Join-Path $projectDirectory 'server.mjs') --port $Port
