/* Shared JS Al-Qur'an - EQuran.id API v2 */
(function () {
  var BASE = "https://equran.id/api/v2", PER = 10;
  var app = document.getElementById("app");
  if (!app) return;

  var cfg = window.QURAN_CONFIG || { mode: 'full' };
  var PILIH = null;
  
  if (cfg.mode === 'pilihan') {
    PILIH = [36, 55, 67, 56, 18];
  } else if (cfg.mode === 'juzamma') {
    PILIH = [1, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78];
  }

  var st = { list: [], s: null, tafsir: null, page: 0, qari: "05", auto: true, playing: -1, whole: false, cari: "", _focusCari: false };
  var au = new Audio();

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function get(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(function (j) { return j && j.data !== undefined ? j.data : j; }); }
  function msg(t) { app.innerHTML = '<div class="w"><div class="msg">' + t + "</div></div>"; }
  function gagal(e) { msg("Gagal memuat data (" + esc(e && e.message) + ").<br>Periksa koneksi internet, atau buka langsung di <a href='https://equran.id' target='_blank' rel='noopener'>equran.id</a>."); }
  function angka(n) { return String(n).replace(/[0-9]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".charAt(+d); }); }
  function hl(text, q) {
    text = String(text || ""); if (!q) return esc(text);
    var t = text.toLowerCase(), ql = q.toLowerCase(), i = 0, out = "", idx;
    while ((idx = t.indexOf(ql, i)) > -1) { out += esc(text.slice(i, idx)); out += '<span class="hl">' + esc(text.slice(idx, idx + q.length)) + "</span>"; i = idx + q.length; }
    return out + esc(text.slice(i));
  }

  function posisiSurat(nomor) {
    if (cfg.mode === 'full') return nomor;
    for (var k = 0; k < st.list.length; k++) { if (st.list[k].nomor === nomor) return k + 1; }
    return nomor;
  }

  function stop() { au.pause(); st.playing = -1; }
  function play(url, idx) { if (!url) return; au.src = url; st.playing = idx; au.play().catch(function () {}); mark(); }
  function mark() {
    var els = app.querySelectorAll(".ay[data-i]");
    for (var i = 0; i < els.length; i++) {
      var on = +els[i].getAttribute("data-i") === st.playing;
      els[i].classList.toggle("pl", on);
      var b = els[i].querySelector("[data-act=play]");
      if (b) b.textContent = on && !au.paused ? "⏸ Jeda" : "▶ Putar";
    }
  }
  au.onended = function () {
    var next = st.playing + 1, end = Math.min((st.page + 1) * PER, st.s.ayat.length);
    if (st.auto && next < end) { play(st.s.ayat[next].audio[st.qari], next); } else { st.playing = -1; mark(); }
  };
  au.onpause = mark; au.onplay = mark;

  function loadSurat(n) { stop(); msg("Memuat surat..."); st.page = 0; st.tafsir = null; st.cari = ""; get(BASE + "/surat/" + n).then(function (d) { st.s = d; render(); }).catch(gagal); }
  function loadTafsir(cb) {
    if (st.tafsir) return cb();
    get(BASE + "/tafsir/" + st.s.nomor).then(function (d) { st.tafsir = (d && d.tafsir) || []; cb(); }).catch(function () { st.tafsir = []; cb(); });
  }
  function cariHasil(q) {
    q = q.toLowerCase().trim(); if (!q) return [];
    var out = []; st.list.forEach(function (x) {
      var pool = [x.namaLatin || "", x.arti || "", x.nama || ""].join(" ").toLowerCase();
      if (pool.indexOf(q) > -1) out.push(x);
    }); return out;
  }

  function midHtml(s) {
    var searching = st.cari && st.cari.trim();
    if (searching) {
      var hasil = cariHasil(st.cari);
      var h = '<div class="hasil">';
      if (!hasil.length) h += '<div class="kosong">😕 Tidak ada surat cocok</div>';
      else {
        h += '<div class="hd2">📋 ' + hasil.length + ' surat cocok — klik untuk membuka:</div>';
        hasil.forEach(function (x) {
          h += '<button class="it' + (x.nomor === s.nomor ? " cur" : "") + '" data-pick="' + x.nomor + '"><span class="num">' + posisiSurat(x.nomor) + '.</span>' + hl(x.namaLatin, st.cari) + ' <span class="st">— ' + hl(x.arti || "", st.cari) + '</span></button>';
        });
      }
      return h + "</div>";
    }
    var tot = Math.ceil(s.ayat.length / PER), a0 = st.page * PER, a1 = Math.min(a0 + PER, s.ayat.length);
    var h2 = '<div class="card"><div class="nm">' + posisiSurat(s.nomor) + ". " + esc(s.namaLatin) + ' — <span class="arn">' + esc(s.nama || "") + '</span></div><div class="sub">' + esc(s.arti) + " • " + s.jumlahAyat + " ayat • " + esc(s.tempatTurun || "") + "</div>";
    var af = s.audioFull && s.audioFull[st.qari];
    if (af) h2 += '<audio controls preload="none" src="' + esc(af) + '"></audio>';
    h2 += '<div class="ab"><button id="auto" class="' + (st.auto ? "on" : "") + '">Putar otomatis ayat berikutnya</button></div></div>';
    if (st.whole) {
      var ar = "", lt = "", tr = "";
      s.ayat.forEach(function (a, k) {
        var n = a.nomorAyat || k + 1;
        ar += esc(a.teksArab) + ' <span class="mk">﴿' + angka(n) + "﴾</span> ";
        if (a.teksLatin) lt += "<b>" + n + ".</b> " + esc(a.teksLatin) + " ";
        tr += "<b>" + n + ".</b> " + esc(a.teksIndonesia) + " ";
      });
      h2 += '<div class="ay full"><div class="ar">' + ar + "</div>" + (lt ? '<div class="lt">' + lt + "</div>" : "") + '<div class="tr">' + tr + "</div></div>";
    } else {
      for (var i = a0; i < a1; i++) {
        var a = s.ayat[i];
        // Menambahkan nama surat di dalam kotak emas penanda ayat
        h2 += '<div class="ay" data-i="' + i + '"><span class="no">' + esc(s.namaLatin) + ': ' + (a.nomorAyat || i + 1) + '</span><div class="ar">' + esc(a.teksArab) + "</div>" + (a.teksLatin ? '<div class="lt">' + esc(a.teksLatin) + "</div>" : "") + '<div class="tr">' + esc(a.teksIndonesia) + "</div>" + '<div class="ab"><button data-act="play">▶ Putar</button><button data-act="tafsir">📖 Tafsir</button></div><div class="tf"></div></div>';
      }
    }
    return h2;
  }

  function render() {
    var s = st.s; if (!s) return;
    var tot = Math.ceil(s.ayat.length / PER), searching = st.cari && st.cari.trim();
    var h = '<div class="w"><div class="top">';
    h += '<div class="bar"><input id="cari" type="text" placeholder="Cari Surat" value="' + esc(st.cari) + '"></div>';
    h += '<div class="bar"><select id="sel">';
    st.list.forEach(function (x) {
      h += '<option value="' + x.nomor + '"' + (x.nomor === s.nomor ? " selected" : "") + ">" + posisiSurat(x.nomor) + ". " + esc(x.namaLatin) + "</option>";
    });
    h += '</select><select id="qari">';
    ["01", "02", "03", "04", "05", "06"].forEach(function (q) { h += '<option value="' + q + '"' + (q === st.qari ? " selected" : "") + ">Qari " + (+q) + "</option>"; });
    h += "</select>";
    if (!searching) h += '<button id="whole" class="' + (st.whole ? "on" : "") + '" title="' + (st.whole ? "Tampil Per Ayat" : "Tampil Per Surat") + '">' + (st.whole ? "📖" : "📄") + "</button>";
    h += '</div></div><div class="mid">' + midHtml(s) + '</div><div class="bot">';
    
    // Navigasi halaman menampilkan nama surat & rentang ayat
    if (!st.whole && !searching) {
      var a0 = st.page * PER;
      var a1 = Math.min(a0 + PER, s.ayat.length);
      h += '<div class="pg"><button id="prev"' + (st.page === 0 ? " disabled" : "") + ">⬅ Sebelumnya</button><span>" + esc(s.namaLatin) + " • Ayat " + (a0 + 1) + "-" + a1 + '</span><button id="next"' + (st.page >= tot - 1 ? " disabled" : "") + ">Berikutnya ➡</button></div>";
    }
    
    h += "</div></div>";
    app.innerHTML = h; mark();
    if (st._focusCari) { var inp = document.getElementById("cari"); if (inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (x) {} } st._focusCari = false; }
  }

  app.addEventListener("input", function (e) { if (e.target.id === "cari") { st.cari = e.target.value; st._focusCari = true; render(); } });
  app.addEventListener("change", function (e) {
    if (e.target.id === "sel") loadSurat(+e.target.value);
    if (e.target.id === "qari") { st.qari = e.target.value; stop(); render(); }
  });
  
  // Perbaikan handler klik untuk navigasi
  app.addEventListener("click", function (e) {
    var t = e.target;
    var pick = t.closest && t.closest("[data-pick]");
    if (pick) { loadSurat(+pick.getAttribute("data-pick")); return; }
    if (t.id === "whole") { stop(); st.whole = !st.whole; st.page = 0; render(); return; }
    if (t.id === "auto") { st.auto = !st.auto; t.classList.toggle("on", st.auto); return; }
    
    var btn = t.closest && t.closest("button");
    if (btn && (btn.id === "prev" || btn.id === "next")) {
      stop(); 
      st.page += btn.id === "next" ? 1 : -1; 
      render();
      var mid = app.querySelector(".mid");
      if (mid) mid.scrollTop = 0; // Scroll ke atas saat ganti halaman
      return;
    }
    
    var act = t.getAttribute && t.getAttribute("data-act"); if (!act) return;
    var box = t.closest(".ay"), i = +box.getAttribute("data-i");
    if (act === "play") {
      if (st.playing === i && !au.paused) { au.pause(); return; }
      if (st.playing === i && au.paused && au.src) { au.play(); return; }
      play(st.s.ayat[i].audio[st.qari], i);
    }
    if (act === "tafsir") {
      var tf = box.querySelector(".tf");
      if (tf.classList.contains("on")) { tf.classList.remove("on"); return; }
      tf.textContent = "Memuat tafsir..."; tf.classList.add("on");
      loadTafsir(function () {
        var n = st.s.ayat[i].nomorAyat || i + 1, hit = null;
        for (var k = 0; k < st.tafsir.length; k++) { if (+st.tafsir[k].ayat === +n) { hit = st.tafsir[k]; break; } }
        tf.textContent = hit ? hit.teks : "Tafsir untuk ayat ini tidak tersedia.";
      });
    }
  });

  msg("Memuat daftar surat...");
  get(BASE + "/surat").then(function (d) {
    if (PILIH) {
      var byNum = {}; (d || []).forEach(function (x) { byNum[x.nomor] = x; });
      st.list = PILIH.map(function (n) { return byNum[n]; }).filter(Boolean);
    } else {
      st.list = (d || []).slice().sort(function (a, b) { return a.nomor - b.nomor; });
    }
    if (!st.list.length) throw new Error("surat tidak ditemukan");
    loadSurat(st.list[0].nomor);
  }).catch(gagal);
})();
