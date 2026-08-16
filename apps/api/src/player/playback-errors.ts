export const BLOCKED_PLAYBACK_CODES = [100, 101, 150];

export function isBlockedCode(code: number | null): boolean {
  return code !== null && BLOCKED_PLAYBACK_CODES.includes(code);
}

export function notBlockedMediaFilter(venueId: string) {
  return {
    NOT: {
      mediaErrors: {
        some: { venueId, errorCode: { in: BLOCKED_PLAYBACK_CODES } },
      },
    },
  };
}
