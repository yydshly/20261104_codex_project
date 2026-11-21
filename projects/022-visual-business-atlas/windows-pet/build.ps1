param([string]$OutputDirectory = '')
$ErrorActionPreference = 'Stop'
$taskPetRoot = Split-Path -Parent $PSScriptRoot
$taskPetVersion = (Get-Content -LiteralPath (Join-Path $PSScriptRoot 'pet-behavior.json') -Raw | ConvertFrom-Json).version
$taskPetAssetRoot = Join-Path $taskPetRoot 'assets/desktop-pet'
if (-not (Test-Path -LiteralPath $taskPetAssetRoot)) { $taskPetAssetRoot = Join-Path $PSScriptRoot 'desktop-pet'; if (-not $OutputDirectory) { $OutputDirectory = Join-Path $PSScriptRoot 'build/WhiteCatPet-Windows' } }
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $taskPetRoot 'assets/downloads/WhiteCatPet-Windows' }
$taskPetOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
$null = New-Item -ItemType Directory -Path $taskPetOutput -Force
$taskPetCompiler = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
if (-not (Test-Path -LiteralPath $taskPetCompiler)) { throw '.NET Framework 4.x C# compiler not found.' }
$taskPetArgs = @('/nologo','/target:winexe','/platform:anycpu','/optimize+','/codepage:65001',('/out:' + (Join-Path $taskPetOutput 'WhiteCatPet.exe')),('/win32manifest:' + (Join-Path $PSScriptRoot 'app.manifest')),('/win32icon:' + (Join-Path $PSScriptRoot 'cat.ico')),'/reference:System.dll','/reference:System.Core.dll','/reference:System.Drawing.dll','/reference:System.Windows.Forms.dll','/reference:System.Web.Extensions.dll',('/resource:' + (Join-Path $PSScriptRoot 'pet-behavior.json') + ',PetData'))
foreach ($taskPetState in @('idle','happy','hungry','sleep')) { foreach ($taskPetFrame in 0..1) { $taskPetAsset = Join-Path $taskPetAssetRoot ('{0}-{1}.png' -f $taskPetState,$taskPetFrame); $taskPetArgs += '/resource:' + $taskPetAsset + ',' + $taskPetState + '_' + $taskPetFrame + '.png' } }
$taskPetArgs += Join-Path $PSScriptRoot 'WhiteCatPet.cs'
& $taskPetCompiler @taskPetArgs
if ($LASTEXITCODE -ne 0) { throw 'C# compilation failed.' }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot '使用说明.txt') -Destination $taskPetOutput
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'pet-behavior.json') -Destination $taskPetOutput
$taskPetArchive = Join-Path (Split-Path -Parent $taskPetOutput) ('WhiteCatPet-Windows-v{0}.zip' -f $taskPetVersion)
# Only package the executable and documentation, never local preferences or verification files.
Compress-Archive -LiteralPath (Join-Path $taskPetOutput 'WhiteCatPet.exe'),(Join-Path $taskPetOutput '使用说明.txt'),(Join-Path $taskPetOutput 'pet-behavior.json') -DestinationPath $taskPetArchive -Force
$taskPetSourceArchive = Join-Path (Split-Path -Parent $taskPetOutput) ('WhiteCatPet-Source-v{0}.zip' -f $taskPetVersion)
Compress-Archive -LiteralPath (Join-Path $PSScriptRoot 'WhiteCatPet.cs'),(Join-Path $PSScriptRoot 'app.manifest'),(Join-Path $PSScriptRoot 'cat.ico'),(Join-Path $PSScriptRoot 'build.ps1'),(Join-Path $PSScriptRoot '使用说明.txt'),(Join-Path $PSScriptRoot 'pet-behavior.json'),$taskPetAssetRoot -DestinationPath $taskPetSourceArchive -Force
$taskPetExeInfo = Get-Item -LiteralPath (Join-Path $taskPetOutput 'WhiteCatPet.exe')
$taskPetRelease = [ordered]@{ version=$taskPetVersion; exe='WhiteCatPet.exe'; exeBytes=$taskPetExeInfo.Length; exeSha256=(Get-FileHash -LiteralPath $taskPetExeInfo.FullName).Hash; zip=('WhiteCatPet-Windows-v{0}.zip' -f $taskPetVersion); zipBytes=(Get-Item -LiteralPath $taskPetArchive).Length; zipSha256=(Get-FileHash -LiteralPath $taskPetArchive).Hash; sourceZip=('WhiteCatPet-Source-v{0}.zip' -f $taskPetVersion); signed=$false; target='Windows 10/11, .NET Framework 4.x'; builtAt=[DateTime]::Now.ToString('yyyy-MM-dd') }
$taskPetReleaseJson = $taskPetRelease | ConvertTo-Json
[System.IO.File]::WriteAllText((Join-Path (Split-Path -Parent $taskPetOutput) 'pet-release.json'),$taskPetReleaseJson,[System.Text.UTF8Encoding]::new($false))
if (Test-Path -LiteralPath (Join-Path $taskPetRoot 'index.html')) { [System.IO.File]::WriteAllText((Join-Path $taskPetRoot 'pet-release.js'),('window.DESKTOP_PET_RELEASE = ' + $taskPetReleaseJson + ';'),[System.Text.UTF8Encoding]::new($false)) }
$taskPetReleaseJson
