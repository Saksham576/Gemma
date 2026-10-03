// audio.js: cartoon foley and a looping music bed, synthesised offline with Tone.js. A Short registers its sound
// with cue(t, kind, opts) and an optional MUSIC.bed(len) plan, using the same time constants as its shots, so every
// sound lands on its frame. Everything is synthesised: no samples, nothing to license.
const CUES = [];
const cue = (t, kind, o = {}) => CUES.push({ t, kind, ...o });
const MUSIC = { key: 'C', chords: null, lead: null };   // a Short fills these in (see below)
const panX = x => clamp((x / W) * 2 - 1, -1, 1) * .6;

async function buildAudio(parts) {
  const out = new Tone.Limiter(-1.2).toDestination();
  const comp = new Tone.Compressor({ threshold: -18, ratio: 3, attack: .008, release: .18 }).connect(out);
  const verb = new Tone.Reverb({ decay: 1.6, wet: .18 }); await verb.ready; verb.connect(comp);
  const bus = new Tone.Gain(1).connect(verb);
  const at = (pan, g) => new Tone.Panner(pan || 0).connect(new Tone.Gain(g).connect(bus));
  const DUR = PROJECT.duration;

  if (parts.music && MUSIC.chords) {
    // a light cartoon bed: plucked chords on the beat, a walking bass, brushed hats on the off-beats. It loops: the
    // chord plan covers exactly DUR seconds and every note's tail is cut before the end.
    const pl = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: .005, decay: .25, sustain: .1, release: .2 } }).connect(at(-.15, .09));
    const bass = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: .01, decay: .2, sustain: .5, release: .1 } }).connect(at(0, .22));
    const hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: .001, decay: .03, sustain: 0 } }).connect(new Tone.Filter(7000, 'highpass').connect(at(.2, .05)));
    const bars = MUSIC.chords;   // [[notes...], bassNotes[4]] per bar (2 s)
    for (let b = 0; b * 2 < DUR; b++) {
      const [notes, bl] = bars[b % bars.length], t0 = b * 2;
      for (let k = 0; k < 4; k++) {
        const t = t0 + k * .5; if (t > DUR - .3) break;
        if (MUSIC.quiet && MUSIC.quiet.some(([a, z]) => t >= a && t < z)) continue;   // drop out for a gag's silence
        pl.triggerAttackRelease(notes, .18, t, k === 0 ? .9 : .55);
        bass.triggerAttackRelease(bl[k], .3, t);
        hat.triggerAttackRelease(.03, t + .25);
      }
    }
    if (MUSIC.lead) { const ld = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: .01, decay: .1, sustain: .3, release: .1 } }).connect(new Tone.Filter(2200, 'lowpass').connect(at(.1, .05))); for (const [t, n, d] of MUSIC.lead) ld.triggerAttackRelease(n, d, t); }
  }

  if (parts.sfx) {
    const noise = (t, dur, f0, f1, q, g, pan, shape = 'fall', type = 'white') => {
      const n = new Tone.Noise(type), bp = new Tone.Filter(f0, 'bandpass'), env = new Tone.Gain(0);
      bp.Q.value = q; n.connect(bp); bp.connect(env); env.connect(at(pan, g));
      bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      if (shape === 'swell') { env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(1, t + dur * .8); env.gain.linearRampToValueAtTime(0, t + dur); }
      else if (shape === 'fall') { env.gain.setValueAtTime(1, t); env.gain.exponentialRampToValueAtTime(.001, t + dur); }   // 'none': the caller shapes it
      n.start(t).stop(t + dur + .02); return env;
    };
    const sweep = (t, dur, f0, f1, g, pan, type = 'sine') => {   // a pitched slide (slide whistle, boing, bloop)
      const o = new Tone.Oscillator(f0, type), e = new Tone.Gain(0); o.connect(e); e.connect(at(pan, g));
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(1, t + .008); e.gain.setValueAtTime(1, t + dur * .7); e.gain.linearRampToValueAtTime(0, t + dur);
      o.start(t).stop(t + dur + .02);
    };
    const bell = (note, t, pan, g = .3, dur = 1) => { const s = new Tone.FMSynth({ harmonicity: 3.01, modulationIndex: 10, envelope: { attack: .002, decay: .7, sustain: 0, release: .8 }, modulationEnvelope: { attack: .002, decay: .25, sustain: 0, release: .2 } }).connect(at(pan, g)); s.triggerAttackRelease(note, dur, t); };
    const drum = (note, t, pan, g, decay = .25, oct = 4) => { const k = new Tone.MembraneSynth({ pitchDecay: .04, octaves: oct, envelope: { attack: .001, decay, sustain: 0, release: .05 } }).connect(at(pan, g)); k.triggerAttackRelease(note, decay, t); };
    const blip = (note, t, pan, g, type = 'triangle', d = .06) => { const s = new Tone.Synth({ oscillator: { type }, envelope: { attack: .001, decay: d, sustain: 0, release: .03 } }).connect(at(pan, g)); s.triggerAttackRelease(note, d, t); };
    for (const c of CUES) {
      const { t, pan = 0 } = c, g = c.gain ?? 1;
      switch (c.kind) {
        case 'tick': blip('C6', t, pan, .25 * g, 'square', .02); break;                                // clockwork tick
        case 'tock': blip('G5', t, pan, .22 * g, 'square', .02); break;
        case 'pop': sweep(t, .09, 300, 1400, .5 * g, pan); noise(t, .05, 3000, 1500, 1, .3 * g, pan); break;
        case 'boing': { const o = new Tone.Oscillator(180, 'sine'), e = new Tone.Gain(0), lfo = new Tone.LFO(14, 140, 260); lfo.connect(o.frequency); lfo.start(t).stop(t + .5); o.connect(e); e.connect(at(pan, .45 * g)); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(1, t + .01); e.gain.exponentialRampToValueAtTime(.001, t + .5); o.start(t).stop(t + .52); break; }
        case 'whoosh': noise(t, c.dur || .35, 400, 3500, .8, .45 * g, pan, 'swell'); break;
        case 'slideUp': sweep(t, c.dur || .5, 500, 1600, .25 * g, pan); break;
        case 'slideDown': sweep(t, c.dur || .6, 1400, 300, .25 * g, pan); break;
        case 'thud': drum('C2', t, pan, .7 * g, .3); noise(t, .12, 900, 300, .7, .25 * g, pan); break;
        case 'clack': drum('G4', t, pan, .35 * g, .06, 2); noise(t, .04, 2500, 1500, 2, .3 * g, pan); break;   // wooden block
        case 'crash': for (let i = 0; i < 9; i++) { drum(['G4', 'E4', 'A4', 'D4', 'F4'][i % 5], t + i * .045 + .02 * hash(i), (hash(i + 3) - .5) * 1.2, .3 * g, .07, 2); } noise(t, .6, 1800, 600, .6, .3 * g, pan); break;
        case 'ding': bell(c.note || 'E6', t, pan, .32 * g, 1.2); break;
        case 'sparkle': ['E6', 'G#6', 'B6'].forEach((n, i) => bell(n, t + i * .06, pan, .16 * g, .6)); break;
        case 'sad': sweep(t, .45, 520, 380, .14 * g, pan, 'triangle'); sweep(t + .45, .7, 400, 260, .14 * g, pan, 'triangle'); break;   // wah-wah
        case 'gulp': sweep(t, .12, 900, 250, .3 * g, pan); break;
        case 'sweat': blip('A6', t, pan, .12 * g, 'sine', .08); break;
        case 'buzz': { const o = new Tone.Oscillator(210, 'sawtooth'), e = new Tone.Gain(0), lf = new Tone.Filter(1500, 'lowpass'), v = new Tone.LFO(9, 190, 240); v.connect(o.frequency); v.start(t).stop(t + c.dur); o.connect(lf); lf.connect(e); e.connect(at(pan, .07 * g)); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(1, t + .1); e.gain.setValueAtTime(1, t + c.dur - .1); e.gain.linearRampToValueAtTime(0, t + c.dur); o.start(t).stop(t + c.dur); break; }
        case 'rain': { const env = noise(t, c.dur, 5000, 4000, .5, .12 * g, pan, 'none', 'pink'); env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(1, t + .3); env.gain.setValueAtTime(1, t + c.dur - .3); env.gain.linearRampToValueAtTime(0, t + c.dur); break; }
        case 'drip': sweep(t, .07, 1800, 700, .22 * g, pan); break;
        case 'grow': sweep(t, c.dur || 1, 200, 900, .12 * g, pan, 'triangle'); noise(t, c.dur || 1, 500, 2500, .6, .15 * g, pan, 'swell'); break;
        case 'bloom': ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => bell(n, t + i * .07, pan, .2 * g, 1)); break;
        case 'achoo': noise(t, .1, 1200, 2500, .8, .2 * g, pan, 'swell'); noise(t + .12, .3, 3000, 900, .5, .55 * g, pan); break;
        case 'puff': noise(t, .25, 1500, 500, .5, .35 * g, pan); break;
        case 'lever': drum('A3', t, pan, .25 * g, .05, 2); noise(t, .08, 3000, 1200, 2, .2 * g, pan); break;
        case 'step': drum('E3', t, pan, .12 * g, .05, 2); break;
      }
    }
  }
}

// ---- render: Tone.Offline → 16-bit stereo WAV, base64 so it survives page.evaluate ----
function wavOf(buffer) {
  const ch = [buffer.getChannelData(0), buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0)], n = ch[0].length, sr = buffer.sampleRate;
  const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), s = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  s(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); s(8, 'WAVE'); s(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * 4, true);
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < 2; c++, o += 2) v.setInt16(o, Math.max(-1, Math.min(1, ch[c][i])) * 32767, true);
  const u = new Uint8Array(ab); let str = ''; for (let i = 0; i < u.length; i += 0x8000) str += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(str);
}
async function renderPart(parts) { const buf = await Tone.Offline(async () => { await buildAudio(parts); }, PROJECT.duration, 2, 48000); return wavOf(buf.get()); }
async function renderStems() { CUES.sort((a, b) => a.t - b.t); return { music: await renderPart({ music: true }), sfx: await renderPart({ sfx: true }), mix: await renderPart({ music: true, sfx: true }) }; }
