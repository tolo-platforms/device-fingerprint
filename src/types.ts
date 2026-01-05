/**
 * Device fingerprint signals collected from the browser
 */
export interface DeviceSignals {
  // Screen & Display
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;

  // Timezone & Locale
  timezone: string;
  timezoneOffset: number;
  language: string;
  languages: string[];

  // Platform
  platform: string;
  userAgent: string;
  vendor: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  maxTouchPoints: number;

  // Canvas fingerprint
  canvas: string | null;

  // WebGL
  webglVendor: string | null;
  webglRenderer: string | null;

  // Audio
  audioFingerprint: string | null;

  // Fonts (subset detection)
  fontsHash: string | null;

  // Browser features
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  sessionStorage: boolean;
  localStorage: boolean;
  indexedDB: boolean;

  // Additional signals
  plugins: string[];
  mimeTypes: string[];
}

/**
 * The final fingerprint result
 */
export interface DeviceFingerprint {
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
export interface FingerprintOptions {
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
