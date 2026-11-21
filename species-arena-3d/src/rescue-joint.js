export const JOINT_EVAC_START = 4.15;
export const JOINT_EVAC_END = 5.35;
export const JOINT_LOWER_START = 6.22;
export const JOINT_LAND = 9.64;

const STREET_DURATION = 11.6;
const SPEED_DURATION = 15.7;
const SPEED_EXTRA_TIME = SPEED_DURATION - STREET_DURATION;
const SPEED_EVAC_END = JOINT_EVAC_END + SPEED_EXTRA_TIME;
const EVAC_DURATION = JOINT_EVAC_END - JOINT_EVAC_START;
const SLOW_RATE = EVAC_DURATION / (SPEED_EVAC_END - JOINT_EVAC_START);
const SPEED_STANDBY = 2.65;
const SPEED_SAFE = 8.18;
const WEB_HOLD_END = 4.39;

function clampTime(time, duration) {
  return Math.min(duration, Math.max(0, time || 0));
}

export function jointDuration(perspective) {
  return perspective === 'speed' ? SPEED_DURATION : STREET_DURATION;
}

export function jointTime(eventTime, perspective) {
  const bounded = clampTime(eventTime, STREET_DURATION);
  if (perspective !== 'speed' || bounded <= JOINT_EVAC_START) return bounded;
  if (bounded < JOINT_EVAC_END) return JOINT_EVAC_START + (bounded - JOINT_EVAC_START) / SLOW_RATE;
  return bounded + SPEED_EXTRA_TIME;
}

function eventTimeAt(time, perspective) {
  const bounded = clampTime(time, jointDuration(perspective));
  if (perspective !== 'speed' || bounded <= JOINT_EVAC_START) return bounded;
  if (bounded < SPEED_EVAC_END) return JOINT_EVAC_START + (bounded - JOINT_EVAC_START) * SLOW_RATE;
  return bounded - SPEED_EXTRA_TIME;
}

export function jointFrame(time, perspective) {
  const eventTime = eventTimeAt(time, perspective);
  const evacuating = eventTime >= JOINT_EVAC_START && eventTime < JOINT_EVAC_END;
  let webTime = eventTime;
  let speedTime = Math.min(eventTime, SPEED_STANDBY);
  let debrisTime = Math.min(eventTime, 2.8);

  // Keep the web rig under load while the speed rig runs its three transfers.
  if (eventTime >= JOINT_EVAC_START) {
    const progress = Math.min(1, (eventTime - JOINT_EVAC_START) / EVAC_DURATION);
    const afterEvacuation = Math.max(0, eventTime - JOINT_EVAC_END);
    webTime = JOINT_EVAC_START + progress * (WEB_HOLD_END - JOINT_EVAC_START) + afterEvacuation;
    speedTime = SPEED_STANDBY + progress * (SPEED_SAFE - SPEED_STANDBY) + afterEvacuation;
    debrisTime = 2.8 + (eventTime - JOINT_EVAC_START) * 0.65;
  }

  return { eventTime, webTime, speedTime, debrisTime, worldRate: perspective === 'speed' && evacuating ? SLOW_RATE : 1, evacuating };
}
