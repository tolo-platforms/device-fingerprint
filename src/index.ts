/**
 * @tolo/device-fingerprint
 *
 * Lightweight device fingerprinting for the Tolo platform.
 * Collects browser signals to generate a stable device identifier.
 *
 * @example
 * ```typescript
 * import { getFingerprint, getDeviceId } from '@tolo/device-fingerprint';
 *
 * // Get full fingerprint with all signals
 * const fingerprint = await getFingerprint();
 * console.log(fingerprint.deviceId);
 * console.log(fingerprint.signals);
 *
 * // Get just the device ID
 * const deviceId = await getDeviceId();
 * ```
 */

export { getFingerprint, getDeviceId } from "./fingerprint";
export type { DeviceFingerprint, DeviceSignals, FingerprintOptions } from "./types";
