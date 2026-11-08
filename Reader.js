/* =========================================================
   READER.JS — Mesin Pembaca Doa Al-Fatihah
   - Memuat DaftarData.js
   - Memuat semua file data (DoaFatihah1.js, 2.js, 3.js)
   - Render ke halaman Pemanggil.html
   - Menyediakan fungsi global: bukaDoaEQuran()
   ========================================================= */
(function () {
  "use strict";

  var URL_DAFTAR = "https://teamkeringat.github.io/js/DaftarData.js";

  /* ---------- Util: escape HTML ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Util: load script dinamis (Promise) ---------- */
  function muatScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(src); };
      s.onerror = function () { reject(new Error("Gagal memuat: " + src)); };
      document.head.appendChild(s);
    });
  }

  /* ---------- Muat DaftarData + semua file data ---------- */
  async function muatSemua() {
    if (!window.DAFTAR_DATA) {
      await muatScript(URL_DAFTAR);
    }
    var daftar = window.DAFTAR_DATA || [];
    for (var i = 0; i < daftar.length; i++) {
      try {
        await muatScript(daftar[i]);
      } catch (e) {
        console.warn("[Reader]", e.message);
      }
    }
  }

  /* ---------- Render isi doa ke #main ---------- */
  function renderDoa(nama) {
    var main = document.getElementById("main");
    var selK = document.getElementById("k");
    var stat = document.getElementById("stat");
    var data = (window.KONTEN || {})[nama];

    if (!data) {
      main.innerHTML = '<div class="msg">Data tidak ditemukan.</div>';
      return;
    }
    if (selK && selK.value !== nama) selK.value = nama;

    var html = "";
    var babList = data.bab || [];

    babList.forEach(function (bab) {
      html += '<div class="ic">';

      // label sebutan (opsional)
      if (data.sebutan) {
        html += '<div class="ap" style="font-size:.75rem;opacity:.65;margin-bottom:4px">' +
                esc(data.sebutan) + '</div>';
      }

      // judul bab
      if (bab.judul) {
        html += '<div class="bh">' + esc(bab.judul) + "</div>";
      }

      // isi ayat / kalimat
      (bab.isi || []).forEach(function (item) {
        if (item.ar) html += '<div class="ar">' + esc(item.ar) + "</div>";
        if (item.lt) html += '<div class="lt">' + esc(item.lt) + "</div>";
        if (item.tr) html += '<div class="tr">' + esc(item.tr) + "</div>";
        if (item.tn) html += '<div class="tn">' + esc(item.tn) + "</div>";
      });

      // penjelasan bab
      if (bab.penjelasan) {
        html += '<div class="tn">' + esc(bab.penjelasan) + "</div>";
      }

      html += "</div>";
    });

    main.innerHTML = html || '<div class="msg">(Tidak ada isi doa)</div>';
    if (stat) stat.textContent = nama;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Inisialisasi UI ---------- */
  function initUI() {
    var selK = document.getElementById("k");
    var inpQ = document.getElementById("q");
    var sg   = document.getElementById("sg");
    var main = document.getElementById("main");

    if (!selK || !inpQ || !sg || !main) return;

    var kunci = Object.keys(window.KONTEN || {});

    if (!kunci.length) {
      main.innerHTML = '<div class="msg">Belum ada data doa yang berhasil dimuat.</div>';
      return;
    }

    /* Isi dropdown "Pilih Doa" */
    selK.innerHTML = '<option value="" selected>Pilih Doa</option>';
    kunci.forEach(function (k) {
      var opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      selK.appendChild(opt);
    });

    /* Tampilkan yang pertama */
    renderDoa(kunci[0]);

    /* Event: pilih dari dropdown */
    selK.addEventListener("change", function () {
      if (this.value) renderDoa(this.value);
    });

    /* Event: input pencarian */
    inpQ.addEventListener("input", function () {
      var q = this.value.trim().toLowerCase();
      sg.innerHTML = "";

      if (!q) {
        sg.classList.remove("on");
        return;
      }

      var hasil = kunci.filter(function (k) {
        return k.toLowerCase().indexOf(q) !== -1;
      });

      hasil.forEach(function (k) {
        var li = document.createElement("div");
        li.className = "li";
        li.style.cssText = "padding:9px 10px;cursor:pointer";
        li.textContent = k;
        li.addEventListener("click", function () {
          inpQ.value = "";
          sg.classList.remove("on");
          sg.innerHTML = "";
          renderDoa(k);
        });
        sg.appendChild(li);
      });

      if (hasil.length) sg.classList.add("on");
      else sg.classList.remove("on");
    });

    /* Tutup dropdown jika klik di luar */
    document.addEventListener("click", function (e) {
      if (!sg.contains(e.target) && e.target !== inpQ) {
        sg.classList.remove("on");
      }
    });
  }

  /* ---------- Entry point: dipanggil dari HTML ---------- */
  window.bukaDoaEQuran = function () {
    var main = document.getElementById("main");
    if (main) main.innerHTML = '<div class="msg">Memuat doa...</div>';

    muatSemua()
      .then(initUI)
      .catch(function (e) {
        console.error("[Reader]", e);
        if (main) main.innerHTML =
          '<div class="msg">Gagal memuat data.<br><small>' + esc(e.message) + "</small></div>";
      });
  };
})();
