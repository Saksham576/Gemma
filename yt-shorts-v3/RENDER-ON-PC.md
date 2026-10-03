# Render the Short on your PC (GPU)

## One-time setup (PowerShell)

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
winget install Gyan.FFmpeg
winget install Google.Chrome      # skip if Chrome is already installed
```

Close PowerShell and open a new one so the new commands are found.

## Render

```powershell
cd <your clone>\yt-shorts-v3
git pull
powershell -ExecutionPolicy Bypass -File .\render-local.ps1
```

- **Output:** `out\google_it_short_final.mp4` (1080×1920, 60 fps, adaptive motion blur, loudness normalised to −14 LUFS).
- **Quick check first:** add `-Preview` (30 fps, lighter blur) to the command.
- **How it works:** Chrome renders through Direct3D 11 on your graphics card.
- **If it says "app failed to boot":** update your GPU driver, and make sure the clone has `yt-shorts-v3\audio\google-it.mp3`.
