export function enterMobileFullscreen(element = document.documentElement) {
  if (!matchMedia('(pointer: coarse)').matches || document.fullscreenElement
    || document.webkitFullscreenElement || navigator.standalone) return;
  const request = element.requestFullscreen || element.webkitRequestFullscreen;
  if (request) {
    try { Promise.resolve(request.call(element)).catch(() => {}); } catch { /* Unsupported browser. */ }
  }
}
