param([int]$Seed = 27)
$ErrorActionPreference = 'Stop'
$taskPython = Join-Path $PSScriptRoot '.runtime\asset-env\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $taskPython)) { throw 'Create the asset environment first; see SKILL-USAGE.md.' }
Push-Location $PSScriptRoot
try {
  foreach ($recipe in @('models','vfx','audio')) {
    & $taskPython -X utf8 "asset-recipes/build_$recipe.py" --seed $Seed
    if ($LASTEXITCODE -ne 0) { throw "Failed asset recipe: $recipe" }
  }
  Push-Location 'tools\asset-maker'
  try {
    & $taskPython -X utf8 -m asset_pipeline audit '..\..\assets\forged\models' '..\..\assets\forged\vfx' '..\..\assets\forged\sfx'
    if ($LASTEXITCODE -ne 0) { throw 'Asset audit failed' }
  } finally { Pop-Location }
} finally { Pop-Location }
