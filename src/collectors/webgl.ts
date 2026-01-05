/**
 * Collect WebGL fingerprint signals
 */
export function collectWebGLSignals(): { vendor: string | null; renderer: string | null } {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      return { vendor: null, renderer: null };
    }

    const webgl = gl as WebGLRenderingContext;
    const debugInfo = webgl.getExtension("WEBGL_debug_renderer_info");

    if (!debugInfo) {
      return {
        vendor: webgl.getParameter(webgl.VENDOR),
        renderer: webgl.getParameter(webgl.RENDERER),
      };
    }

    return {
      vendor: webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    };
  } catch {
    return { vendor: null, renderer: null };
  }
}
