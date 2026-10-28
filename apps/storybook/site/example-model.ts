export const releaseSteps = ["Build packages", "Review accessibility", "Verify examples"] as const;

export function releaseSampleKey(checks: readonly boolean[]) {
  const mask = checks.reduce((value, checked, index) => value | (checked ? 1 << index : 0), 0);
  return mask === 0 ? "operations" : `operations-${mask}`;
}
