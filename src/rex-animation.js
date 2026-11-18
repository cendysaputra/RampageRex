import { smooth } from './motion.js';

export const rexFramePath = (atlas, frame) => `characters/rex/animation-frames/${atlas}-${frame}`;

// The generated poses differ too much to dissolve slowly: a long crossfade shows two
// see-through Rexes at once. Each pose is held and only the last moment is blended.
const FADE = .05;

export function rexPose(rex, animation) {
  const frame = (clip, index) => {
    const sequence = animation.clips[clip];
    return rexFramePath(sequence.atlas, sequence.frames[index]);
  };
  const idle = frame('idle', 0), action = rex.attack;
  if (action) {
    const { key, age, impact, duration } = action, recovery = duration - impact;
    let times, poses;
    if (key === 'ulti') {
      // Uses the dedicated clip when the manifest has one; until then it borrows roar and stomp poses.
      const { frames, contact } = animation.clips.ulti;
      const paths = frames.map((_, index) => frame('ulti', index)), after = paths.length - contact;
      times = [0, ...paths.map((_, index) => index <= contact
        ? impact * (index + 1) / (contact + 1)
        : impact + recovery * (index - contact) / after), duration];
      poses = [idle, ...paths, idle];
    } else {
      times = key === 'tail'
        ? [0, impact * .5, impact, impact + recovery * .28, impact + recovery * .7, duration]
        : [0, impact * .22, impact * .65, impact, impact + recovery * .65, duration];
      poses = [idle, ...animation.clips[key].frames.map((_, index) => frame(key, index)), idle];
    }
    const next = times.findIndex(time => time > age);
    if (next < 1) return { from: idle, to: idle, mix: 0 };
    // The ultimate's poses change the whole silhouette, so its blend is kept even shorter.
    const end = times[next], fade = Math.min(key === 'ulti' ? FADE * .6 : FADE, end - times[next - 1]);
    return { from: poses[next - 1], to: poses[next], mix: smooth((age - (end - fade)) / fade) };
  }
  if (rex.stride < .005) return { from: idle, to: idle, mix: 0 };
  const count = animation.clips.walk.frames.length, position = rex.walk / (Math.PI * 2) * count;
  const index = Math.floor(position) % count, from = frame('walk', index), to = frame('walk', (index + 1) % count);
  if (rex.stride < .45) return { from: idle, to: from, mix: smooth((rex.stride - .2) / .25) };
  return { from, to, mix: smooth((position % 1 - .7) / .3) };
}
