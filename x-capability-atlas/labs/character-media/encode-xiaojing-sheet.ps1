param(
  [Parameter(Mandatory)] [ValidateSet('blink', 'nod')] [string] $Motion,
  [Parameter(Mandatory)] [string] $Sheet
)

$ErrorActionPreference = 'Stop'
$source = (Resolve-Path -LiteralPath $Sheet).Path
$geometry = (& ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x $source) -split 'x'
if ($LASTEXITCODE -ne 0 -or $geometry.Length -ne 2) { throw 'Could not read source sheet dimensions.' }
$width = [int][Math]::Floor([int]$geometry[0] / 3)
$height = [int][Math]::Floor([int]$geometry[1] / 2)
$size = [Math]::Max($width, $height)
$frameDelay = if ($Motion -eq 'blink') { @(144, 6, 5, 9, 8, 12) } else { @(114, 16, 17, 24, 18, 19) }
$cache = Join-Path ([System.IO.Path]::GetTempPath()) ('xiaojing-sheet-' + [Guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $cache
$timeline = @('ffconcat version 1.0')

for ($i = 0; $i -lt 6; $i++) {
  $x = ($i % 3) * $width
  $y = [int][Math]::Floor($i / 3) * $height
  $tile = "frame-$i.png"
  $filter = "format=rgba,crop=${width}:${height}:${x}:${y}:exact=1,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:color=black@0"
  & ffmpeg -v error -i $source -vf $filter -frames:v 1 -update 1 (Join-Path $cache $tile)
  if ($LASTEXITCODE -ne 0) { throw "Could not extract tile $i." }
  $timeline += "file '$tile'"
  $timeline += 'option framerate 100'
  $timeline += 'duration ' + ($frameDelay[$i] / 100.0).ToString('0.00', [Globalization.CultureInfo]::InvariantCulture)
}

$list = Join-Path $cache 'timeline.ffconcat'
Set-Content -LiteralPath $list -Value $timeline -Encoding ascii
$gif = Join-Path $PSScriptRoot "xiaojing-$Motion-generated.gif"
$palette = '[0:v]split[base][colors];[colors]palettegen=reserve_transparent=1[palette];[base][palette]paletteuse=dither=sierra2_4a:alpha_threshold=128'
& ffmpeg -v error -y -safe 0 -f concat -i $list -filter_complex_threads 1 -filter_complex $palette -fps_mode vfr -loop 0 -final_delay $frameDelay[-1] $gif
if ($LASTEXITCODE -ne 0) { throw 'Could not encode GIF.' }
Write-Output $gif
