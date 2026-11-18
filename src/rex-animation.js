import { smooth } from './motion.js';

export const rexFramePath = (atlas, frame) => `characters/rex/animation-frames/${atlas}-${frame}`;

export function rexPose(rex, animation) {
  const frame = (clip, index) => {
    const sequence = animation.clips[clip];
    return rexFramePath(sequence.atlas, sequence.frames[index]);
  };
  const idle = frame('idle', 0), action = rex.attack;
  if (action) {
    const { key, age, impact, duration } = action, recovery = duration - impact;
    const times = key === 'tail'
      ? [0, impact * .5, impact, impact + recovery * .28, impact + recovery * .7, duration]
      : [0, impact * .22, impact * .65, impact, impact + recovery * .65, duration];
    const poses = [idle, ...animation.clips[key].frames.map((_, index) => frame(key, index)), idle];
    const next = times.findIndex(time => time > age);
    if (next < 1) return { from: idle, to: idle, mix: 0 };
    return { from: poses[next - 1], to: poses[next], mix: smooth((age - times[next - 1]) / (times[next] - times[next - 1])) };
  }
  if (rex.stride < .005) return { from: idle, to: idle, mix: 0 };
  const count = animation.clips.walk.frames.length, position = rex.walk / (Math.PI * 2) * count;
  const index = Math.floor(position) % count, from = frame('walk', index), to = frame('walk', (index + 1) % count);
  if (rex.stride < .65) return { from: idle, to: from, mix: smooth(rex.stride / .65) };
  return { from, to, mix: smooth((position % 1 - .55) / .45) };
}
