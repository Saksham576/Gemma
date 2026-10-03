// config.js: which Short this page renders (?short=toast|tower|cloud) and its length. 120 bpm: a bar is 2 s, and
// every Short is a whole number of bars, so its music bed loops exactly with the picture.
const SHORT = new URLSearchParams(location.search).get('short') || 'toast';
const SHORT_DUR = { toast: 18, tower: 20, cloud: 20 };
const PROJECT = { duration: SHORT_DUR[SHORT], bpm: 120, offset: 0 };
