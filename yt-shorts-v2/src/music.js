// music.js: a 120 bpm synthesised track plus foley, rendered offline with Tone.js. The beat is the spine: the drums
// play the whole Short except the bars a Short marks as `drop` (silence before a punchline), and every slammed word
// in WORDS gets a whoosh (and an impact if it is an accent), so sound and type cannot drift apart.
const CUES = [];
const cue = (t, kind, o = {}) => CUES.push({ t, kind, ...o });
const SONG = { bass: null, stabs: null, silent: [], riser: null, extra: [] };   // a Short fills these in

async function buildTrack(parts) {
  const out = new Tone.Limiter(-1).toDestination();
  const comp = new Tone.Compressor({ threshold: -16, ratio: 4, attack: .005, release: .12 }).connect(out);
  const verb = new Tone.Reverb({ decay: 1.4, wet: .14 }); await verb.ready; verb.connect(comp);
  const dry = new Tone.Gain(1).connect(comp), wet = new Tone.Gain(1).connect(verb);
  const at = (pan, g, rev = false) => new Tone.Panner(pan || 0).connect(new Tone.Gain(g).connect(rev ? wet : dry));
  const silent = t => SONG.silent.some(([a, b]) => t >= a && t < b);

  if (parts.music) {
    const kick = new Tone.MembraneSynth({ pitchDecay: .05, octaves: 6, envelope: { attack: .001, decay: .35, sustain: 0, release: .1 } }).connect(at(0, .9));
    const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: .001, decay: .16, sustain: 0 } }).connect(new Tone.Filter(1800, 'highpass').connect(at(0, .38, true)));
    const clap = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: .001, decay: .09, sustain: 0 } }).connect(new Tone.Filter(1200, 'bandpass').connect(at(0, .3, true)));
    const hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: .001, decay: .035, sustain: 0 } }).connect(new Tone.Filter(8000, 'highpass').connect(at(.2, .12)));
    const bass = new Tone.MonoSynth({ oscillator: { type: 'sawtooth' }, filter: { Q: 2 }, envelope: { attack: .005, decay: .2, sustain: .6, release: .08 }, filterEnvelope: { attack: .005, decay: .18, sustain: .3, baseFrequency: 90, octaves: 2.6 } }).connect(at(0, .3));
    const stab = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'fatsawtooth', spread: 22, count: 3 }, envelope: { attack: .004, decay: .14, sustain: .0, release: .12 } }).connect(new Tone.Filter(2400, 'lowpass').connect(at(-.1, .1, true)));
    for (let i = 0; i * BEAT / 2 < DUR - .01; i++) {
      const t = i * BEAT / 2, beat = Math.floor(i / 2), off = i % 2, bar = Math.floor(beat / 4), inBar = beat % 4;
      if (silent(t)) continue;
      if (!off && (inBar === 0 || inBar === 2)) kick.triggerAttackRelease('C1', .3, t);
      if (!off && inBar === 2 && hash(bar) > .5) kick.triggerAttackRelease('C1', .2, t + BEAT * .75);   // a ghost kick for push
      if (!off && (inBar === 1 || inBar === 3)) { snare.triggerAttackRelease(.12, t); clap.triggerAttackRelease(.08, t + .012); }
      hat.triggerAttackRelease(.03, t, off ? .9 : .5);
      if (SONG.bass) { const n = SONG.bass[bar % SONG.bass.length]; if (inBar !== 3 || off) bass.triggerAttackRelease(off ? n.replace(/\d/, d => +d + 1) : n, .2, t); }
      if (SONG.stabs && off && (inBar === 0 || inBar === 2)) stab.triggerAttackRelease(SONG.stabs[bar % SONG.stabs.length], .1, t);
    }
    if (SONG.riser) { const [a, b] = SONG.riser, n = new Tone.Noise('white'), f = new Tone.Filter(400, 'bandpass'), g = new Tone.Gain(0); n.connect(f); f.connect(g); g.connect(at(0, .22, true)); f.frequency.setValueAtTime(400, a); f.frequency.exponentialRampToValueAtTime(7000, b); g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(1, b - .02); g.gain.linearRampToValueAtTime(0, b); n.start(a).stop(b + .02); }
  }

  if (parts.sfx) {
    const noise = (t, dur, f0, f1, q, g, pan, swell) => {
      const n = new Tone.Noise('white'), bp = new Tone.Filter(f0, 'bandpass'), e = new Tone.Gain(0); bp.Q.value = q; n.connect(bp); bp.connect(e); e.connect(at(pan, g, true));
      bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      if (swell) { e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(1, t + dur * .85); e.gain.linearRampToValueAtTime(0, t + dur); } else { e.gain.setValueAtTime(1, t); e.gain.exponentialRampToValueAtTime(.001, t + dur); }
      n.start(t).stop(t + dur + .02);
    };
    const tone = (t, f0, f1, dur, g, pan, type = 'sine') => { const o = new Tone.Oscillator(f0, type), e = new Tone.Gain(0); o.connect(e); e.connect(at(pan, g)); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(1, t + .004); e.gain.exponentialRampToValueAtTime(.001, t + dur); o.start(t).stop(t + dur + .02); };
    const bell = (note, t, pan, g, dur = .6) => { const s = new Tone.FMSynth({ harmonicity: 3.01, modulationIndex: 9, envelope: { attack: .002, decay: .5, sustain: 0, release: .5 } }).connect(at(pan, g, true)); s.triggerAttackRelease(note, dur, t); };
    for (const c of CUES) {
      const { t, pan = 0 } = c, g = c.gain ?? 1;
      switch (c.kind) {
        case 'whoosh': { const s0 = Math.max(0, t - .09); noise(s0, t + .03 - s0 || .03, 600, 4500, .8, .32 * g, pan, true); break; }   // lands on t
        case 'impact': tone(t, 140, 38, .45, .75 * g, pan); noise(t, .25, 2500, 400, .6, .3 * g, pan); break;
        case 'tick': tone(t, 2400, 2000, .03, .2 * g, pan, 'square'); break;
        case 'type': for (let i = 0; i < (c.n || 6); i++) noise(t + i * (c.gap || .05), .018, 4500, 3500, 3, .22 * g, pan); break;
        case 'glitch': for (let i = 0; i < 6; i++) tone(t + i * .025, 200 + 900 * hash(i + t), 120, .03, .14 * g, (hash(i) - .5), 'square'); noise(t, .16, 3000, 600, .5, .3 * g, pan); break;
        case 'pop': tone(t, 300, 1500, .07, .5 * g, pan); noise(t, .06, 3000, 1500, 1, .3 * g, pan); break;
        case 'boom': tone(t, 90, 30, 1, .9 * g, pan); noise(t, .9, 1200, 200, .4, .45 * g, pan); break;
        case 'ding': bell(c.note || 'E6', t, pan, .3 * g); break;
        case 'error': tone(t, 300, 290, .12, .18 * g, pan, 'square'); tone(t + .13, 300, 290, .12, .18 * g, pan, 'square'); break;
        case 'rise': tone(t, 300, 1800, c.dur || .4, .12 * g, pan, 'triangle'); break;
      }
    }
  }
}
// every slammed word: a whoosh landing on it; accents also get an impact
function wordCues() { for (const w of WORDS) { cue(beatT(w.b), 'whoosh', { pan: clamp((w.x / W) * 2 - 1, -1, 1) * .4, gain: w.size > 200 ? 1.3 : .8 }); if (w.accent) cue(beatT(w.b), 'impact', { gain: w.accent }); } }

function wavB64(buffer) {
  const ch = [buffer.getChannelData(0), buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0)], n = ch[0].length, sr = buffer.sampleRate;
  const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), s = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  s(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); s(8, 'WAVE'); s(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * 4, true);
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < 2; c++, o += 2) v.setInt16(o, Math.max(-1, Math.min(1, ch[c][i])) * 32767, true);
  const u = new Uint8Array(ab); let str = ''; for (let i = 0; i < u.length; i += 0x8000) str += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(str);
}
async function renderPart(parts) { const buf = await Tone.Offline(async () => { await buildTrack(parts); }, DUR, 2, 48000); return wavB64(buf.get()); }
async function renderStems() { CUES.sort((a, b) => a.t - b.t); return { music: await renderPart({ music: true }), sfx: await renderPart({ sfx: true }), mix: await renderPart({ music: true, sfx: true }) }; }
