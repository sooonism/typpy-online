// GA4 event helper shared by the games. Tidy pages carry their own copy (they don't use Layout).
export function track(game, name, params = {}) {
  try { if (window.gtag) window.gtag('event', name, { game, language: 'en', ...params }); } catch (e) {}
  if (name === 'round_complete') window.dispatchEvent(new Event('typpy:round_complete'));
}
