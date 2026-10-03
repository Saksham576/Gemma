// The edit. Default: the vertical "Google It!" Short (song 26.38–58.28 s, 14 bars). `?landscape`: the
// reference video's timeline (timeline-ref.ts), kept to benchmark the engine against.
import type { TimelineEntry } from './engine/engine';
import type { SceneClass } from './engine/scene';
import type { Lyrics } from './engine/lyrics';
import type { AudioData } from './engine/audio';
import { LANDSCAPE } from './engine/gl';
import { makeTimeline as makeRef } from './timeline-ref';

const modules = import.meta.glob<{ default: SceneClass }>('./scenes/*.ts');
const scene = (name: string) => () => {
  const m = modules[`./scenes/${name}.ts`];
  return m ? m() : Promise.reject(new Error(`scene module not found: scenes/${name}.ts`));
};

/** The Short's window in song time: from the downbeat before "really?" to the downbeat after "…Norway?". */
export const SHORT = { from: 26.38, to: 58.28 };

export function makeTimeline(ly: Lyrics, au: AudioData): TimelineEntry[] {
  if (LANDSCAPE) return makeRef(ly, au);
  /** The beat at/before the first word of a line (cuts land on the grid, never after the word). */
  const cut = (q: string, nth = 0) => au.timeOfBeat(Math.floor(au.beatAt(ly.get(q, nth).words[0]!.start + 0.02)));
  /** Downbeat nearest to t. */
  const bar = (t: number) => au.downbeats.reduce((b, d) => (Math.abs(d - t) < Math.abs(b - t) ? d : b), au.downbeats[0]!);

  const b = {
    query: bar(SHORT.from),
    everybody: cut('Google it!'),
    keys: cut('Click clack'),
    recurse: cut('Just Google it!'),
    overview: bar(40.05),
    captcha: bar(44.61),
    dino: bar(49.16),
    couch: bar(53.72),
    end: bar(SHORT.to),
  };
  const E = (id: string, start: number, end: number, extra: Partial<TimelineEntry> = {}): TimelineEntry =>
    ({ id, load: scene(id), start, end, ...extra });
  return [
    E('query', b.query, b.everybody),
    E('everybody', b.everybody, b.keys),
    E('keys', b.keys, b.recurse),
    E('recurse', b.recurse, b.overview),
    E('overview', b.overview, b.captcha),
    E('captcha', b.captcha, b.dino),
    E('dino', b.dino, b.couch),
    E('couch', b.couch, b.end),
  ];
}
