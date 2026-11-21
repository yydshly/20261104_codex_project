$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$voice = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$voice.SelectVoice('Microsoft Huihui Desktop')
$voice.Rate = -1
$chapters = @{
    '01' = '拼贴动图。Images 二点六可以生成 GIF。对于只需表达一个短动作的口播辅助画面，可以先尝试 GIF。'
    '09' = '可听日报。myradio 用已准备的台本和音频组装节目。可以先做好朗读素材，再让网页按时间轴播放。'
    '10' = '互动网页课。Papermorph 的静态课程可以包含旁白、动态图解和交互练习。一个概念可以先讲，再让学习者动手验证。'
}

try {
    foreach ($id in ($chapters.Keys | Sort-Object)) {
        $audio = [System.IO.MemoryStream]::new()
        try {
            $voice.SetOutputToWaveStream($audio)
            $voice.Speak($chapters[$id])
            $voice.SetOutputToNull()
            $target = Join-Path $PSScriptRoot "media/brief-$id.wav"
            [System.IO.File]::WriteAllBytes($target, $audio.ToArray())
        } finally {
            $audio.Dispose()
        }
    }
} finally {
    $voice.Dispose()
}
