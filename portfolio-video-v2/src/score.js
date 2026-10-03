// score.js: the reel's music and foley, synthesised offline with Tone.js from the same timeline (T) the picture reads,
// so every sound lands on its frame. Two stems (music, sfx) plus the mix, rendered with Tone.Offline at 48 kHz.
// D major. The four-note motif is the name: it plays whenever the signal signs "Saksham".
const MOTIF = ['D5', 'A4', 'B4', 'F#5'];
const CHORDS = [   // [bar start time, notes] — one chord per bar (2 s), following the plates
  [0, ['D3', 'A3', 'E4', 'F#4']], [2, ['D3', 'A3', 'E4', 'F#4']],
  [4, ['B2', 'F#3', 'A3', 'D4']], [6, ['G2', 'D3', 'F#3', 'B3']],
  [8, ['G2', 'D3', 'F#3', 'A3']], [9, ['A2', 'E3', 'G3', 'D4']],
  [10, ['F#2', 'D3', 'A3', 'E4']], [12, ['E2', 'B2', 'D3', 'G3']], [14, ['G2', 'D3', 'F#3', 'B3']], [16, ['A2', 'E3', 'A3', 'C#4']],
  [18, ['B2', 'F#3', 'A3', 'D4']], [20, ['G2', 'D3', 'F#3', 'B3']], [22, ['D3', 'A3', 'D4', 'F#4']],
  [24, ['D3', 'A3', 'E4', 'F#4']], [26, ['G2', 'D3', 'A3', 'B3']], [28, ['D3', 'A3', 'E4', 'F#4']],
];

// ---- cues: every foley event, at the frame the picture shows it. pan follows the source's screen x. ----
const CUES = [];
const cue = (t, kind, o = {}) => CUES.push({ t, kind, ...o });
const panX = x => clamp((x / W) * 2 - 1, -1, 1) * .7;
(() => {
  // the name, written: pen scratch over the stroke, the motif on a bell across it (open and outro)
  for (const [a, b] of [[T.write0, T.write1], [T.sign0, T.sign1]]) {
    cue(a, 'pen', { dur: b - a, pan: 0 });
    MOTIF.forEach((n, i) => cue(a + i * (b - a) / 4, 'motif', { note: n, pan: -.3 + i * .2 }));
  }
  cue(T.flourish0, 'swish', { dur: T.flourish1 - T.flourish0, pan: .2 });          // the underline
  cue(T.flourish1, 'collapse', { dur: T.collapse1 - T.flourish1 });                 // sheet switches off into a line
  cue(T.collapse1, 'thump');
  // TableProof: a soft click as the scanline straightens each rule (same easing as the picture)
  const scanAt = y => { let lo = T.scan0, hi = T.scan1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (lerp(TABLE.y, TABLE.y + TABLE.rows * TABLE.rowH, easeInOut(seg(m, T.scan0, T.scan1))) < y) lo = m; else hi = m; } return lo; };
  for (let r = 0; r <= TABLE.rows; r++) cue(scanAt(TABLE.y + r * TABLE.rowH + 20), 'tick', { note: ['B5', 'D6', 'F#6', 'A6'][r % 4], pan: .1 });
  cue(T.scan0, 'scan', { dur: T.scan1 - T.scan0, pan: .1 });
  cue(T.flag, 'warn', { pan: -.25 }); cue(T.click, 'knock', { pan: -.25 }); cue(T.click + .12, 'confirm', { pan: -.25 });
  cue(T.fixed1, 'type', { dur: .25, pan: .4 });
  cue(T.morph0 + .4, 'riser', { dur: T.tilt1 - T.morph0 - .4 });
  // Pilgrim: the drop, the splash, ripples as a falling pentatonic shimmer, the pen plotting the bottle
  cue(T.lift0, 'lift'); cue(T.splash, 'drop', { pan: panX(POOL[0]) });
  ['A6', 'F#6', 'E6', 'D6', 'B5', 'A5'].forEach((n, i) => cue(T.splash + .12 + i * .24, 'shimmer', { note: n, pan: -.4 + i * .16 }));
  cue(T.bottle0, 'pen', { dur: T.bottle1 - T.bottle0, pan: panX(RING_C[0]) });
  cue(T.ring0 + .2, 'reverse', { dur: T.ring1 - T.ring0 - .2 });
  cue(T.ring1, 'ting', { pan: panX(RING_C[0]) });
  // Ultrahuman: sensor pings while it orbits, heartbeats, hypnogram steps, score count, then the flatline
  for (let b = T.ring1 + BEAT; b < T.orbit1; b += BEAT) cue(b, 'ping', { pan: panX(RING_C[0]) });
  T.beats.forEach(b => cue(b, 'heart', { pan: .2 }));
  [0, .1, .26, .36, .46, .58, .68, .8, .86].forEach((f, i) => cue(T.hyp0 + f * (T.hyp1 - T.hyp0), 'step', { note: ['A4', 'D4', 'A3', 'D4', 'F#4', 'D4', 'A3', 'F#4', 'D4'][i], pan: -.1 }));
  for (let i = 0; i < 14; i++) cue(T.score0 + (T.score1 - T.score0) * easeOut(i / 14) * .97, 'count', { pan: .55 });
  cue(T.score1, 'ding', { pan: .55 });
  cue(T.flat0, 'flatline', { dur: 1.0, pan: .3 });
  cue(T.flat0 + .5, 'riser', { dur: 24.15 - T.flat0 - .5 });
  cue(24.0, 'paper', { dur: T.paper1 - 24 });
  // outro: a chime per project, a resolving chord, then the ink lifting
  T.chips.forEach((c, i) => cue(c, 'chime', { note: ['D6', 'A5', 'F#6'][i], pan: [-.35, 0, .35][i] }));
  cue(T.unsign0, 'reverse', { dur: T.unsign1 - T.unsign0 });
  CUES.sort((a, b) => a.t - b.t);
})();

// ---- synthesis ----
async function buildScore(parts) {
  const out = new Tone.Limiter(-1.2).toDestination();
  const comp = new Tone.Compressor({ threshold: -18, ratio: 3, attack: .01, release: .2 }).connect(out);
  const verb = new Tone.Reverb({ decay: 3.2, wet: .32 }); await verb.ready; verb.connect(comp);
  const bus = new Tone.Gain(1).connect(verb);
  const vol = (g) => new Tone.Gain(g).connect(bus);

  if (parts.music) {
    // pad: soft detuned triangles through a low-pass; swells in from silence and back out, so the loop is seamless
    const padLP = new Tone.Filter(1100, 'lowpass').connect(vol(.13));
    const pad = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'fattriangle', spread: 18, count: 3 }, envelope: { attack: 1.1, decay: .5, sustain: .8, release: 1.6 } }).connect(padLP);
    const padGain = padLP.frequency;
    padGain.setValueAtTime(500, 0); padGain.linearRampToValueAtTime(1300, 3); padGain.linearRampToValueAtTime(300, T.collapse1);   // the sheet switching off
    padGain.linearRampToValueAtTime(1400, 6); padGain.linearRampToValueAtTime(1800, 10); padGain.linearRampToValueAtTime(1200, 16);
    padGain.linearRampToValueAtTime(1600, 22); padGain.linearRampToValueAtTime(700, T.flat0 + .8); padGain.linearRampToValueAtTime(1300, 26); padGain.linearRampToValueAtTime(400, 29.9);
    CHORDS.forEach(([t0, notes], i) => { const t1 = i + 1 < CHORDS.length ? CHORDS[i + 1][0] : 29.4; pad.triggerAttackRelease(notes, t1 - t0 - .1, t0 + .02, i === 0 ? .25 : .5); });
    // plucked arpeggio under the scan (TableProof), sparse pentatonic plucks over the terraces (Pilgrim)
    const pl = new Tone.PluckSynth({ attackNoise: .8, dampening: 3800, resonance: .93 }).connect(new Tone.Panner(.2).connect(vol(.5)));
    const pl2 = new Tone.PluckSynth({ attackNoise: .6, dampening: 2600, resonance: .96 }).connect(new Tone.Panner(-.25).connect(vol(.5)));
    const arp = ['B3', 'D4', 'F#4', 'A4', 'B4', 'A4', 'F#4', 'D4'];
    for (let t = 4.5, i = 0; t < 8.6; t += BEAT / 2, i++) (i % 2 ? pl2 : pl).triggerAttack(t < 6 ? arp[i % 8] : ['G3', 'B3', 'D4', 'F#4', 'G4', 'F#4', 'D4', 'B3'][i % 8], t);
    const penta = ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5'];
    [10.0, 10.75, 11.5, 13.0, 13.5, 14.25, 15.0, 15.75].forEach((t, i) => (i % 2 ? pl : pl2).triggerAttack(penta[(i * 3) % penta.length], t));
    // a warm low pulse under the ring (bass on the bar)
    const bass = new Tone.MonoSynth({ oscillator: { type: 'sine' }, envelope: { attack: .02, decay: .4, sustain: .5, release: .8 }, filterEnvelope: { attack: .01, decay: .2, sustain: .3, baseFrequency: 120, octaves: 2 } }).connect(vol(.28));
    [[4, 'B1'], [6, 'G1'], [8, 'G1'], [9, 'A1'], [10, 'F#1'], [12, 'E1'], [14, 'G1'], [16, 'A1'], [18, 'B1'], [20, 'G1'], [22, 'D2'], [26, 'G1']].forEach(([t, n]) => bass.triggerAttackRelease(n, 1.6, t));
  }

  if (parts.sfx) {
    const S = {};
    const panned = (pan, g) => new Tone.Panner(pan || 0).connect(vol(g));
    const bell = (note, t, pan, g = .35, dur = 1.2) => { const s = new Tone.FMSynth({ harmonicity: 3.01, modulationIndex: 11, envelope: { attack: .002, decay: .9, sustain: 0, release: 1 }, modulationEnvelope: { attack: .002, decay: .3, sustain: 0, release: .2 } }).connect(panned(pan, g)); s.triggerAttackRelease(note, dur, t); };
    const noiseBurst = (t, dur, f0, f1, q, g, pan, type = 'pink', shape = 'swell') => {
      const n = new Tone.Noise(type), bp = new Tone.Filter(f0, 'bandpass'), env = new Tone.Gain(0);
      bp.Q.value = q; n.connect(bp); bp.connect(env); env.connect(panned(pan, g));
      bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      if (shape === 'swell') { env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(1, t + dur * .85); env.gain.linearRampToValueAtTime(0, t + dur); }
      else if (shape === 'fall') { env.gain.setValueAtTime(1, t); env.gain.exponentialRampToValueAtTime(.001, t + dur); }
      n.start(t).stop(t + dur + .05);
      return env;
    };
    for (const c of CUES) {
      const { t, pan } = c;
      switch (c.kind) {
        case 'pen': {   // a nib on paper: band-passed noise, chattering at the stroke rate
          const env = noiseBurst(t, c.dur, 3200, 4200, 1.4, .5, pan, 'white', 'none');
          for (let k = 0; k < c.dur * 24; k++) { const tt = t + k / 24, a = .25 + .75 * hash(k + t * 10); env.gain.setValueAtTime(a * .9, tt); env.gain.linearRampToValueAtTime(a * .3, tt + .035); }
          env.gain.setValueAtTime(0, t + c.dur); break;
        }
        case 'motif': bell(c.note, t, pan, .22, 1.6); break;
        case 'swish': noiseBurst(t, c.dur + .1, 900, 5000, 1.2, .5, pan); break;
        case 'collapse': { noiseBurst(t, c.dur, 6000, 300, 1.6, .45, 0); const o = new Tone.Oscillator(1200, 'sine').connect(panned(0, .08)); o.frequency.exponentialRampToValueAtTime(60, t + c.dur); o.start(t).stop(t + c.dur); break; }
        case 'thump': { const k = new Tone.MembraneSynth({ pitchDecay: .08, octaves: 5, envelope: { attack: .001, decay: .5, sustain: 0, release: .2 } }).connect(panned(0, .55)); k.triggerAttackRelease('D1', .4, t); break; }
        case 'tick': { const s = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: .001, decay: .06, sustain: 0, release: .04 } }).connect(panned(pan, .55)); s.triggerAttackRelease(c.note, .05, t); break; }
        case 'scan': { const o = new Tone.Oscillator(2400, 'sine'), g = new Tone.Gain(0); o.connect(g); g.connect(panned(pan, .03)); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .2); g.gain.linearRampToValueAtTime(0, t + c.dur); o.frequency.setValueAtTime(1800, t); o.frequency.linearRampToValueAtTime(2600, t + c.dur); o.start(t).stop(t + c.dur); break; }
        case 'warn': for (const d of [0, .14]) { const s = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: .002, decay: .08, sustain: 0, release: .02 } }).connect(new Tone.Filter(2500, 'lowpass').connect(panned(pan, .12))); s.triggerAttackRelease('E6', .07, t + d); } break;
        case 'knock': { const k = new Tone.MembraneSynth({ pitchDecay: .02, octaves: 3, envelope: { attack: .001, decay: .12, sustain: 0, release: .05 } }).connect(panned(pan, .4)); k.triggerAttackRelease('A3', .1, t); break; }
        case 'confirm': bell('A5', t, pan, .3, 1); bell('D6', t + .09, pan, .26, 1.2); break;
        case 'type': for (let k = 0; k < 6; k++) noiseBurst(t + k * .04, .02, 5000, 5000, 3, .25, pan, 'white', 'fall'); break;
        case 'riser': noiseBurst(t, c.dur, 400, 6000, .9, .35, 0); break;
        case 'lift': { const s = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: .2, decay: .3, sustain: 0, release: .2 } }).connect(panned(0, .12)); s.frequency.setValueAtTime(500, t); s.triggerAttackRelease('B4', .5, t); break; }
        case 'drop': {   // a bloop: a sine sweeping down fast, plus a low splash body
          const o = new Tone.Oscillator(1400, 'sine'), g = new Tone.Gain(0); o.connect(g); g.connect(panned(pan, .5));
          o.frequency.setValueAtTime(1400, t); o.frequency.exponentialRampToValueAtTime(260, t + .09);
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .005); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.start(t).stop(t + .3);
          noiseBurst(t, .4, 1800, 500, .8, .35, pan, 'pink', 'fall');
          const k = new Tone.MembraneSynth({ pitchDecay: .05, octaves: 3, envelope: { attack: .001, decay: .35, sustain: 0, release: .1 } }).connect(panned(pan, .35)); k.triggerAttackRelease('D2', .3, t + .01);
          break;
        }
        case 'shimmer': bell(c.note, t, pan, .34, 1.4); break;
        case 'reverse': noiseBurst(t, c.dur, 300, 4500, 1.1, .4, 0); break;
        case 'ting': bell('D7', t, pan, .3, 2.2); bell('A6', t + .02, pan, .18, 2); break;
        case 'ping': { const s = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: .002, decay: .15, sustain: 0, release: .1 } }).connect(panned(pan, .38)); s.triggerAttackRelease('A6', .1, t); break; }
        case 'heart': { const k = new Tone.MembraneSynth({ pitchDecay: .06, octaves: 4, envelope: { attack: .002, decay: .3, sustain: 0, release: .1 } }).connect(panned(pan, .95)); k.triggerAttackRelease('A1', .2, t); k.triggerAttackRelease('F1', .15, t + .19); break; }
        case 'step': { const s = new Tone.PluckSynth({ dampening: 2000, resonance: .9 }).connect(panned(pan, .35)); s.triggerAttack(c.note, t); break; }
        case 'count': { const s = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: .001, decay: .03, sustain: 0, release: .02 } }).connect(panned(pan, .3)); s.triggerAttackRelease('C7', .03, t); break; }
        case 'ding': bell('F#6', t, pan, .3, 1.4); bell('D6', t, pan, .2, 1.6); break;
        case 'flatline': { const o = new Tone.Oscillator(880, 'sine'), g = new Tone.Gain(0); o.connect(g); g.connect(panned(pan, .22)); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .01); g.gain.setValueAtTime(1, t + c.dur * .6); g.gain.linearRampToValueAtTime(0, t + c.dur); o.start(t).stop(t + c.dur + .05); break; }
        case 'paper': noiseBurst(t, c.dur, 700, 2500, .7, .3, 0, 'pink'); break;
        case 'chime': bell(c.note, t, pan, .42, 1.8); break;
      }
    }
    // the closing chord at the last chime, ringing out before the ink lifts
    bell('D5', T.chips[2] + .05, -.2, .15, 2.4); bell('A5', T.chips[2] + .08, .2, .12, 2.4);
  }
}

// ---- render: Tone.Offline → 16-bit stereo WAV (base64, so it survives page.evaluate) ----
function wav(buffer) {
  const ch = [buffer.getChannelData(0), buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0)], n = ch[0].length, sr = buffer.sampleRate;
  const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), s = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  s(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); s(8, 'WAVE'); s(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * 4, true);
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < 2; c++, o += 2) v.setInt16(o, Math.max(-1, Math.min(1, ch[c][i])) * 32767, true);
  return ab;
}
const b64 = ab => { const u = new Uint8Array(ab); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
async function renderScore(parts = { music: true, sfx: true }) {
  const buf = await Tone.Offline(async () => { await buildScore(parts); }, DUR, 2, 48000);
  return wav(buf.get());
}
async function renderStems() {
  return { music: b64(await renderScore({ music: true })), sfx: b64(await renderScore({ sfx: true })), mix: b64(await renderScore({ music: true, sfx: true })) };
}
