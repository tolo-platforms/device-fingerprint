import { hash } from "../hash";

/**
 * Generate an audio fingerprint using AudioContext
 * Different devices produce slightly different audio processing results
 */
export async function collectAudioFingerprint(timeout: number = 1000): Promise<string | null> {
  try {
    const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return null;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const compressor = context.createDynamicsCompressor();

    // Configure nodes
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    gain.gain.setValueAtTime(0, context.currentTime); // Mute output

    // Connect: oscillator -> compressor -> analyser -> gain -> destination
    oscillator.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(gain);
    gain.connect(context.destination);

    oscillator.start(0);

    // Wait for audio to process
    await new Promise((resolve) => setTimeout(resolve, Math.min(timeout, 500)));

    const frequencyData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(frequencyData);

    oscillator.stop();
    await context.close();

    // Hash the frequency data
    const dataString = frequencyData.slice(0, 30).join(",");
    return hash(dataString);
  } catch {
    return null;
  }
}
