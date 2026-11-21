$ErrorActionPreference = 'Stop'
$warlordProjectDir = $PSScriptRoot
$warlordAsset = Join-Path $warlordProjectDir 'assets\warlord.glb'
$warlordReportFile = Join-Path $warlordProjectDir 'validation\gameplay-report.json'
$warlordMetadataFile = Join-Path $warlordProjectDir 'assets\metadata.json'
$warlordReport = Get-Content -LiteralPath $warlordReportFile -Raw | ConvertFrom-Json
$warlordSecondaryReport = Get-Content -LiteralPath (Join-Path $warlordProjectDir 'validation\secondary-report.json') -Raw | ConvertFrom-Json
$warlordFinishReport = Get-Content -LiteralPath (Join-Path $warlordProjectDir 'validation\finish-report.json') -Raw | ConvertFrom-Json
$warlordMetadata = Get-Content -LiteralPath $warlordMetadataFile -Raw | ConvertFrom-Json
$warlordHash = (Get-FileHash -LiteralPath $warlordAsset -Algorithm SHA256).Hash.ToLowerInvariant()
if ($warlordReport.status -ne 'passed' -or $warlordReport.asset_sha256 -ne $warlordHash) {
  throw 'Run the headless gameplay checks against the current GLB before packaging.'
}
if ($warlordMetadata.sha256 -ne $warlordHash) {
  throw 'Metadata and GLB hashes differ.'
}
if ($warlordSecondaryReport.status -ne 'passed' -or $warlordSecondaryReport.failed -ne 0 -or $warlordSecondaryReport.asset_sha256 -ne $warlordHash) {
  throw 'Run the post-animation secondary checks against the current GLB before packaging.'
}
if ($warlordFinishReport.status -ne 'passed' -or $warlordFinishReport.sha256 -ne $warlordHash) {
  throw 'Run exported PBR, UV and cloth animation acceptance against the current GLB before packaging.'
}
foreach ($warlordCheckedReport in @($warlordReport, $warlordSecondaryReport)) {
  if (-not $warlordCheckedReport.source_sha256) { throw 'Run the native checks again to bind the current runtime code.' }
  foreach ($warlordRequiredScript in @('combatant.gd','secondary_constraints.gd')) {
    if (-not $warlordCheckedReport.source_sha256.$warlordRequiredScript) { throw 'The native report does not identify required runtime code.' }
  }
  foreach ($warlordProperty in $warlordCheckedReport.source_sha256.PSObject.Properties) {
    if ($warlordProperty.Name -notmatch '^[a-z_]+\.gd$') { throw 'Unexpected script name in native report.' }
    $warlordCurrentCodeHash = (Get-FileHash -LiteralPath (Join-Path $warlordProjectDir ('scripts\' + $warlordProperty.Name)) -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($warlordCurrentCodeHash -ne $warlordProperty.Value) { throw 'Native runtime code changed after its last headless check.' }
  }
}
$warlordArchive = Join-Path (Split-Path -Parent $warlordProjectDir) 'Warlord-Godot-sourcekit.zip'
$warlordProjectDir = [System.IO.Path]::GetFullPath($warlordProjectDir)
$warlordRootPrefix = $warlordProjectDir.TrimEnd('\') + '\'
$warlordItems = @('project.godot','main.tscn','README.md','play.cmd','verify.cmd','package-source.ps1') | ForEach-Object { Get-Item -LiteralPath (Join-Path $warlordProjectDir $_) }
$warlordItems += Get-ChildItem -LiteralPath (Join-Path $warlordProjectDir 'scripts') -Recurse -File | Where-Object { $_.Name -match '\.gd(\.uid)?$' }
$warlordItems += Get-ChildItem -LiteralPath (Join-Path $warlordProjectDir 'assets') -File | Where-Object { $_.Name -in @('warlord.glb','warlord.glb.import') -or $_.Extension -eq '.json' -or $_.Name -like 'LICENSE*.txt' }
$warlordItems += Get-ChildItem -LiteralPath (Join-Path $warlordProjectDir 'validation') -File -Filter '*.json'
$warlordItems = @($warlordItems | Sort-Object FullName -Unique)
foreach ($warlordItem in $warlordItems) {
  if (-not $warlordItem.FullName.StartsWith($warlordRootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or $warlordItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
    throw 'A sourcekit item escapes the project or is a filesystem link.'
  }
}
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$warlordPartial = $warlordArchive + '.partial'
$warlordStream = [System.IO.File]::Open($warlordPartial, [System.IO.FileMode]::Create, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
$warlordWriteZip = [System.IO.Compression.ZipArchive]::new($warlordStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
try {
  foreach ($warlordItem in $warlordItems) {
    $warlordRelative = $warlordItem.FullName.Substring($warlordRootPrefix.Length).Replace('\','/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($warlordWriteZip, $warlordItem.FullName, $warlordRelative, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $warlordWriteZip.Dispose(); $warlordStream.Dispose() }
Move-Item -LiteralPath $warlordPartial -Destination $warlordArchive -Force
$warlordZip = [System.IO.Compression.ZipFile]::OpenRead($warlordArchive)
try {
  $warlordUnsafeEntries = @($warlordZip.Entries | Where-Object { $_.FullName -match '(^|/)(\.godot|userdata)/|\.(exe|dll|pck|log)$|^assets/.*\.(png|jpe?g)(\.import)?$' })
  if ($warlordUnsafeEntries.Count -gt 0) { throw 'Unexpected cache or engine binary in sourcekit.' }
} finally { $warlordZip.Dispose() }
[pscustomobject]@{Archive=$warlordArchive;Bytes=(Get-Item -LiteralPath $warlordArchive).Length;Files=$warlordItems.Count;AssetSHA256=$warlordHash;ChecksPassed=$warlordReport.passed;SecondaryChecksPassed=$warlordSecondaryReport.passed;TexturePolicy='Embedded GLB only; extracted textures are regenerated on import.'} | ConvertTo-Json
