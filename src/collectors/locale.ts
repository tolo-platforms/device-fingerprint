/**
 * Collect timezone and locale signals
 */
export function collectLocaleSignals() {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    timezoneOffset: new Date().getTimezoneOffset(),
    language: navigator.language || "unknown",
    languages: Array.from(navigator.languages || [navigator.language]),
  };
}
