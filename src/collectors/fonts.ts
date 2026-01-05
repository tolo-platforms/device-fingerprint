import { hash } from "../hash";

/**
 * Detect installed fonts by measuring text rendering differences
 */
export function collectFontsFingerprint(): string | null {
  try {
    // Common fonts to test for
    const testFonts = [
      "Arial",
      "Arial Black",
      "Comic Sans MS",
      "Courier New",
      "Georgia",
      "Impact",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
      "Helvetica",
      "Monaco",
      "Menlo",
      "Consolas",
      "Lucida Console",
      "Tahoma",
      "Palatino",
      "Century Gothic",
      "Bookman Old Style",
      "Garamond",
      "MS Gothic",
      "MS PGothic",
      "MS Mincho",
    ];

    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Get baseline widths for base fonts
    const baseWidths: Record<string, number> = {};
    for (const baseFont of baseFonts) {
      ctx.font = `${testSize} ${baseFont}`;
      baseWidths[baseFont] = ctx.measureText(testString).width;
    }

    // Test each font
    const detectedFonts: string[] = [];
    for (const font of testFonts) {
      let detected = false;
      for (const baseFont of baseFonts) {
        ctx.font = `${testSize} '${font}', ${baseFont}`;
        const width = ctx.measureText(testString).width;
        if (width !== baseWidths[baseFont]) {
          detected = true;
          break;
        }
      }
      if (detected) {
        detectedFonts.push(font);
      }
    }

    return hash(detectedFonts.join(","));
  } catch {
    return null;
  }
}
