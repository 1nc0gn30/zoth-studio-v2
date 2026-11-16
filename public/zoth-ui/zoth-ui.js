/* ==========================================================================
   Zoth UI Kit (zoth-ui.js) — Zero-Dependency Declarative UI Engine
   Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
   Reads window.ZOTH_APP and hydrates support bar, header, live canvas band,
   copy/download buttons, tabs, quickstart tutorial modal, and footer.
   ========================================================================== */
(function () {
  'use strict';

  var STRIPE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  var SOLANA_ADDR = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
  var THEME_KEY = 'zoth-ui-theme';

  var BAYER8 = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21,
  ];

  var DOT_BITS = [
    [0, 0, 0x01], [0, 1, 0x02], [0, 2, 0x04], [0, 3, 0x40],
    [1, 0, 0x08], [1, 1, 0x10], [1, 2, 0x20], [1, 3, 0x80],
  ];

  var VARIANTS = ['braille-orbit', 'bayer-field', 'scanline-grid', 'particle-orbit', 'hex-lattice', 'waveform-harmonics'];

  function hashSeed(input) {
    var s = String(input || 'zoth');
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getSavedTheme(defaultTheme) {
    try {
      var saved = window.localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}
    return defaultTheme === 'light' ? 'light' : 'dark';
  }

  function applyTheme(themeName) {
    var t = themeName === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    try {
      window.localStorage.setItem(THEME_KEY, t);
    } catch (_) {}
    var toggleBtn = document.getElementById('zoth-theme-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = t === 'dark' ? '☀ Light' : '☾ Dark';
    }
    return t;
  }

  function copyText(text, onDone) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      if (onDone) onDone(false);
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () { if (onDone) onDone(true); },
      function () { if (onDone) onDone(false); }
    );
  }

  function mountSupportBar(el, cfg) {
    if (!el) return;
    var label = (cfg && cfg.supportLabel) || '✦ 100% FREE & OPEN ACCESS · ZERO PAYWALLS';
    el.innerHTML =
      '<div class="zoth-support-bar">' +
        '<span class="zoth-support-label">' + escapeHtml(label) + '</span>' +
        '<div class="zoth-support-actions">' +
          '<a class="zoth-btn zoth-btn-primary" href="' + STRIPE_URL + '" target="_blank" rel="noopener noreferrer">☕ Buy Us a Coffee</a>' +
          '<button type="button" class="zoth-btn zoth-btn-outline" id="zoth-sol-tip-btn">◎ Solana Tip (GG2e...dXoK)</button>' +
        '</div>' +
      '</div>';

    var solBtn = document.getElementById('zoth-sol-tip-btn');
    if (solBtn) {
      solBtn.addEventListener('click', function () {
        copyText(SOLANA_ADDR, function (ok) {
          if (!ok) return;
          var prev = solBtn.textContent;
          solBtn.textContent = '✓ Copied GG2e...dXoK';
          setTimeout(function () { solBtn.textContent = prev; }, 1800);
        });
      });
    }
  }

  function mountHeader(el, cfg) {
    if (!el) return;
    var c = cfg || {};
    var title = c.name || 'Zoth Tool';
    var version = c.version || 'v1.0.0';
    var glyph = c.glyph || '☿';
    var tagline = c.tagline || 'Zero-egress local-first utility';
    var statusText = c.statusText || 'ONLINE · LOCAL-FIRST';
    var hasTutorial = Array.isArray(c.tutorialSteps) && c.tutorialSteps.length > 0;
    var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    el.innerHTML =
      '<header class="zoth-header">' +
        '<div class="zoth-brand-wrap">' +
          '<div class="zoth-brand-glyph" aria-hidden="true">' + escapeHtml(glyph) + '</div>' +
          '<div>' +
            '<h1 class="zoth-title">' +
              '<span>' + escapeHtml(title) + '</span>' +
              '<span class="zoth-badge">' + escapeHtml(version) + '</span>' +
            '</h1>' +
            '<p class="zoth-subtitle">' + escapeHtml(tagline) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="zoth-header-controls">' +
          '<span class="zoth-badge zoth-badge-live"><span class="zoth-status-dot"></span>' + escapeHtml(statusText) + '</span>' +
          (hasTutorial ? '<button type="button" class="zoth-btn zoth-btn-outline" id="zoth-quickstart-btn">? Quickstart</button>' : '') +
          '<button type="button" class="zoth-btn zoth-btn-outline" id="zoth-theme-toggle">' + (currentTheme === 'dark' ? '☀ Light' : '☾ Dark') + '</button>' +
        '</div>' +
      '</header>';

    var themeBtn = document.getElementById('zoth-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(now);
      });
    }

    var qsBtn = document.getElementById('zoth-quickstart-btn');
    if (qsBtn && hasTutorial) {
      qsBtn.addEventListener('click', function () {
        openTutorial(c);
      });
    }
  }

  function mountFooter(el, cfg) {
    if (!el) return;
    var c = cfg || {};
    var repo = c.repo || c.id || 'zoth-studio-v2';
    var githubUrl = c.githubUrl || ('https://github.com/1nc0gn30/' + encodeURIComponent(repo));
    el.innerHTML =
      '<footer class="zoth-footer">' +
        '<span>Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform</span>' +
        '<span>' +
          '<a href="' + escapeHtml(githubUrl) + '" target="_blank" rel="noopener noreferrer">GitHub Repo</a>' +
          ' · ' +
          '<a href="https://nullai.tech" target="_blank" rel="noopener noreferrer">nullai.tech</a>' +
        '</span>' +
      '</footer>';
  }

  function openTutorial(cfg) {
    var existing = document.getElementById('zoth-tutorial-backdrop');
    if (existing) existing.remove();

    var steps = (cfg && cfg.tutorialSteps) || [];
    var stepsHtml = steps.map(function (s, idx) {
      return (
        '<div style="border:1px solid var(--zoth-border-subtle); border-radius:8px; padding:0.75rem 0.9rem; margin-bottom:0.65rem; background:var(--zoth-surface-2);">' +
          '<div style="font-family:var(--zoth-font-mono); font-size:0.78rem; font-weight:800; color:var(--zoth-accent);">' +
            escapeHtml((s.icon || '◆') + ' Step ' + (idx + 1) + ': ' + (s.title || '')) +
          '</div>' +
          '<p style="margin:0.35rem 0 0; font-size:0.84rem; color:var(--zoth-slate);">' + escapeHtml(s.desc || '') + '</p>' +
        '</div>'
      );
    }).join('');

    var wrap = document.createElement('div');
    wrap.id = 'zoth-tutorial-backdrop';
    wrap.className = 'zoth-modal-backdrop is-open';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML =
      '<div class="zoth-modal">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">' +
          '<h2 style="margin:0; font-family:var(--zoth-font-display); font-weight:400; font-size:1.35rem;">' + escapeHtml((cfg && cfg.name) || 'Quickstart Guide') + '</h2>' +
          '<button type="button" class="zoth-btn zoth-btn-outline" id="zoth-tutorial-close">✕ Close</button>' +
        '</div>' +
        '<pre class="zoth-modal-wave" id="zoth-modal-wave"></pre>' +
        '<div>' + stepsHtml + '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    var tick = 0;
    var waveEl = document.getElementById('zoth-modal-wave');
    function drawWave() {
      if (!waveEl) return;
      tick += 0.16;
      var out = '';
      for (var y = 0; y < 6; y += 1) {
        for (var x = 0; x < 34; x += 1) {
          var mask = 0;
          for (var d = 0; d < 8; d += 1) {
            var px = x * 2 + DOT_BITS[d][0];
            var py = y * 4 + DOT_BITS[d][1];
            if (Math.sin(px * 0.2 + tick) * Math.cos(py * 0.35 + tick) > 0.08) {
              mask |= DOT_BITS[d][2];
            }
          }
          out += String.fromCharCode(0x2800 | mask);
        }
        out += '\n';
      }
      waveEl.textContent = out;
    }
    drawWave();
    var timer = window.setInterval(drawWave, 65);

    function close() {
      window.clearInterval(timer);
      wrap.remove();
    }
    document.getElementById('zoth-tutorial-close').addEventListener('click', close);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) close();
    });
  }

  function attachBand(canvas, opts) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var seedStr = (opts && opts.seed) || canvas.dataset.zothBand || 'zoth-band';
    var seedNum = hashSeed(seedStr);
    var variant = (opts && opts.variant) || canvas.dataset.zothVariant || VARIANTS[seedNum % VARIANTS.length];
    var accent = (opts && opts.accent) || canvas.dataset.zothAccent || '#D4AF37';
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var readoutEl = canvas.parentElement && canvas.parentElement.querySelector('.zoth-band-readout');

    var running = true;
    var inView = true;
    var rafId = 0;
    var t = 0;
    var lastTs = 0;
    var minStep = 1000 / 24;

    function drawFrame(time) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 640;
      var h = canvas.clientHeight || 132;
      if (w <= 0 || h <= 0) return;

      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#05060B';
      ctx.fillRect(0, 0, w, h);

      if (variant === 'bayer-field') {
        var step = 6;
        for (var y = 0; y < h; y += step) {
          for (var x = 0; x < w; x += step) {
            var v = 0.5 + 0.5 * Math.sin(x * 0.025 + time * 1.1) * Math.cos(y * 0.04 - time * 0.8);
            var th = BAYER8[(((y / step) & 7) << 3) | ((x / step) & 7)] / 64;
            if (v > th) {
              ctx.fillStyle = v > 0.72 ? accent : 'rgba(56, 189, 248, 0.35)';
              ctx.fillRect(x, y, step - 1, step - 1);
            }
          }
        }
      } else if (variant === 'scanline-grid') {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.14)';
        ctx.lineWidth = 1;
        for (var gx = 0; gx < w; gx += 28) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, h);
          ctx.stroke();
        }
        var sweepY = ((time * 38) % (h + 24)) - 12;
        var grad = ctx.createLinearGradient(0, sweepY - 14, 0, sweepY + 14);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, accent);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, sweepY - 14, w, 28);
      } else if (variant === 'particle-orbit') {
        var cx = w / 2;
        var cy = h / 2;
        for (var i = 0; i < 42; i += 1) {
          var a = time * (0.4 + (i % 5) * 0.12) + i * 0.618;
          var rx = (w * 0.14) + ((i * 19 + (seedNum & 31)) % Math.max(40, w * 0.34));
          var ry = (h * 0.18) + ((i * 7) % Math.max(20, h * 0.3));
          var px = cx + Math.cos(a) * rx;
          var py = cy + Math.sin(a) * ry;
          ctx.fillStyle = i % 4 === 0 ? accent : 'rgba(52, 211, 153, 0.65)';
          ctx.fillRect(px, py, 2.2, 2.2);
        }
      } else if (variant === 'hex-lattice') {
        var radius = 16;
        var dx = radius * 1.732;
        var dy = radius * 1.5;
        ctx.lineWidth = 1;
        for (var hr = 0; hr * dy < h + dy; hr += 1) {
          var oxHex = (hr & 1) ? dx / 2 : 0;
          for (var hc = 0; hc * dx < w + dx; hc += 1) {
            var hx = hc * dx + oxHex;
            var hy = hr * dy;
            var dHex = Math.hypot(hx - w / 2, hy - h / 2);
            var pulse = 0.5 + 0.5 * Math.sin(dHex * 0.05 - time * 1.8 + (seedNum & 15));
            ctx.strokeStyle = pulse > 0.65 ? accent : 'rgba(56, 189, 248, 0.22)';
            ctx.beginPath();
            for (var s = 0; s < 6; s += 1) {
              var ang = (Math.PI / 3) * s + Math.PI / 6;
              var vx = hx + Math.cos(ang) * (radius - 1);
              var vy = hy + Math.sin(ang) * (radius - 1);
              if (s === 0) ctx.moveTo(vx, vy);
              else ctx.lineTo(vx, vy);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
      } else if (variant === 'waveform-harmonics') {
        var midY = h / 2;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();
        var waveCols = [accent, '#38BDF8', '#34D399'];
        for (var hi = 1; hi <= 3; hi += 1) {
          ctx.strokeStyle = waveCols[hi - 1];
          ctx.lineWidth = hi === 1 ? 1.8 : 1.1;
          ctx.beginPath();
          for (var wx = 0; wx <= w; wx += 4) {
            var env = Math.sin((wx / Math.max(1, w)) * Math.PI);
            var wy = midY + Math.sin(wx * 0.014 * hi + time * (1 + hi * 0.4)) * (h * 0.34 / hi) * (0.35 + 0.65 * env);
            if (wx === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }
      } else {
        // Default: braille-orbit
        var cols = Math.floor(w / 9);
        var rows = Math.floor(h / 12);
        var ox = w / 2;
        var oy = h / 2;
        var R = Math.max(16, h * 0.44);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textBaseline = 'top';
        for (var r = 0; r < rows; r += 1) {
          for (var c = 0; c < cols; c += 1) {
            var sx = c * 9 + 4;
            var sy = r * 12 + 4;
            var dx = (sx - ox) / R;
            var dy = (sy - oy) / R;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var wave = Math.sin(dist * 7 - time * 2.2 + Math.atan2(dy, dx) * 2);
            if (wave > 0.25 && dist < 4.5) {
              var mask = (wave > 0.7 ? 0xff : 0x55) & ((c + r + Math.floor(time * 6)) & 1 ? 0xd7 : 0xeb);
              ctx.fillStyle = dist < 1.1 ? accent : 'rgba(56, 189, 248, 0.6)';
              ctx.fillText(String.fromCharCode(0x2800 | (mask || 0x15)), c * 9, r * 12);
            }
          }
        }
      }
      ctx.restore();
    }

    if (readoutEl) {
      readoutEl.textContent = variant.toUpperCase() + (reduced ? ' · STATIC' : ' · 24 FPS');
    }

    drawFrame(0);
    if (reduced) {
      return { destroy: function () {} };
    }

    var io = null;
    if (typeof window.IntersectionObserver === 'function') {
      io = new window.IntersectionObserver(function (entries) {
        inView = entries[0] ? entries[0].isIntersecting : true;
      });
      io.observe(canvas);
    }

    function loop(ts) {
      if (!running) return;
      if (inView && ts - lastTs >= minStep) {
        lastTs = ts;
        t += 0.032;
        drawFrame(t);
      }
      rafId = window.requestAnimationFrame(loop);
    }
    rafId = window.requestAnimationFrame(loop);

    return {
      destroy: function () {
        running = false;
        window.cancelAnimationFrame(rafId);
        if (io) io.disconnect();
      },
    };
  }

  function wireActions(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-zoth-copy]').forEach(function (btn) {
      if (btn.__zothBound) return;
      btn.__zothBound = true;
      btn.addEventListener('click', function () {
        var sel = btn.getAttribute('data-zoth-copy');
        var target = sel ? document.querySelector(sel) : null;
        var val = target ? ('value' in target ? target.value : target.textContent) : '';
        copyText(val, function (ok) {
          if (!ok) return;
          var prev = btn.textContent;
          btn.textContent = '✓ Copied';
          setTimeout(function () { btn.textContent = prev; }, 1600);
        });
      });
    });

    scope.querySelectorAll('[data-zoth-download]').forEach(function (btn) {
      if (btn.__zothBound) return;
      btn.__zothBound = true;
      btn.addEventListener('click', function () {
        var sel = btn.getAttribute('data-zoth-download');
        var filename = btn.getAttribute('data-zoth-filename') || 'zoth-export.txt';
        var target = sel ? document.querySelector(sel) : null;
        var val = target ? ('value' in target ? target.value : target.textContent) : '';
        var blob = new Blob([val], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 500);
      });
    });

    scope.querySelectorAll('[data-zoth-tab-group]').forEach(function (group) {
      if (group.__zothBound) return;
      group.__zothBound = true;
      var groupId = group.getAttribute('data-zoth-tab-group');
      var tabs = group.querySelectorAll('[data-zoth-tab]');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var key = tab.getAttribute('data-zoth-tab');
          tabs.forEach(function (t) {
            t.classList.toggle('is-active', t === tab);
          });
          document.querySelectorAll('[data-zoth-panel-group="' + groupId + '"] [data-zoth-panel]').forEach(function (p) {
            p.style.display = p.getAttribute('data-zoth-panel') === key ? '' : 'none';
          });
        });
      });
    });
  }

  function renderGauge(el) {
    if (!el) return;
    var val = parseFloat(el.getAttribute('data-value') || '0');
    var min = parseFloat(el.getAttribute('data-min') || '0');
    var max = parseFloat(el.getAttribute('data-max') || '100');
    var label = el.getAttribute('data-label') || 'SCORE';
    var unit = el.getAttribute('data-unit') || '';
    var status = el.getAttribute('data-status') || '';
    var span = Math.max(1e-6, max - min);
    var ratio = Math.min(1, Math.max(0, (val - min) / span));

    var color = el.getAttribute('data-accent') ||
      (ratio >= 0.85 ? '#EF4444' : ratio >= 0.65 ? '#F59E0B' : '#34D399');
    var r = 46;
    var c = 2 * Math.PI * r;
    var arcLen = c * (240 / 360);
    var fillLen = arcLen * ratio;

    el.innerHTML =
      '<div style="position:relative;width:136px;height:118px;margin:0 auto;">' +
        '<svg viewBox="0 0 120 106" width="136" height="118" role="img" aria-label="' + escapeHtml(label + ' ' + val + unit) + '">' +
          '<g transform="translate(60,60) rotate(150)">' +
            '<circle r="' + r + '" cx="0" cy="0" fill="none" stroke="rgba(148,163,184,0.22)" stroke-width="9" stroke-dasharray="' + arcLen.toFixed(1) + ' ' + c.toFixed(1) + '" stroke-linecap="round"/>' +
            '<circle r="' + r + '" cx="0" cy="0" fill="none" stroke="' + escapeHtml(color) + '" stroke-width="9" stroke-dasharray="' + fillLen.toFixed(1) + ' ' + c.toFixed(1) + '" stroke-linecap="round"/>' +
          '</g>' +
        '</svg>' +
        '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:10px;">' +
          '<div style="font-size:1.45rem;font-weight:800;line-height:1;">' + escapeHtml((Number.isInteger(val) ? val : val.toFixed(1)) + unit) + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:2px;font-family:var(--zoth-font-mono);font-size:0.66rem;font-weight:700;letter-spacing:0.14em;color:var(--zoth-slate);text-transform:uppercase;">' + escapeHtml(label) + '</div>' +
      (status ? '<span class="zoth-badge" style="color:' + escapeHtml(color) + ';border-color:' + escapeHtml(color) + ';">' + escapeHtml(status) + '</span>' : '');
  }

  function renderSparkline(el) {
    if (!el) return;
    var rawPts = (el.getAttribute('data-points') || '12,18,16,24,22,31,29').split(',').map(function (n) {
      return parseFloat(n.trim());
    }).filter(function (n) { return !isNaN(n); });
    if (rawPts.length < 2) rawPts = [0, rawPts[0] || 0];

    var label = el.getAttribute('data-label') || 'TELEMETRY';
    var unit = el.getAttribute('data-unit') || '';
    var thresholdAttr = el.getAttribute('data-threshold');
    var threshold = thresholdAttr !== null && thresholdAttr !== '' ? parseFloat(thresholdAttr) : null;
    var accent = el.getAttribute('data-accent') || '#38BDF8';

    var allVals = threshold !== null && !isNaN(threshold) ? rawPts.concat([threshold]) : rawPts;
    var minV = Math.min.apply(null, allVals);
    var maxV = Math.max.apply(null, allVals);
    var range = Math.max(1e-6, maxV - minV);

    var W = 260;
    var H = 82;
    var px = 5;
    var py = 8;
    var coords = rawPts.map(function (v, idx) {
      var x = px + (idx / Math.max(1, rawPts.length - 1)) * (W - px * 2);
      var y = H - py - ((v - minV) / range) * (H - py * 2);
      return [x, y];
    });
    var poly = coords.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var area = px + ',' + (H - 2) + ' ' + poly + ' ' + (W - px) + ',' + (H - 2);
    var last = coords[coords.length - 1];
    var latest = rawPts[rawPts.length - 1];
    var threshLine = '';
    if (threshold !== null && !isNaN(threshold)) {
      var ty = H - py - ((threshold - minV) / range) * (H - py * 2);
      threshLine = '<line x1="' + px + '" y1="' + ty.toFixed(1) + '" x2="' + (W - px) + '" y2="' + ty.toFixed(1) + '" stroke="#EF4444" stroke-width="1.2" stroke-dasharray="4 4"/>';
    }

    el.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;width:100%;">' +
        '<span style="font-family:var(--zoth-font-mono);font-size:0.68rem;font-weight:700;letter-spacing:0.14em;color:var(--zoth-slate);">' + escapeHtml(label) + '</span>' +
        '<span style="font-weight:800;font-size:1.1rem;color:' + escapeHtml(accent) + ';">' + escapeHtml(String(latest) + unit) + '</span>' +
      '</div>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" width="100%" height="84" role="img" aria-label="' + escapeHtml(label) + '">' +
        threshLine +
        '<polygon points="' + area + '" fill="' + escapeHtml(accent) + '" fill-opacity="0.16"/>' +
        '<polyline fill="none" stroke="' + escapeHtml(accent) + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="' + poly + '"/>' +
        '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="3.4" fill="' + escapeHtml(accent) + '"/>' +
      '</svg>' +
      '<div style="display:flex;justify-content:space-between;width:100%;font-family:var(--zoth-font-mono);font-size:0.64rem;color:var(--zoth-slate-dim);">' +
        '<span>MIN ' + minV.toFixed(1) + escapeHtml(unit) + '</span>' +
        '<span>' + rawPts.length + ' SAMPLES</span>' +
        '<span>MAX ' + maxV.toFixed(1) + escapeHtml(unit) + '</span>' +
      '</div>';
  }

  function wirePresets(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-zoth-preset-target]').forEach(function (btn) {
      if (btn.__zothPresetBound) return;
      btn.__zothPresetBound = true;
      btn.addEventListener('click', function () {
        var sel = btn.getAttribute('data-zoth-preset-target');
        var val = btn.getAttribute('data-zoth-preset-value') || '';
        var target = sel ? document.querySelector(sel) : null;
        if (!target) return;
        if ('value' in target) target.value = val;
        else target.textContent = val;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        var group = btn.closest('.zoth-preset-bar');
        if (group) {
          group.querySelectorAll('[data-zoth-preset-target]').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
        }
      });
    });

    scope.querySelectorAll('[data-zoth-file-target]').forEach(function (btn) {
      if (btn.__zothFileBound) return;
      btn.__zothFileBound = true;
      var input = document.createElement('input');
      input.type = 'file';
      input.hidden = true;
      btn.insertAdjacentElement('afterend', input);
      btn.addEventListener('click', function () { input.click(); });
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var sel = btn.getAttribute('data-zoth-file-target');
          var target = sel ? document.querySelector(sel) : null;
          if (!target) return;
          var txt = typeof reader.result === 'string' ? reader.result : '';
          if ('value' in target) target.value = txt;
          else target.textContent = txt;
          target.dispatchEvent(new Event('input', { bubbles: true }));
        };
        reader.readAsText(file);
        input.value = '';
      });
    });
  }

  function wireTables(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-zoth-table-search]').forEach(function (inp) {
      if (inp.__zothTableBound) return;
      inp.__zothTableBound = true;
      inp.addEventListener('input', function () {
        var sel = inp.getAttribute('data-zoth-table-search');
        var table = sel ? document.querySelector(sel) : null;
        if (!table) return;
        var q = (inp.value || '').trim().toLowerCase();
        table.querySelectorAll('tbody tr').forEach(function (tr) {
          var text = (tr.textContent || '').toLowerCase();
          tr.style.display = !q || text.indexOf(q) !== -1 ? '' : 'none';
        });
      });
    });

    scope.querySelectorAll('[data-zoth-table-csv]').forEach(function (btn) {
      if (btn.__zothCsvBound) return;
      btn.__zothCsvBound = true;
      btn.addEventListener('click', function () {
        var sel = btn.getAttribute('data-zoth-table-csv');
        var filename = btn.getAttribute('data-zoth-filename') || 'zoth-table.csv';
        var table = sel ? document.querySelector(sel) : null;
        if (!table) return;
        var lines = [];
        table.querySelectorAll('tr').forEach(function (tr) {
          if (tr.style.display === 'none') return;
          var cols = [];
          tr.querySelectorAll('th,td').forEach(function (cell) {
            cols.push('"' + (cell.textContent || '').trim().replace(/"/g, '""') + '"');
          });
          if (cols.length) lines.push(cols.join(','));
        });
        var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 500);
      });
    });
  }

  function renderDiff(el) {
    if (!el) return;
    var beforeEl = el.querySelector('[data-diff-before]');
    var afterEl = el.querySelector('[data-diff-after]');
    var beforeTxt = el.getAttribute('data-before') || (beforeEl ? beforeEl.textContent : '') || '';
    var afterTxt = el.getAttribute('data-after') || (afterEl ? afterEl.textContent : '') || '';
    var title = el.getAttribute('data-title') || 'ARTIFACT DIFF';

    var a = String(beforeTxt).replace(/^\n+|\n+$/g, '').split('\n');
    var b = String(afterTxt).replace(/^\n+|\n+$/g, '').split('\n');
    var max = Math.max(a.length, b.length);
    var leftHtml = '';
    var rightHtml = '';
    var added = 0;
    var removed = 0;

    for (var i = 0; i < max; i += 1) {
      var la = i < a.length ? a[i] : null;
      var lb = i < b.length ? b[i] : null;
      var same = la === lb;
      if (!same && la !== null) removed += 1;
      if (!same && lb !== null) added += 1;
      if (la !== null) {
        leftHtml += '<div class="zoth-diff-line ' + (same ? '' : 'zoth-diff-del') + '"><span>' + (i + 1) + '</span><span>' + (same ? ' ' : '-') + '</span><span>' + escapeHtml(la || ' ') + '</span></div>';
      }
      if (lb !== null) {
        rightHtml += '<div class="zoth-diff-line ' + (same ? '' : 'zoth-diff-add') + '"><span>' + (i + 1) + '</span><span>' + (same ? ' ' : '+') + '</span><span>' + escapeHtml(lb || ' ') + '</span></div>';
      }
    }

    el.innerHTML =
      '<div class="zoth-diff-head">' +
        '<strong>' + escapeHtml(title) + '</strong>' +
        '<span class="zoth-badge">+' + added + ' / -' + removed + ' LINES</span>' +
      '</div>' +
      '<div class="zoth-diff-grid">' +
        '<div class="zoth-diff-pane">' + leftHtml + '</div>' +
        '<div class="zoth-diff-pane">' + rightHtml + '</div>' +
      '</div>';
  }

  function wireSteppers(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-zoth-stepper]').forEach(function (stepper) {
      if (stepper.__zothStepperBound) return;
      stepper.__zothStepperBound = true;
      var btns = stepper.querySelectorAll('[data-zoth-step-btn]');
      var panels = stepper.querySelectorAll('[data-zoth-step-panel]');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-zoth-step-btn');
          btns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
          panels.forEach(function (p) {
            p.classList.toggle('is-active', p.getAttribute('data-zoth-step-panel') === key);
          });
        });
      });
    });
  }

  function renderStatBars(el) {
    if (!el) return;
    var items = [];
    try {
      items = JSON.parse(el.getAttribute('data-items') || '[]');
    } catch (_) {
      items = [];
    }
    if (!Array.isArray(items) || !items.length) return;
    el.innerHTML = items.map(function (it) {
      var base = Number(it.baseline) || 0;
      var cur = Number(it.current) || 0;
      var max = Number(it.max) || Math.max(base, cur, 1);
      var pct = Math.min(100, Math.max(2, Math.round((cur / max) * 100)));
      return (
        '<div class="zoth-stat-row">' +
          '<div class="zoth-stat-meta">' +
            '<span>' + escapeHtml(it.label || '') + '</span>' +
            '<span>' + escapeHtml(String(base) + (it.unit || '') + ' → ' + String(cur) + (it.unit || '')) + '</span>' +
          '</div>' +
          '<div class="zoth-stat-bar-track"><div class="zoth-stat-bar-fill" style="width:' + pct + '%;"></div></div>' +
        '</div>'
      );
    }).join('');
  }

  function renderStatusPill(el) {
    if (!el) return;
    var status = (el.getAttribute('data-status') || 'online').toLowerCase();
    var label = el.getAttribute('data-label') || status.toUpperCase();
    var port = el.getAttribute('data-port');
    var ping = el.getAttribute('data-ping');
    var accent = el.getAttribute('data-accent');

    var col = accent || (status === 'online' ? '#34D399' : status === 'offline' ? '#EF4444' : status === 'syncing' ? '#38BDF8' : '#F59E0B');
    var portHtml = port ? '<span style="font-family:var(--zoth-font-mono);font-size:0.66rem;font-weight:600;opacity:0.8;background:rgba(255,255,255,0.06);padding:2px 5px;border-radius:4px;">:' + escapeHtml(port) + '</span>' : '';
    var pingHtml = ping ? '<span style="font-family:var(--zoth-font-mono);font-size:0.66rem;font-weight:600;opacity:0.8;">' + escapeHtml(ping) + 'ms</span>' : '';

    el.className = (el.className ? el.className + ' ' : '') + 'zoth-status-pill';
    el.style.display = 'inline-flex';
    el.style.alignItems = 'center';
    el.style.gap = '8px';
    el.style.padding = '4px 12px';
    el.style.borderRadius = '999px';
    el.style.border = '1px solid ' + col;
    el.style.background = 'rgba(52, 211, 153, 0.08)';
    el.innerHTML =
      '<span class="zoth-pill-dot" style="width:8px;height:8px;border-radius:50%;background:' + escapeHtml(col) + ';box-shadow:0 0 8px ' + escapeHtml(col) + ';"></span>' +
      '<span style="font-family:var(--zoth-font-mono);font-size:0.72rem;font-weight:700;letter-spacing:0.04em;color:' + escapeHtml(col) + ';">' + escapeHtml(label) + '</span>' +
      portHtml + pingHtml;
  }

  function renderMediaHUD(el) {
    if (!el) return;
    var title = el.getAttribute('data-title') || 'SOVEREIGN AUDIO ENGINE';
    var duration = parseInt(el.getAttribute('data-duration') || '120', 10);
    var accent = el.getAttribute('data-accent') || '#D4AF37';

    var barsCount = 36;
    var barsHtml = '';
    for (var i = 0; i < barsCount; i++) {
      var h = Math.max(15, Math.min(100, Math.round((Math.sin(i * 0.3) * 0.35 + Math.sin(i * 0.7 + 1.2) * 0.35 + 0.55) * 100)));
      var active = i < Math.floor(barsCount * 0.35);
      barsHtml += '<span style="flex:1;height:' + h + '%;background:' + (active ? accent : 'rgba(255,255,255,0.12)') + ';border-radius:2px;"></span>';
    }

    el.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '<span style="font-family:var(--zoth-font-mono);font-size:0.76rem;font-weight:800;color:' + escapeHtml(accent) + ';">' + escapeHtml(title) + '</span>' +
        '<span class="zoth-badge" style="color:#34D399;border-color:#34D399;">PLAYING</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:3px;height:52px;padding:4px 8px;margin-bottom:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;">' +
        barsHtml +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button type="button" class="zoth-btn" style="min-height:38px;padding:0 14px;background:' + escapeHtml(accent) + ';color:#08080B;font-weight:800;">▶ Play</button>' +
          '<span style="font-family:var(--zoth-font-mono);font-size:0.74rem;font-weight:700;">00:42 / 02:00</span>' +
        '</div>' +
        '<span style="font-family:var(--zoth-font-mono);font-size:0.72rem;color:var(--zoth-slate);">1.0x</span>' +
      '</div>';
  }

  function wireLogs(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-zoth-log-filter]').forEach(function (btn) {
      if (btn.__zothLogBound) return;
      btn.__zothLogBound = true;
      btn.addEventListener('click', function () {
        var lv = btn.getAttribute('data-zoth-log-filter') || 'ALL';
        var targetSel = btn.getAttribute('data-zoth-target');
        var box = targetSel ? document.querySelector(targetSel) : btn.closest('.zoth-card');
        var parentBar = btn.parentElement;
        if (parentBar) {
          parentBar.querySelectorAll('[data-zoth-log-filter]').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
        }
        if (!box) return;
        box.querySelectorAll('.zoth-log-row[data-level]').forEach(function (row) {
          var rlv = (row.getAttribute('data-level') || 'INFO').toUpperCase();
          row.style.display = (lv === 'ALL' || rlv === lv) ? '' : 'none';
        });
      });
    });
  }

  function init(config) {
    var cfg = config || window.ZOTH_APP || {};
    applyTheme(getSavedTheme(cfg.theme || 'dark'));
    if (cfg.reality) {
      document.documentElement.setAttribute('data-reality', cfg.reality);
    }
    mountSupportBar(document.getElementById('zoth-support-mount'), cfg);
    mountHeader(document.getElementById('zoth-header-mount'), cfg);
    mountFooter(document.getElementById('zoth-footer-mount'), cfg);
    document.querySelectorAll('canvas[data-zoth-band]').forEach(function (c) {
      attachBand(c, { seed: c.getAttribute('data-zoth-band') || cfg.id, variant: c.getAttribute('data-zoth-variant') });
    });
    document.querySelectorAll('[data-zoth-gauge]').forEach(renderGauge);
    document.querySelectorAll('[data-zoth-sparkline]').forEach(renderSparkline);
    document.querySelectorAll('[data-zoth-diff]').forEach(renderDiff);
    document.querySelectorAll('[data-zoth-stat-bars]').forEach(renderStatBars);
    document.querySelectorAll('[data-zoth-status-pill]').forEach(renderStatusPill);
    document.querySelectorAll('[data-zoth-media-hud]').forEach(renderMediaHUD);
    wireActions(document);
    wirePresets(document);
    wireTables(document);
    wireSteppers(document);
    wireLogs(document);
    return cfg;
  }

  window.ZothUI = {
    init: init,
    applyTheme: applyTheme,
    mountSupportBar: mountSupportBar,
    mountHeader: mountHeader,
    mountFooter: mountFooter,
    attachBand: attachBand,
    renderGauge: renderGauge,
    renderSparkline: renderSparkline,
    renderDiff: renderDiff,
    renderStatBars: renderStatBars,
    renderStatusPill: renderStatusPill,
    renderMediaHUD: renderMediaHUD,
    openTutorial: openTutorial,
    wireActions: wireActions,
    wirePresets: wirePresets,
    wireTables: wireTables,
    wireSteppers: wireSteppers,
    wireLogs: wireLogs,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (window.ZOTH_APP) init(window.ZOTH_APP);
    });
  } else if (window.ZOTH_APP) {
    init(window.ZOTH_APP);
  }
})();
