/**
 * Collect screen and display signals
 */
export function collectScreenSignals() {
  return {
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
  };
}
