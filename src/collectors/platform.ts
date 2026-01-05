/**
 * Collect platform and browser signals
 */
export function collectPlatformSignals() {
  const nav = navigator;

  return {
    platform: nav.platform || "unknown",
    userAgent: nav.userAgent,
    vendor: nav.vendor || "",
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: (nav as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
    maxTouchPoints: nav.maxTouchPoints || 0,
    cookiesEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack || null,
    plugins: getPlugins(),
    mimeTypes: getMimeTypes(),
  };
}

function getPlugins(): string[] {
  const plugins: string[] = [];
  if (navigator.plugins) {
    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i];
      if (plugin) {
        plugins.push(plugin.name);
      }
    }
  }
  return plugins;
}

function getMimeTypes(): string[] {
  const types: string[] = [];
  if (navigator.mimeTypes) {
    for (let i = 0; i < navigator.mimeTypes.length; i++) {
      const type = navigator.mimeTypes[i];
      if (type) {
        types.push(type.type);
      }
    }
  }
  return types;
}
