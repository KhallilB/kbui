// 640 CSS px models 1280px at 200% zoom; verifies reflow only.
export const controlProfiles = [
  { name: "desktop", browserName: "chromium", width: 1280, height: 900 },
  { name: "narrow", browserName: "chromium", width: 320, height: 568 },
  { name: "webkit-narrow", browserName: "webkit", width: 390, height: 844 },
  { name: "200-percent-reflow", browserName: "chromium", width: 640, height: 450 },
  { name: "webkit-200-percent-reflow", browserName: "webkit", width: 640, height: 450 },
] as const;

export const landingProfiles = [
  { name: "desktop", browserName: "chromium", width: 1280, height: 900 },
  { name: "narrow", browserName: "chromium", width: 320, height: 568 },
  { name: "reflow", browserName: "chromium", width: 640, height: 450 },
  { name: "webkit", browserName: "webkit", width: 390, height: 844 },
] as const;

export const releaseProfiles = [
  { name: "chromium-short-mobile", browserName: "chromium", width: 320, height: 568 },
  { name: "webkit-mobile", browserName: "webkit", width: 390, height: 844 },
  { name: "webkit-landscape", browserName: "webkit", width: 844, height: 390 },
] as const;
