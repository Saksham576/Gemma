// config.js: which Short this page renders (?short=a_3am|b_prompt|c_last10) and its length. 120 bpm, 12 bars = 24 s,
// so the music bed loops exactly with the picture.
const SHORT = new URLSearchParams(location.search).get('short') || 'a_3am';
const PROJECT = { duration: 24 };
