/* ============================================================
   FUNGSI KHUSUS: DOA EQURAN.ID
   Dipanggil oleh HTML dengan: bukaDoaEQuran();
   ============================================================ */
window.bukaDoaEQuran = function () {
    var API = "https://equran.id/api/doa";
    var AUDIO = null;
    var au = new Audio(), ttsOn = null;
    var app = document.getElementById("app");
    var st = { all: [], grup: "", q: "", open: {}, shown: 20 };

    // --- CSS Internal (Ditempel otomatis) ---
    var css = document.createElement("style");
    css.textContent =
      "@font-face{font-family:Arab1;src:url('https://teamkeringat.github.io/Files/arbutsman.otf') format('opentype');font-display:swap}" +
      "@font-face{font-family:Arab2;src:url('https://teamkeringat.github.io/Files/arbmisbah.ttf') format('truetype');font-display:swap}" +
      "@font-face{font-family:Arab3;src:url('https://teamkeringat.github.io/Files/arbquran.ttf') format('truetype');font-display:swap}" +
      "@font-face{font-family:Arab4;src:url('https://teamkeringat.github.io/Files/arbnaskh.otf') format('opentype');font-display:swap}" +
      "html,body{background:#18241a;color:#e6ecdc;color-scheme:dark}body{padding:10px}*{box-sizing:border-box}" +
      "html.ng-light,html.ng-light body{background:#fffdf4;color:#222;color-scheme:light}" +
      ".bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}" +
      "input,select,button{font:inherit;color:#e6ecdc;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);border-radius:10px;padding:9px 10px}" +
      "html.ng-light input,html.ng-light select,html.ng-light button{color:#222;background:rgba(0,0,0,.05);border-color:#d8cfa8}" +
      "input{flex:1;min-width:150px}select{flex:1;min-width:140px}select option{color:#222}button{cursor:pointer}" +
      ".dd{background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12);border-radius:12px;margin-bottom:8px;overflow:hidden}" +
      "html.ng-light .dd{background:#fff;border-color:#d8cfa8}" +
      ".hd{display:flex;align-items:center;gap:10px;padding:12px;cursor:pointer}" +
      ".no{flex:0 0 auto;min-width:32px;text-align:center;background:#c9b86a;color:#1b2414;font-weight:700;border-radius:999px;padding:2px 8px;font-size:.8rem}" +
      ".nm{flex:1;font-weight:600;line-height:1.35}.gp{font-size:.75rem;opacity:.7;font-weight:400}" +
      ".ch{opacity:.7;transition:transform .2s}.dd.on .ch{transform:rotate(90deg)}" +
      ".bd{display:none;padding:0 12px 12px}.dd.on .bd{display:block}" +
      ".ar{direction:rtl;text-align:right;font-family:var(--arab,Arab1,'Amiri','Traditional Arabic',serif);font-size:calc(1.75rem * var(--z,1));line-height:2.3;color:#eef2e6;white-space:pre-wrap}" +
      "html.ng-light .ar{color:#222}" +
      ".lt{color:#c9bd8a;font-size:calc(.9rem * var(--z,1));font-style:italic;margin:6px 0;line-height:1.5;white-space:pre-wrap}" +
      "html.ng-light .lt{color:#6b5a1a}" +
      ".tr{font-size:calc(1rem * var(--z,1));line-height:1.55;white-space:pre-wrap}.tn{margin-top:8px;font-size:calc(.8rem * var(--z,1));opacity:.7;line-height:1.45;white-space:pre-wrap}" +
      "html.ng-arab .lt,html.ng-arab .tr,html.ng-arab .tn{display:none}" +
      ".ab{margin:8px 0 0}.ab button{padding:6px 12px;font-size:.85rem}.msg{padding:14px;border-radius:12px;background:rgba(0,0,0,.25);text-align:center}a{color:#c9bd8a}" +
      "html.ng-light .msg{background:#fff}html.ng-light a{color:#6b5a1a}" +
      ".more{display:block;width:100%;margin:6px 0 14px}";
    document.head.appendChild(css);

    function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&", "<": "<", ">": ">", '"': '"' }[c]; }); }
    function f(o, keys) { for (var i = 0; i < keys.length; i++) if (o[keys[i]] != null && o[keys[i]] !== "") return o[keys[i]]; return ""; }
    function norm(o) {
      return { id: o.id, grup: f(o, ["grup", "kategori"]), nama: f(o, ["nama", "judul", "title"]), ar: f(o, ["ar", "arab", "teksArab"]),
        tr: f(o, ["tr", "latin", "teksLatin"]), idn: f(o, ["idn", "arti", "terjemah", "teksIndonesia"]), tentang: f(o, ["tentang", "referensi", "keterangan"]) };
    }

    function status() {
      var s = document.getElementById("stat");
      if (!s) return;
      var p = window.NGPREF;
      if (p) s.textContent = "✅ Terhubung dengan pengaturan Ngelingan (Arab " + (p.font || 1) + ").";
      else s.textContent = "⏳ Menunggu pengaturan Ngelingan...";
    }

    function view() {
      var q = st.q.toLowerCase(), list = st.all.filter(function (d) {
        if (st.grup && d.grup !== st.grup) return false;
        return !q || (d.nama + " " + d.idn + " " + d.tr).toLowerCase().indexOf(q) >= 0;
      });
      var grups = [];
      st.all.forEach(function (d) { if (d.grup && grups.indexOf(d.grup) < 0) grups.push(d.grup); });
      var h = '<div class="bar"><input id="q" placeholder="Cari doa / arti..." value="' + esc(st.q) + '"/><select id="g"><option value="">Semua kategori</option>';
      grups.forEach(function (g) { h += '<option value="' + esc(g) + '"' + (g === st.grup ? " selected" : "") + ">" + esc(g) + "</option>"; });
      h += '</select></div><div class="sub" style="font-size:.8rem;opacity:.7;margin-bottom:8px">' + list.length + " doa</div><div id=\"list\">";
      list.slice(0, st.shown).forEach(function (d) {
        var on = st.open[d.id];
        h += '<div class="dd' + (on ? " on" : "") + '" data-id="' + esc(d.id) + '"><div class="hd"><span class="no">' + esc(d.id) + '</span><div class="nm">' + esc(d.nama) +
          (d.grup ? '<div class="gp">' + esc(d.grup) + "</div>" : "") + '</div><span class="ch">›</span></div><div class="bd">' +
          '<div class="ab"><button data-play="' + esc(d.id) + '">🔊 Dengarkan</button></div><div class="ar">' + esc(d.ar) + "</div>" + (d.tr ? '<div class="lt">' + esc(d.tr) + "</div>" : "") +
          '<div class="tr">' + esc(d.idn) + "</div>" + (d.tentang ? '<div class="tn">' + esc(d.tentang) + "</div>" : "") + "</div></div>";
      });
      if (!list.length) h += '<div class="msg">Tidak ada doa yang cocok.</div>';
      if (list.length > st.shown) h += '<button class="more" id="more">Tampilkan lebih banyak (' + (list.length - st.shown) + " lagi)</button>";
      h += '</div><div style="text-align:center;font-size:.8rem;opacity:.75;margin-top:10px">Sumber: <a href="https://equran.id/doa" target="_blank" rel="noopener">EQuran.id</a></div>' +
        '<p id="stat" style="text-align:center;font-size:.78rem;opacity:.65;margin:8px 0 0"></p>';
      app.innerHTML = h;
      status();
    }

    window.addEventListener("ngpref", status);
    setTimeout(function () {
      var s = document.getElementById("stat");
      if (s && !window.NGPREF) s.textContent = "⚠️ Belum terhubung ke pengaturan Ngelingan. Pasang XML terbaru (TemaNgelinganBaru003) lalu muat ulang halaman.";
    }, 2500);

    function henti() { au.pause(); try { speechSynthesis.cancel(); } catch (x) {} }
    function putar(id, btn) {
      var d = st.all.filter(function (x) { return String(x.id) === String(id); })[0];
      if (!d) return;
      henti();
      if (ttsOn === id) { ttsOn = null; btn.textContent = "🔊 Dengarkan"; return; }
      ttsOn = id;
      document.querySelectorAll("[data-play]").forEach(function (b) { b.textContent = "🔊 Dengarkan"; });
      btn.textContent = "⏹ Hentikan";
      var selesai = function () { ttsOn = null; btn.textContent = "🔊 Dengarkan"; };
      if (AUDIO) {
        au.src = AUDIO(+d.id); au.onended = selesai;
        au.onerror = function () { selesai(); alert("Audio doa nomor " + d.id + " tidak bisa dimuat."); };
        au.play().catch(selesai); return;
      }
      if (!window.speechSynthesis) { selesai(); alert("HP ini tidak mendukung suara bawaan."); return; }
      var u = new SpeechSynthesisUtterance(d.ar); u.lang = "ar-SA"; u.rate = 0.8;
      u.onend = selesai; u.onerror = selesai; speechSynthesis.speak(u);
    }

    app.addEventListener("input", function (e) {
      if (e.target.id === "q") {
        st.q = e.target.value; st.shown = 20;
        var p = e.target.selectionStart; view();
        var q = document.getElementById("q"); q.focus(); try { q.setSelectionRange(p, p); } catch (x) {}
      }
    });
    app.addEventListener("change", function (e) { if (e.target.id === "g") { st.grup = e.target.value; st.shown = 20; view(); } });
    app.addEventListener("click", function (e) {
      var t = e.target;
      var pid = t.getAttribute && t.getAttribute("data-play");
      if (pid) { putar(pid, t); return; }
      if (t.id === "more") { st.shown += 20; view(); return; }
      var hd = t.closest && t.closest(".hd");
      if (hd) {
        var box = hd.parentNode, id = box.getAttribute("data-id");
        st.open[id] = !st.open[id]; box.classList.toggle("on", !!st.open[id]);
      }
    });

    app.innerHTML = '<div class="msg">Memuat doa...</div>';
    fetch(API).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        var d = Array.isArray(j) ? j : (j && j.data);
        if (!Array.isArray(d) || !d.length) throw new Error("data kosong");
        st.all = d.map(norm); view();
      })
      .catch(function (e) {
        app.innerHTML = '<div class="msg">Gagal memuat doa (' + esc(e && e.message) + ').<br>Periksa koneksi, atau buka <a href="https://equran.id/doa" target="_blank" rel="noopener">equran.id/doa</a>.</div>';
      });
};
