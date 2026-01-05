import type { DeviceFingerprint, DeviceSignals, FingerprintOptions } from "./types";
import { sha256 } from "./hash";
import {
  collectScreenSignals,
  collectPlatformSignals,
  collectLocaleSignals,
  collectCanvasFingerprint,
  collectWebGLSignals,
  collectAudioFingerprint,
  collectFontsFingerprint,
  collectStorageSignals,
} from "./collectors";

const VERSION = "1.0.0";

/**
 * Default fingerprint options
 */
const defaultOptions: Required<FingerprintOptions> = {
  canvas: true,
  webgl: true,
  audio: true,
  fonts: true,
  timeout: 1000,
};

/**
 * Generate a device fingerprint
 */
export async function getFingerprint(
  options: FingerprintOptions = {}
): Promise<DeviceFingerprint> {
  const opts = { ...defaultOptions, ...options };

  // Collect all signals
  const screenSignals = collectScreenSignals();
  const platformSignals = collectPlatformSignals();
  const localeSignals = collectLocaleSignals();
  const storageSignals = collectStorageSignals();
  const webglSignals = opts.webgl ? collectWebGLSignals() : { vendor: null, renderer: null };

  // Async collectors
  const [canvas, audio, fonts] = await Promise.all([
    opts.canvas ? Promise.resolve(collectCanvasFingerprint()) : Promise.resolve(null),
    opts.audio ? collectAudioFingerprint(opts.timeout) : Promise.resolve(null),
    opts.fonts ? Promise.resolve(collectFontsFingerprint()) : Promise.resolve(null),
  ]);

  const signals: DeviceSignals = {
    ...screenSignals,
    ...localeSignals,
    ...platformSignals,
    ...storageSignals,
    canvas,
    webglVendor: webglSignals.vendor,
    webglRenderer: webglSignals.renderer,
    audioFingerprint: audio,
    fontsHash: fonts,
  };

  // Generate stable device ID from key signals
  const stableSignals = [
    signals.screenResolution,
    signals.colorDepth,
    signals.pixelRatio,
    signals.timezone,
    signals.platform,
    signals.hardwareConcurrency,
    signals.deviceMemory,
    signals.canvas,
    signals.webglVendor,
    signals.webglRenderer,
    signals.audioFingerprint,
    signals.fontsHash,
  ]
    .filter(Boolean)
    .join("|");

  const deviceId = await sha256(stableSignals);

  // Calculate confidence based on how many signals we collected
  const totalSignals = 12;
  const collectedSignals = [
    signals.canvas,
    signals.webglVendor,
    signals.webglRenderer,
    signals.audioFingerprint,
    signals.fontsHash,
    signals.screenResolution,
    signals.colorDepth,
    signals.platform,
    signals.hardwareConcurrency,
    signals.timezone,
    signals.language,
    signals.userAgent,
  ].filter(Boolean).length;

  const confidence = collectedSignals / totalSignals;

  return {
    deviceId,
    confidence,
    signals,
    timestamp: Date.now(),
    version: VERSION,
  };
}

/**
 * Get a simple device ID (just the hash, no signals)
 */
export async function getDeviceId(options: FingerprintOptions = {}): Promise<string> {
  const fingerprint = await getFingerprint(options);
  return fingerprint.deviceId;
}
