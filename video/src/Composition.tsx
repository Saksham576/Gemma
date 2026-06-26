import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  AbsoluteFill,
} from "remotion";
import React from "react";

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- ANIMATION VALUES ---

  // 1. Logo Intro (Frames 0 - 45)
  const introScale = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.8 },
  });

  const introOpacity = interpolate(frame, [0, 15, 40, 45], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const introTranslateY = interpolate(frame, [0, 45], [0, -50]);

  // 2. Main Scene Transition (Frames 40 - 130)
  // Move logo to the top left header
  const headerOpacity = interpolate(frame, [40, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // PDF Entry (Left side)
  const pdfSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14 },
  });
  const pdfOpacity = interpolate(frame, [45, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Laser Scan
  const laserPosition = interpolate(frame, [55, 80], [-10, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const laserOpacity = interpolate(frame, [53, 55, 80, 82], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Table Entry (Right side)
  const tableOpacity = interpolate(frame, [70, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tableSpring = spring({
    frame: frame - 70,
    fps,
    config: { damping: 15 },
  });

  // Cell Highlight & Warning Tooltip (Frames 85 - 105)
  const cellHighlightOpacity = interpolate(frame, [85, 90, 120, 125], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  
  const tooltipScale = spring({
    frame: frame - 88,
    fps,
    config: { damping: 12, mass: 0.5 },
  });

  // Verification Animation (Frames 105 - 125)
  const verificationProgress = spring({
    frame: frame - 105,
    fps,
    config: { damping: 12 },
  });
  const verifiedBadgeScale = spring({
    frame: frame - 107,
    fps,
    config: { damping: 10, mass: 0.6 },
  });

  // 3. Outro Screen (Frames 125 - 150)
  const outroOpacity = interpolate(frame, [125, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mainSceneOpacity = interpolate(frame, [125, 132], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outroScale = spring({
    frame: frame - 125,
    fps,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill className="bg-slate-950 font-sans text-white overflow-hidden select-none">
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: `translateY(${frame * 0.5}px)`,
        }}
      />
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* ================= STAGE 1: INTRO ================= */}
      {frame < 48 && (
        <AbsoluteFill 
          className="flex flex-col items-center justify-center text-center"
          style={{
            opacity: introOpacity,
            transform: `scale(${introScale}) translateY(${introTranslateY}px)`,
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              TableProof
            </h1>
          </div>
          <p className="text-xl text-slate-400 font-medium max-w-lg">
            Gemma 4 Powered PDF Table Auditor
          </p>
        </AbsoluteFill>
      )}

      {/* ================= STAGE 2: MAIN SCENE ================= */}
      <AbsoluteFill style={{ opacity: mainSceneOpacity }}>
        {/* Header */}
        <header 
          className="absolute top-0 inset-x-0 h-20 px-12 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between"
          style={{ opacity: headerOpacity }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              TableProof
            </span>
          </div>
          <div className="px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            Challenge Track: Build With Gemma 4
          </div>
        </header>

        {/* Workspace Layout */}
        <div className="absolute inset-0 top-20 bottom-0 flex p-12 gap-8 items-center justify-center">
          {/* Left Panel: Messy PDF */}
          <div 
            className="flex-1 max-w-[500px] h-[480px] bg-slate-900/60 border border-slate-800 rounded-2xl relative shadow-2xl overflow-hidden flex flex-col"
            style={{
              opacity: pdfOpacity,
              transform: `scale(${pdfSpring}) translateY(${interpolate(pdfSpring, [0, 1], [50, 0])}px)`,
            }}
          >
            {/* PDF Header bar */}
            <div className="h-12 border-b border-slate-800 px-5 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-slate-500">quarterly_report.pdf</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Page 1 of 4</div>
            </div>

            {/* Mock PDF Text & Table content */}
            <div className="p-8 flex flex-col gap-5 font-mono text-[11px] text-slate-400 overflow-hidden leading-relaxed">
              <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
              <div className="h-3 w-full bg-slate-800/50 rounded" />
              <div className="h-3 w-5/6 bg-slate-800/50 rounded" />

              {/* PDF Flattened Table */}
              <div className="border border-dashed border-slate-700/50 rounded p-4 my-3 bg-slate-950/20 relative">
                <div className="flex justify-between border-b border-slate-800 pb-2 text-slate-500 font-bold">
                  <span>QTR</span>
                  <span>REV ($M)</span>
                  <span>MARGIN</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/50">
                  <span>Q1-2025</span>
                  <span>142.8</span>
                  <span>24.3%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/50">
                  <span>Q2-2025</span>
                  <span className="text-slate-500 font-black">159.2?</span>
                  <span>26.1%</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Q3-2025</span>
                  <span>168.4</span>
                  <span>27.5%</span>
                </div>
              </div>

              <div className="h-3 w-4/5 bg-slate-800/50 rounded" />
              <div className="h-3 w-full bg-slate-800/50 rounded" />
            </div>

            {/* Laser scanning effect overlay */}
            <div 
              className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]"
              style={{
                top: `${laserPosition}%`,
                opacity: laserOpacity,
              }}
            />
          </div>

          {/* Center arrow / process indicator */}
          <div 
            className="flex flex-col items-center justify-center gap-2 text-slate-600"
            style={{ opacity: tableOpacity }}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Gemma Vision</span>
          </div>

          {/* Right Panel: Reconstructed Structured Table */}
          <div 
            className="flex-1 max-w-[500px] h-[480px] bg-slate-900/60 border border-slate-800 rounded-2xl relative shadow-2xl overflow-hidden flex flex-col"
            style={{
              opacity: tableOpacity,
              transform: `scale(${tableSpring}) translateY(${interpolate(tableSpring, [0, 1], [50, 0])}px)`,
            }}
          >
            {/* Table Header bar */}
            <div className="h-12 border-b border-slate-800 px-5 flex items-center justify-between bg-slate-950/40">
              <span className="text-xs font-bold text-slate-300">Audited Output (JSON/CSV)</span>
              <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400">
                Extracted
              </div>
            </div>

            {/* Table structure */}
            <div className="p-6 flex flex-col h-full justify-between">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Quarter</th>
                    <th className="pb-3 text-right">Revenue ($M)</th>
                    <th className="pb-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3.5 font-medium text-slate-300">Q1-2025</td>
                    <td className="py-3.5 text-right font-mono text-slate-300">142.8</td>
                    <td className="py-3.5 text-right font-mono text-slate-300">24.3%</td>
                  </tr>
                  {/* Target audit cell row */}
                  <tr 
                    className="relative"
                    style={{
                      backgroundColor: interpolate(
                        verificationProgress,
                        [0, 1],
                        [1, 0]
                      ) > 0.5 ? "rgba(245, 158, 11, 0.05)" : "rgba(16, 185, 129, 0.05)",
                    }}
                  >
                    <td className="py-3.5 font-medium text-slate-300">Q2-2025</td>
                    {/* The cell being audited */}
                    <td className="py-3.5 text-right relative">
                      <div className="inline-block px-2 py-0.5 rounded font-mono font-bold">
                        {interpolate(verificationProgress, [0, 0.8, 1], [0, 0, 1]) > 0.5 ? (
                          <span className="text-emerald-400">159.2</span>
                        ) : (
                          <span className="text-amber-400 border-b border-dashed border-amber-400/80">159.2</span>
                        )}
                      </div>

                      {/* Sparkle/verification circle anim */}
                      {frame >= 105 && (
                        <div 
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-emerald-400 bg-emerald-500/20 flex items-center justify-center scale-0"
                          style={{
                            transform: `translateY(-50%) scale(${verifiedBadgeScale})`,
                          }}
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-400">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-300">26.1%</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3.5 font-medium text-slate-300">Q3-2025</td>
                    <td className="py-3.5 text-right font-mono text-slate-300">168.4</td>
                    <td className="py-3.5 text-right font-mono text-slate-300">27.5%</td>
                  </tr>
                </tbody>
              </table>

              {/* Warning tooltip driven by frame */}
              <div 
                className="mt-6 p-4 rounded-xl border flex items-start gap-3 shadow-lg"
                style={{
                  opacity: cellHighlightOpacity,
                  transform: `scale(${tooltipScale})`,
                  borderColor: interpolate(verificationProgress, [0, 1], [0, 1]) > 0.5 
                    ? "rgba(16, 185, 129, 0.3)" 
                    : "rgba(245, 158, 11, 0.3)",
                  backgroundColor: interpolate(verificationProgress, [0, 1], [0, 1]) > 0.5 
                    ? "rgba(16, 185, 129, 0.05)" 
                    : "rgba(245, 158, 11, 0.05)",
                }}
              >
                {/* Warning / Success icon */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: interpolate(verificationProgress, [0, 1], [0, 1]) > 0.5 
                      ? "rgba(16, 185, 129, 0.15)" 
                      : "rgba(245, 158, 11, 0.15)",
                    color: interpolate(verificationProgress, [0, 1], [0, 1]) > 0.5 
                      ? "#34d399" 
                      : "#fbbf24",
                  }}
                >
                  {interpolate(verificationProgress, [0, 1], [0, 1]) > 0.5 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs">
                    {interpolate(verificationProgress, [0, 1], [0, 1]) > 0.5 
                      ? "Verified cell accuracy" 
                      : "Uncertain PDF cell marked"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    {interpolate(verificationProgress, [0, 1], [0, 1]) > 0.5 
                      ? "Gemma cross-referenced text content with layout position. Confidence 99.8%." 
                      : "PDF text contains visual artifacts. Raw text reads '159.2?'. Audited to '159.2'."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* ================= STAGE 3: OUTRO ================= */}
      {frame >= 125 && (
        <AbsoluteFill 
          className="flex flex-col items-center justify-center bg-slate-950 text-center z-50"
          style={{
            opacity: outroOpacity,
          }}
        >
          <div 
            className="flex flex-col items-center"
            style={{
              transform: `scale(${outroScale})`,
            }}
          >
            {/* Brand Logo */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h2 className="text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                TableProof
              </h2>
            </div>

            {/* Tagline */}
            <p className="text-2xl text-slate-300 font-semibold tracking-wide max-w-lg mb-8 leading-snug">
              Structured Table Extraction You Can Trust.
            </p>

            {/* Badges / Credits */}
            <div className="flex gap-4">
              <div className="px-5 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold tracking-wide shadow-inner">
                Built for Gemma Challenge
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold tracking-wide shadow-inner">
                Powered by Gemma 4
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
