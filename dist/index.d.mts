/**
 * Device fingerprint signals collected from the browser
 */
interface DeviceSignals {
    screenResolution: string;
    colorDepth: number;
    pixelRatio: number;
    timezone: string;
    timezoneOffset: number;
    language: string;
    languages: string[];
    platform: string;
    userAgent: string;
    vendor: string;
    hardwareConcurrency: number;
    deviceMemory: number | null;
    maxTouchPoints: number;
    canvas: string | null;
    webglVendor: string | null;
    webglRenderer: string | null;
    audioFingerprint: string | null;
    fontsHash: string | null;
    cookiesEnabled: boolean;
    doNotTrack: string | null;
    sessionStorage: boolean;
    localStorage: boolean;
    indexedDB: boolean;
    plugins: string[];
    mimeTypes: string[];
}
/**
 * The final fingerprint result
 */
interface DeviceFingerprint {
    /** Stable device identifier (hash of signals) */
    deviceId: string;
    /** Confidence score 0-1 */
    confidence: number;
    /** Individual signals collected */
    signals: DeviceSignals;
    /** Timestamp of fingerprint generation */
    timestamp: number;
    /** Version of the fingerprinting algorithm */
    version: string;
}
/**
 * Options for fingerprint generation
 */
interface FingerprintOptions {
    /** Include canvas fingerprint (default: true) */
    canvas?: boolean;
    /** Include WebGL fingerprint (default: true) */
    webgl?: boolean;
    /** Include audio fingerprint (default: true) */
    audio?: boolean;
    /** Include font detection (default: true) */
    fonts?: boolean;
    /** Timeout for async operations in ms (default: 1000) */
    timeout?: number;
}

/**
 * Generate a device fingerprint
 */
declare function getFingerprint(options?: FingerprintOptions): Promise<DeviceFingerprint>;
/**
 * Get a simple device ID (just the hash, no signals)
 */
declare function getDeviceId(options?: FingerprintOptions): Promise<string>;

export { type DeviceFingerprint, type DeviceSignals, type FingerprintOptions, getDeviceId, getFingerprint };
