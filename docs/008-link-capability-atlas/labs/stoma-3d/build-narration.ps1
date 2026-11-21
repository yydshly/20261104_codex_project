$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$output = Join-Path $PSScriptRoot 'public/narration'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$chapters = Get-Content (Join-Path $PSScriptRoot 'src/chapters.json') -Encoding utf8 -Raw | ConvertFrom-Json
$voice = [System.Speech.Synthesis.SpeechSynthesizer]::new()
try {
    $voice.SelectVoice('Microsoft Huihui Desktop')
    $voice.Rate = 0
    for ($index = 0; $index -lt $chapters.Length; $index++) {
        $voice.SetOutputToWaveFile((Join-Path $output "step-$($index + 1).wav"))
        $voice.Speak($chapters[$index].cue)
        $voice.SetOutputToNull()
    }
} finally {
    $voice.Dispose()
}
