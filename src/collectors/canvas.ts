import { hash } from "../hash";

/**
 * Generate a canvas fingerprint
 * Draws text and shapes, then hashes the resulting image data
 */
export function collectCanvasFingerprint(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = 200;
    canvas.height = 50;

    // Background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text with various styles
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#069";
    ctx.font = "14px 'Arial'";
    ctx.fillText("Tolo Fingerprint 🔐", 2, 15);

    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.font = "18px 'Times New Roman'";
    ctx.fillText("Canvas Test", 4, 35);

    // Geometric shapes
    ctx.beginPath();
    ctx.arc(50, 25, 10, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fill();

    // Gradient
    const gradient = ctx.createLinearGradient(100, 0, 200, 0);
    gradient.addColorStop(0, "blue");
    gradient.addColorStop(1, "green");
    ctx.fillStyle = gradient;
    ctx.fillRect(100, 10, 75, 30);

    // Get image data and hash it
    const imageData = canvas.toDataURL("image/png");
    return hash(imageData);
  } catch {
    return null;
  }
}
