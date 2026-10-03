# render-local.ps1: render the Shorts on this Windows PC with its graphics card and full watercolour fills.
# Run from the Gemma folder:   powershell -ExecutionPolicy Bypass -File yt-shorts\render-local.ps1 [toast tower cloud]
# Needs: git, Node.js 20+, Google Chrome, ffmpeg on PATH. Output: yt-shorts\out\<short>\<short>.mp4
param([string[]]$Shorts = @('toast', 'tower', 'cloud'))
$ErrorActionPreference = 'Stop'

git fetch origin claude/clever-fermat-jy52f7
git checkout claude/clever-fermat-jy52f7
git pull --ff-only origin claude/clever-fermat-jy52f7

Set-Location (Join-Path $PSScriptRoot '.')
if (-not (Test-Path node_modules)) { npm install }

foreach ($s in $Shorts) {
  Write-Host "=== $s : frames (GPU, full watercolour)"
  Remove-Item -Recurse -Force "out\$s\frames" -ErrorAction SilentlyContinue
  node render.mjs --short=$s --frames --workers=2          # no --soft-gl / --fast: Chrome uses the GPU (ANGLE d3d11)
  Write-Host "=== $s : sound"
  node render.mjs --short=$s --sound
  Write-Host "=== $s : encode"
  node render.mjs --short=$s --encode
  Write-Host "wrote out\$s\$s.mp4"
}
Write-Host 'All done.'
