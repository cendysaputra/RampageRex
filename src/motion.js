export const damp = (rate, dt) => 1 - Math.exp(-rate * dt);
export function smooth(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

// Reach the contact pose on the damage tick, then ease back to rest.
export function attackPose(action) {
  if (!action) return 0;
  return action.age <= action.impact
    ? smooth(action.age / action.impact)
    : 1 - smooth((action.age - action.impact) / (action.duration - action.impact));
}

export function spritePose(entity, frame, dt) {
  if (entity.frame !== frame) {
    entity.fromFrame = entity.frame || frame;
    entity.frame = frame;
    entity.frameAge = 0;
  } else entity.frameAge += dt;
  entity.frameMix = smooth(entity.frameAge / .065);
}
