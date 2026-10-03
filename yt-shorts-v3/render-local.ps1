# Full-quality render of the "Google It!" Short on your PC's GPU.
# Run from this folder in PowerShell:   powershell -ExecutionPolicy Bypass -File .\render-local.ps1
# Optional: -Fps 60 (default) -Out out\google_it_short.mp4 -Preview (fast 30 fps, 4 samples)
param([int]$Fps = 60, [string]$Out = "out\google_it_short.mp4", [switch]$Preview)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Need($cmd, $hint) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { Write-Host "Missing: $cmd`n  $hint" -ForegroundColor Red; exit 1 }
}
Need bun    "Install:  powershell -c `"irm bun.sh/install.ps1 | iex`"   (then open a new PowerShell)"
Need ffmpeg "Install:  winget install Gyan.FFmpeg   (then open a new PowerShell)"
$chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { Write-Host "Missing: Google Chrome  (winget install Google.Chrome)" -ForegroundColor Red; exit 1 }
$env:CHROME_PATH = $chrome

Set-Location app
if (-not (Test-Path node_modules)) { bun install }
New-Item -ItemType Directory -Force -Path ..\out | Out-Null

# The Short = song 26.38 s .. 58.28 s (see src/timeline.ts). Chrome renders through Direct3D 11 on the GPU.
$samples = if ($Preview) { @("--samples", "4") } else { @("--samples", "auto", "--max-samples", "36", "--shutter", "0.3") }
if ($Preview) { $Fps = 30 }
bun scripts/render.ts video --gpu d3d11 --from 26.38 --to 58.28 --fps $Fps @samples --crf 14 --out "..\$Out"
if ($LASTEXITCODE -ne 0) { Write-Host "Render failed (see above)." -ForegroundColor Red; exit 1 }

# YouTube loudness: -14 LUFS, video stream copied
$final = "..\" + ($Out -replace '\.mp4$', '_final.mp4')
ffmpeg -y -loglevel error -i "..\$Out" -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11" -c:a aac -b:a 320k $final
Write-Host "Done: $((Resolve-Path $final).Path)" -ForegroundColor Green
