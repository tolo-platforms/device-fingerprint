# @tolo-platforms/device-fingerprint

[![CI](https://github.com/tolo-platforms/device-fingerprint/actions/workflows/ci.yaml/badge.svg)](https://github.com/tolo-platforms/device-fingerprint/actions/workflows/ci.yaml)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/tolo-platforms/device-fingerprint)

Lightweight, zero-dependency device fingerprinting library for browser environments.

## Installation

```bash
npm install @tolo-platforms/device-fingerprint
```

## Usage

```typescript
import { getFingerprint, getDeviceId } from '@tolo-platforms/device-fingerprint';

// Get full fingerprint with all signals
const fingerprint = await getFingerprint();
console.log(fingerprint.deviceId);     // "a1b2c3d4..."
console.log(fingerprint.confidence);   // 0.92
console.log(fingerprint.signals);      // { screenResolution: "1920x1080", ... }

// Get just the device ID
const deviceId = await getDeviceId();
console.log(deviceId);  // "a1b2c3d4..."
```

## Options

```typescript
const fingerprint = await getFingerprint({
  canvas: true,    // Enable canvas fingerprinting (default: true)
  webgl: true,     // Enable WebGL fingerprinting (default: true)
  audio: true,     // Enable audio fingerprinting (default: true)
  fonts: true,     // Enable font detection (default: true)
  timeout: 1000,   // Timeout for async collectors in ms (default: 1000)
});
```

## Collected Signals

The library collects 25+ browser signals across these categories:

- **Screen**: resolution, color depth, pixel ratio
- **Platform**: OS, browser, CPU cores, device memory, touch support
- **Locale**: timezone, language, languages list
- **Storage**: sessionStorage, localStorage, indexedDB availability
- **Canvas**: rendered canvas fingerprint hash
- **WebGL**: GPU vendor and renderer
- **Audio**: AudioContext fingerprint
- **Fonts**: detected system fonts hash

## License

MIT
