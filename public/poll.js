// SEO E06: one-question segment poll, shown once per browser after the first completed round.
// Sends GA4 `poll_answer` { answer }. Listens for the `typpy:round_complete` event fired by the games' track().
(function () {
  var KEY = 'typpy_poll';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }
  var OPTIONS = [['practice', 'Practise typing'], ['vocab', 'Learn vocabulary'], ['relax', 'Relax'], ['class', 'Class or school']];
  function done(val) { try { localStorage.setItem(KEY, val); } catch (e) {} }
  function show() {
    if (document.getElementById('typpy-poll')) return;
    var box = document.createElement('div');
    box.id = 'typpy-poll';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Quick question');
    box.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483000;max-width:min(320px,calc(100vw - 32px));background:#fff;color:#2a2118;border:1px solid #d9cdbd;border-radius:14px;padding:14px 16px;box-shadow:0 8px 28px rgba(0,0,0,.18);font:500 14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;';
    var q = document.createElement('div');
    q.textContent = 'Quick question: what brings you here?';
    q.style.cssText = 'font-weight:700;margin:0 24px 10px 0';
    box.appendChild(q);
    var x = document.createElement('button');
    x.textContent = '×'; x.setAttribute('aria-label', 'Dismiss');
    x.style.cssText = 'position:absolute;top:6px;right:8px;border:0;background:none;font-size:20px;line-height:1;cursor:pointer;color:#8a7a66';
    x.onclick = function () { done('skipped'); box.remove(); };
    box.appendChild(x);
    OPTIONS.forEach(function (o) {
      var b = document.createElement('button');
      b.textContent = o[1];
      b.style.cssText = 'margin:0 6px 6px 0;padding:6px 12px;border-radius:999px;border:1px solid #d9cdbd;background:#faf6ef;color:inherit;font:inherit;cursor:pointer';
      b.onclick = function () {
        try { if (window.gtag) window.gtag('event', 'poll_answer', { answer: o[0] }); } catch (e) {}
        done(o[0]);
        box.textContent = 'Thanks!';
        setTimeout(function () { box.remove(); }, 1500);
      };
      box.appendChild(b);
    });
    document.body.appendChild(box);
  }
  window.addEventListener('typpy:round_complete', function () { setTimeout(show, 1500); }, { once: true });
})();
