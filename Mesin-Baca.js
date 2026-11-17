(function () {
  "use strict";

  var LEVEL = { P: "Pemula", M: "Menengah", L: "Lanjut" };

  /* ---------- alat kecil ---------- */
  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Normalisasi untuk pencarian & pencocokan: huruf kecil, tanpa harakat,
  // tanpa aksen, tanpa spasi/tanda baca. Aman untuk Latin maupun Arab.
  function norm(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u0300-\u036F]/g, "")
      .replace(/ى/g, "ي").replace(/ة/g, "ه")
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "");
  }

  function muatScript(url) {
    return new Promise(function (ok, gagal) {
      var s = document.createElement("script"), t;
      s.async = true;
      s.src = url;
      s.onload = function () { clearTimeout(t); ok(); };
      s.onerror = function () { clearTimeout(t); s.remove(); gagal(new Error("tidak ditemukan / gagal diunduh")); };
      t = setTimeout(function () { s.remove(); gagal(new Error("waktu habis")); }, 15000);
      document.head.appendChild(s);
    });
  }

  // Daftar kemungkinan nama file untuk satu kitab
  function kandidatFile(e) {
    var out = [];
    if (typeof e[7] === "string" && e[7]) out.push(e[7]);
    var ascii = String(e[0]).normalize("NFD").replace(/[\u0300-\u036F]/g, "");
    [ascii, ascii.replace(/\([^)]*\)/g, " ")].forEach(function (t) {
      var kata = t.split(/[^A-Za-z0-9]+/).filter(Boolean);
      if (!kata.length) return;
      var gabung = kata.join("");
      out.push(gabung, gabung.toLowerCase(), kata.join("-"), kata.join("_"));
    });
    var uniq = [];
    out.forEach(function (f) {
      if (!/\.js$/i.test(f)) f += ".js";
      if (uniq.indexOf(f) < 0) uniq.push(f);
    });
    return uniq;
  }

  /* ---------- pemuat isi kitab ---------- */
  var cache = {};

  function cariData(nama, kunciSebelum) {
    var K = window.KITAB || {}, n = norm(nama), k;
    if (K[nama]) return K[nama];
    for (k in K) if (norm(k) === n) return K[k];
    for (k in K) if (kunciSebelum.indexOf(k) < 0) return K[k]; // kunci baru dari file yang baru dimuat
    return null;
  }

  function muatKitab(e, base) {
    var nama = e[0];
    if (cache[nama]) return Promise.resolve(cache[nama]);
    window.KITAB = window.KITAB || {};
    var sebelum = Object.keys(window.KITAB);
    var ada = cariData(nama, sebelum.concat(Object.keys(window.KITAB))); // sudah tersedia (inline)?
    if (ada) { cache[nama] = ada; return Promise.resolve(ada); }

    var urls = kandidatFile(e).map(function (f) {
      return /^https?:\/\//i.test(f) ? f : base + encodeURIComponent(f).replace(/%2F/g, "/");
    });
    var catatan = [];

    function coba(i) {
      if (i >= urls.length) {
        var err = new Error("gagal");
        err.catatan = catatan;
        return Promise.reject(err);
      }
      return muatScript(urls[i]).then(function () {
        var d = cariData(nama, sebelum);
        if (d) { cache[nama] = d; return d; }
        catatan.push(urls[i] + " : file terbaca tetapi tidak berisi data \"" + nama + "\"");
        return coba(i + 1);
      }, function (er) {
        catatan.push(urls[i] + " : " + er.message);
        return coba(i + 1);
      });
    }
    return coba(0);
  }

  /* ---------- mesin utama ---------- */
  window.bukaReader = function (opt) {
    opt = opt || {};
    var flat = [];          // semua kitab (datar)
    var BASE = "";
    var cur = null;         // {item, data}
    var tok = 0;            // penanda anti-balapan saat ganti kitab cepat

    var q, sg, selK, selB, main, stat;

    function mulai() {
      q = $("q"); sg = $("sg"); selK = $("k"); selB = $("b"); main = $("main"); stat = $("stat");
      if (!q || !selK || !selB || !main) { console.error("Mesin-Baca: elemen #q, #k, #b, #main tidak lengkap"); return; }

      pasangToolbar();
      suntikGaya();
      if (opt.judul) document.title = opt.judul;
      if (opt.placeholderCari) q.placeholder = opt.placeholderCari;
      if (selK.options[0]) selK.options[0].textContent = opt.labelPilih || "Pilih Kitab";

      tampilPesan("Memuat daftar kitab…");
      muatKatalog().then(function () {
        isiDropdownKitab();
        tampilKosong();
        if (stat) stat.textContent = flat.length + " kitab";
      }, function (er) {
        tampilPesan("Daftar kitab gagal dimuat.<br><small>" + esc(opt.sumberData || "") + " : " + esc(er.message) + "</small>", true);
      });

      selK.addEventListener("change", function () { pilihKitab(selK.value); });
      selB.addEventListener("change", function () {
        if (!cur) return;
        if (selB.value === "") tampilInfo(); else tampilBab(parseInt(selB.value, 10));
      });
      q.addEventListener("input", saran);
      q.addEventListener("focus", saran);
      q.addEventListener("keydown", function (ev) { if (ev.key === "Escape") tutupSaran(); });
      document.addEventListener("click", function (ev) {
        if (!ev.target.closest || !ev.target.closest(".srch-wrap")) tutupSaran();
      });
    }

    /* --- 3 kotak diam di atas (sesuai .toolbar-fix di AturKitab.css) --- */
    function pasangToolbar() {
      var cari = document.querySelector(".bar-cari"), pilih = document.querySelector(".bar-pilih");
      if (!cari || cari.closest(".toolbar-fix")) return;
      var tb = document.createElement("div");
      tb.className = "toolbar-fix";
      cari.parentNode.insertBefore(tb, cari);
      tb.appendChild(cari);
      if (pilih) tb.appendChild(pilih);
    }

    function suntikGaya() {
      var st = document.createElement("style");
      st.textContent =
        ".sg{max-height:55vh;overflow-y:auto}" +
        ".sg .li{padding:9px 10px;cursor:pointer}" +
        ".sg .li:hover{background:rgba(255,255,255,.08)}" +
        "html.ng-light .sg .li:hover{background:rgba(0,0,0,.06)}" +
        ".sg .li small{display:block;opacity:.65}" +
        ".rd-bab{display:block;width:100%;text-align:left;margin:0 0 6px}" +
        ".rd-nav{display:flex;gap:8px;margin-top:6px}" +
        ".rd-nav button{flex:1 1 50%}";
      document.head.appendChild(st);
    }

    /* --- katalog --- */
    function muatKatalog() {
      var p = (window.DATA_READER && window.DATA_READER.length)
        ? Promise.resolve()
        : muatScript(opt.sumberData);
      return p.then(function () {
        if (!window.DATA_READER || !window.DATA_READER.length) throw new Error("DATA_READER kosong / tidak ditemukan di file katalog");
        BASE = opt.base || window.KITAB_BASE || "";
        if (BASE && !/\/$/.test(BASE)) BASE += "/";
        flat = [];
        window.DATA_READER.forEach(function (kat) {
          (kat[2] || []).forEach(function (e) {
            flat.push({
              id: flat.length, kat: kat[0], katDesk: kat[1], e: e,
              nama: e[0], arab: e[1], penulisAr: e[2], penulis: e[3],
              arti: e[4], desk: e[5], level: e[6]
            });
          });
        });
      });
    }

    function isiDropdownKitab() {
      var html = '<option value="">' + esc(opt.labelPilih || "Pilih Kitab") + "</option>";
      window.DATA_READER.forEach(function (kat) {
        html += '<optgroup label="' + esc(kat[0]) + '">';
        flat.forEach(function (it) {
          if (it.kat === kat[0]) html += '<option value="' + it.id + '">' + esc(it.nama) + "</option>";
        });
        html += "</optgroup>";
      });
      selK.innerHTML = html;
    }

    /* --- tampilan dasar --- */
    function tampilPesan(html, ulang) {
      main.innerHTML = '<div class="msg">' + html + (ulang ? '<br><br><button type="button" id="rd-ulang">Coba lagi</button>' : "") + "</div>";
      var u = $("rd-ulang");
      if (u) u.onclick = function () { location.reload(); };
    }

    function tampilKosong() {
      tampilPesan(esc(opt.labelKosong || "Silakan pilih kitab terlebih dahulu."));
    }

    function aturDropdownBab(data) {
      var seb = data.sebutan || "Pembahasan";
      var html = '<option value="">' + esc("Pilih " + seb) + "</option>";
      (data.bab || []).forEach(function (b, i) {
        html += '<option value="' + i + '">' + (i + 1) + ". " + esc(b.judul || "Tanpa judul") + "</option>";
      });
      selB.innerHTML = html;
    }

    function resetBab() {
      selB.innerHTML = "<option value=\"\">Pembahasan</option>";
    }

    /* --- pilih kitab --- */
    function pilihKitab(id) {
      tok++;
      var my = tok;
      cur = null;
      resetBab();
      if (id === "" || id == null) { selK.value = ""; tampilKosong(); return; }
      var item = flat[parseInt(id, 10)];
      if (!item) { tampilKosong(); return; }
      selK.value = String(item.id);
      tampilPesan("Memuat <b>" + esc(item.nama) + "</b>…");

      muatKitab(item.e, BASE).then(function (data) {
        if (my !== tok) return;
        cur = { item: item, data: data };
        aturDropdownBab(data);
        tampilInfo();
      }, function (er) {
        if (my !== tok) return;
        var d = (er.catatan || []).map(function (c) { return "• " + esc(c); }).join("<br>");
        tampilPesan(
          "Kitab <b>" + esc(item.nama) + "</b> belum bisa dimuat.<br><small>Alamat yang dicoba:<br>" + d + "</small>", true);
        var u = $("rd-ulang");
        if (u) u.onclick = function () { pilihKitab(item.id); };
      });
    }

    /* --- halaman info kitab + daftar bab --- */
    function tampilInfo() {
      var it = cur.item, d = cur.data, bab = d.bab || [];
      var h = '<div class="ic">' +
        '<div class="ar">' + esc(it.arab) + "</div>" +
        '<div class="bh">' + esc(it.nama) + "</div>" +
        '<div class="tr">Karya: ' + esc(it.penulis) + (it.penulisAr ? ' (<span class="ap">' + esc(it.penulisAr) + "</span>)" : "") + "</div>" +
        '<div class="lt">' + esc(it.arti) + "</div>" +
        '<div class="tr">' + esc(d.catatan || it.desk) + "</div>" +
        '<div class="tn">' + esc(it.kat) + " • " + esc(LEVEL[it.level] || it.level || "") + " • " + bab.length + " " + esc((d.sebutan || "bab").toLowerCase()) + "</div>" +
        "</div>";
      if (bab.length) {
        h += '<div class="bh">Daftar ' + esc(d.sebutan || "Pembahasan") + "</div>";
        bab.forEach(function (b, i) {
          h += '<button type="button" class="rd-bab" data-i="' + i + '">' + (i + 1) + ". " + esc(b.judul || "Tanpa judul") + "</button>";
        });
      } else {
        h += '<div class="msg">Isi kitab ini belum tersedia.</div>';
      }
      main.innerHTML = h;
      selB.value = "";
      Array.prototype.forEach.call(main.querySelectorAll(".rd-bab"), function (btn) {
        btn.onclick = function () { bukaBab(parseInt(btn.getAttribute("data-i"), 10)); };
      });
      window.scrollTo(0, 0);
    }

    function bukaBab(i) { selB.value = String(i); tampilBab(i); }

    /* --- halaman satu bab --- */
    function tampilBab(i) {
      var d = cur.data, bab = d.bab || [], b = bab[i];
      if (!b) { tampilInfo(); return; }
      var seb = d.sebutan || "Bab";
      var h = '<div class="bh">' + esc(seb) + " " + (i + 1) + ": " + esc(b.judul) +
        (b.arab ? '<div class="ap">' + esc(b.arab) + "</div>" : "") + "</div>";

      (b.isi || []).forEach(function (x) {
        if (typeof x === "string") x = { tr: x };
        var ar = x.ar || x.arab, lt = x.lt || x.latin, tr = x.tr || x.terjemah, cat = x.cat || x.catatan;
        h += '<div class="ic">' +
          (ar ? '<div class="ar">' + esc(ar) + "</div>" : "") +
          (lt ? '<div class="lt">' + esc(lt) + "</div>" : "") +
          (tr ? '<div class="tr">' + esc(tr) + "</div>" : "") +
          (cat ? '<div class="tn">' + esc(cat) + "</div>" : "") +
          "</div>";
      });

      if (b.penjelasan) {
        h += '<div class="ic"><div class="tn">Penjelasan</div><div class="tr">' + esc(b.penjelasan) + "</div></div>";
      }

      h += '<div class="rd-nav">' +
        '<button type="button" id="rd-prev"' + (i > 0 ? "" : " disabled") + ">‹ Sebelumnya</button>" +
        '<button type="button" id="rd-next"' + (i < bab.length - 1 ? "" : " disabled") + ">Berikutnya ›</button></div>";

      main.innerHTML = h;
      $("rd-prev").onclick = function () { bukaBab(i - 1); };
      $("rd-next").onclick = function () { bukaBab(i + 1); };
      window.scrollTo(0, 0);
    }

    /* --- pencarian & saran --- */
    function saran() {
      var t = norm(q.value);
      if (!t) { tutupSaran(); return; }
      var hasil = [];

      flat.forEach(function (it) {
        var nm = norm(it.nama), skor = -1;
        if (nm.indexOf(t) === 0) skor = 0;
        else if (nm.indexOf(t) > -1 || norm(it.arab).indexOf(t) > -1) skor = 1;
        else if (norm([it.penulis, it.penulisAr, it.arti, it.desk, it.kat].join(" ")).indexOf(t) > -1) skor = 2;
        if (skor > -1) hasil.push({ skor: skor, tipe: "kitab", it: it });
      });
      hasil.sort(function (a, b) { return a.skor - b.skor; });
      hasil = hasil.slice(0, 8);

      if (cur) {
        (cur.data.bab || []).forEach(function (b, i) {
          if (hasil.length < 14 && norm((b.judul || "") + (b.arab || "")).indexOf(t) > -1) {
            hasil.push({ tipe: "bab", i: i, b: b });
          }
        });
      }

      if (!hasil.length) {
        sg.innerHTML = '<div class="li"><small>Tidak ada hasil</small></div>';
        sg.classList.add("on");
        return;
      }
      sg.innerHTML = hasil.map(function (r, n) {
        if (r.tipe === "kitab") {
          return '<div class="li" data-n="' + n + '"><b>' + esc(r.it.nama) + "</b> " +
            '<span class="ap">' + esc(r.it.arab) + "</span><small>" + esc(r.it.kat) + " • " + esc(r.it.penulis) + "</small></div>";
        }
        return '<div class="li" data-n="' + n + '">› ' + esc((cur.data.sebutan || "Bab") + " " + (r.i + 1) + ": " + r.b.judul) +
          "<small>di " + esc(cur.item.nama) + "</small></div>";
      }).join("");
      sg.classList.add("on");

      Array.prototype.forEach.call(sg.querySelectorAll(".li[data-n]"), function (el) {
        el.onclick = function () {
          var r = hasil[parseInt(el.getAttribute("data-n"), 10)];
          q.value = "";
          tutupSaran();
          if (r.tipe === "kitab") pilihKitab(r.it.id);
          else bukaBab(r.i);
        };
      });
    }

    function tutupSaran() { sg.classList.remove("on"); sg.innerHTML = ""; }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulai);
    else mulai();
  };

  /* dipakai untuk pengujian */
  window.bukaReader._uji = { norm: norm, kandidatFile: kandidatFile };
})();


