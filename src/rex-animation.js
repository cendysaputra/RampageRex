import { smooth } from './motion.js';

// Jalur frame
export const rexFramePath = (atlas, frame) => `characters/rex/animation-frames/${atlas}-${frame}`;

// Durasi baur
const FADE = .05;

// Pose Rex
export function rexPose(rex, animation, down = -1) {
  const frame = (clip, index) => {
    const sequence = animation.clips[clip];
    return rexFramePath(sequence.atlas, sequence.frames[index]);
  };
  const idle = frame('idle', 0), action = rex.attack;
  // Tumbang: pakai klip defeat bila sudah ada, kalau belum tahan pose impact injak
  if (down >= 0) {
    const clip = animation.clips.defeat;
    if (!clip) return { from: idle, to: frame('stomp', 2), mix: smooth(down / .25) };
    const position = Math.min(down * clip.frames.length / (clip.fall ?? 1), clip.frames.length - 1);
    const index = Math.floor(position), next = Math.min(index + 1, clip.frames.length - 1);
    return { from: frame('defeat', index), to: frame('defeat', next), mix: smooth((position - index - .7) / .3) };
  }
  if (action) {
    const { key, age, impact, duration } = action, recovery = duration - impact;
    let times, poses;
    if ((key === 'ulti' || key === 'jump') && animation.clips[key]) {
      // Klip khusus dengan pose kontak di indeks `contact`
      const { frames, contact } = animation.clips[key];
      const paths = frames.map((_, index) => frame(key, index)), after = paths.length - contact;
      times = [0, ...paths.map((_, index) => index <= contact
        ? impact * (index + 1) / (contact + 1)
        : impact + recovery * (index - contact) / after), duration];
      poses = [idle, ...paths, idle];
    } else if (key === 'jump') {
      // Pose pinjaman sampai atlas lompat jadi: jongkok, raung di udara, hantaman injak
      times = [0, .16, .34, .8, impact, impact + recovery * .55, duration];
      poses = [idle, frame('stomp', 0), frame('roar', 1), frame('roar', 2), frame('stomp', 2), frame('stomp', 3), idle];
    } else {
      times = key === 'tail'
        ? [0, impact * .5, impact, impact + recovery * .28, impact + recovery * .7, duration]
        : [0, impact * .22, impact * .65, impact, impact + recovery * .65, duration];
      poses = [idle, ...animation.clips[key].frames.map((_, index) => frame(key, index)), idle];
    }
    const next = times.findIndex(time => time > age);
    if (next < 1) return { from: idle, to: idle, mix: 0 };
    // Baur ulti
    const end = times[next], fade = Math.min(key === 'ulti' ? FADE * .6 : FADE, end - times[next - 1]);
    return { from: poses[next - 1], to: poses[next], mix: smooth((age - (end - fade)) / fade) };
  }
  if (rex.stride < .005) return { from: idle, to: idle, mix: 0 };
  const count = animation.clips.walk.frames.length, position = rex.walk / (Math.PI * 2) * count;
  const index = Math.floor(position) % count, from = frame('walk', index), to = frame('walk', (index + 1) % count);
  if (rex.stride < .45) return { from: idle, to: from, mix: smooth((rex.stride - .2) / .25) };
  return { from, to, mix: smooth((position % 1 - .7) / .3) };
}
