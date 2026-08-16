export const BLOCKED_PLAYBACK_CODES = [100, 101, 150];

export function isBlockedCode(code: number | null): boolean {
  return code !== null && BLOCKED_PLAYBACK_CODES.includes(code);
}

export const notBlockedMediaFilter = {
  OR: [
    { playbackErrorCode: null },
    { playbackErrorCode: { notIn: BLOCKED_PLAYBACK_CODES } },
  ],
};
