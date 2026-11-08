/* =========================================================
   READERS.JS — Mesin Universal (Fix Mode Arab Saja via JS)
   ========================================================= */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function muatScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) return resolve(src);
      var s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload  = function () { resolve(src); };
      s.onerror = function () { reject(new Error("Gagal memuat: " + src)); };
      document.head.appendChild(s);
    });
  }

  function renderBab(bab) {
    var h = '<div class="ic">';
    if (bab.judul) h += '<div class="bh">' + esc(bab.judul) + "</div>";
    (bab.isi || []).forEach(function (it) {
      if (it.ar) h += '<div class="ar">' + esc(it.ar) + "</div>";
      if (it.lt) h += '<div class="lt">' + esc(it.lt) + "</div>";
      if (it.tr) h += '<div class="tr">' + esc(it.tr) + "</div>";
      if (it.tn) h += '<div class="tn">' + esc(it.tn) + "</div>";
    });
    if (bab.penjelasan) {
      h += '<div class="pj">Penjelasan</div>';
      h += '<div class="pg">' + esc(bab.penjelasan) + "</div>";
    }
    h += "</div>";
    return h;
  }

  function renderAyat(bab, ai) {
    var it = (bab.isi || [])[ai];
    if (!it) return "";
    var h = '<div class="ic">';
    h += '<div class="bh">' + esc(bab.judul || "Bab") + " — Ayat " + (ai + 1) + "</div>";
    if (it.ar) h += '<div class="ar">' + esc(it.ar) + "</div>";
    if (it.lt) h += '<div class="lt">' + esc(it.lt) + "</div>";
    if (it.tr) h += '<div class="tr">' + esc(it.tr) + "</div>";
    if (it.tn) h += '<div class="tn">' + esc(it.tn) + "</div>";
    h += "</div>";
    return h;
  }

  window.bukaReader = function (cfg) {
    cfg = Object.assign({
      judul: "Reader",
      placeholderCari: "Cari...",
      labelPilih: "Pilih",
      labelKosong: "Silakan pilih terlebih dahulu.",
      sumberData: "",
      kunciData: "DAFTAR_DATA"
    }, cfg || {});

    if (cfg.judul) document.title = cfg.judul;

    var elC  = document.getElementById("C")  || document.getElementById("q");
    var elSG = document.getElementById("sg");
    var elNF = document.getElementById("NF") || document.getElementById("k");
    var elP  = document.getElementById("P");
    var elH  = document.getElementById("H")  || document.getElementById("main");

    var MODE3 = !!elP;

    if (!elC || !elNF || !elH) {
      console.error("[Reader] Elemen #C/#q, #NF/#k, #H/#main tidak ditemukan");
      return;
    }
    if (cfg.placeholderCari) elC.placeholder = cfg.placeholderCari;

    /* ================ FITUR PENGGABUNG TEKS ARAB ================ */
    function setupArabModeObserver() {
      var htmlEl = document.documentElement;

      function updateArabMode() {
        var isArab = htmlEl.classList.contains("ng-arab");
        var icElements = elH.querySelectorAll(".ic");

        icElements.forEach(function (ic) {
          if (isArab) {
            if (!ic.dataset.merged) {
              var arElements = Array.from(ic.querySelectorAll(".ar"));
              if (arElements.length > 0) {
                // Buat 1 div penampung
                var mergedDiv = document.createElement("div");
                mergedDiv.className = "ar merged-ar";
                // Gabungkan semua teks
                mergedDiv.textContent = arElements.map(function(el) { return el.textContent.trim(); }).join(" ");

                // Sembunyikan teks asli
                arElements.forEach(function(el) { el.style.setProperty("display", "none", "important"); });

                // Sisipkan di atas teks pertama
                arElements[0].parentNode.insertBefore(mergedDiv, arElements[0]);
                ic.dataset.merged = "true";
              }
            }
          } else {
            if (ic.dataset.merged) {
              // Hapus teks gabungan
              var mergedDiv = ic.querySelector(".merged-ar");
              if (mergedDiv) mergedDiv.remove();

              // Munculkan teks asli lagi
              var arElements = ic.querySelectorAll(".ar");
              arElements.forEach(function(el) { el.style.removeProperty("display"); });

              delete ic.dataset.merged;
            }
          }
        });
      }

      updateArabMode(); // Jalankan pertama kali

      // Pantau jika tombol "Arab Saja" diklik (class html berubah)
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === "class") {
            updateArabMode();
          }
        });
      });
      observer.observe(htmlEl, { attributes: true });

      return updateArabMode;
    }

    var updateArabMode = setupArabModeObserver();
    /* ============================================================ */

    function muatDaftar() {
      if (cfg.sumberData) {
        return muatScript(cfg.sumberData).then(function () {
          return window[cfg.kunciData] || [];
        });
      }
      if (window[cfg.kunciData]) return Promise.resolve(window[cfg.kunciData]);
      if (window.DAFTAR_DATA)    return Promise.resolve(window.DAFTAR_DATA);
      return Promise.resolve([]);
    }

    function mulai() {
      elH.innerHTML = '<div class="msg">Memuat...</div>';
      muatDaftar().then(function (daftar) {
        if (!daftar.length) {
          elH.innerHTML = '<div class="msg">Daftar data kosong atau gagal dimuat.</div>';
          return;
        }
        var chain = Promise.resolve();
        daftar.forEach(function (url) {
          chain = chain.then(function () {
            return muatScript(url).catch(function (e) { console.warn("[Reader]", e.message); });
          });
        });
        return chain.then(initUI);
      }).catch(function (e) {
        console.error("[Reader]", e);
        elH.innerHTML = '<div class="msg">Gagal memuat data.<br><small>' + esc(e.message) + "</small></div>";
      });
    }

    function initUI() {
      var kunci = Object.keys(window.KONTEN || {});
      elNF.innerHTML = "";
      var optPilih = document.createElement("option");
      optPilih.value = "";
      optPilih.textContent = cfg.labelPilih;
      elNF.appendChild(optPilih);

      kunci.forEach(function (k) {
        var o = document.createElement("option");
        o.value = k; o.textContent = k;
        elNF.appendChild(o);
      });

      if (!kunci.length) { elH.innerHTML = '<div class="msg">Belum ada data.</div>'; return; }

      setupSearch(kunci);

      elNF.addEventListener("change", function () {
        if (this.value) {
          isiPembahasan(this.value);
          renderPilihan(this.value, "all");
        } else {
          if (elP) elP.innerHTML = '<option>Pembahasan</option>';
          elH.innerHTML = '<div class="msg">' + esc(cfg.labelKosong) + "</div>";
        }
      });

      if (elP) {
        elP.addEventListener("change", function () {
          if (elNF.value && this.value) renderPilihan(elNF.value, this.value);
        });
      }

      elNF.value = kunci[0];
      isiPembahasan(kunci[0]);
      renderPilihan(kunci[0], "all");
    }

    function isiPembahasan(nama) {
      if (!elP) return;
      var data = window.KONTEN[nama] || {};
      var babList = data.bab || [];

      elP.innerHTML = "";
      var optAll = document.createElement("option");
      optAll.value = "all"; optAll.textContent = "Semua Bab";
      elP.appendChild(optAll);

      if (babList.length) {
        var ogBab = document.createElement("optgroup");
        ogBab.label = "Per Bab";
        babList.forEach(function (bab, i) {
          var o = document.createElement("option");
          o.value = "b:" + i; o.textContent = "Bab " + (i + 1) + ": " + (bab.judul || "-");
          ogBab.appendChild(o);
        });
        elP.appendChild(ogBab);
      }

      var adaAyat = babList.some(function (b) { return (b.isi || []).length > 0; });
      if (adaAyat) {
        var ogAyat = document.createElement("optgroup");
        ogAyat.label = "Per Ayat";
        babList.forEach(function (bab, bi) {
          (bab.isi || []).forEach(function (it, ai) {
            var o = document.createElement("option");
            o.value = "a:" + bi + ":" + ai;
            var preview = (it.tr || it.ar || "").replace(/\s+/g, " ").slice(0, 40);
            o.textContent = "Bab " + (bi + 1) + " Ayat " + (ai + 1) + " — " + preview;
            ogAyat.appendChild(o);
          });
        });
        elP.appendChild(ogAyat);
      }
      elP.value = "all";
    }

    function renderPilihan(nama, pilihan) {
      var data = window.KONTEN[nama];
      if (!data) { elH.innerHTML = '<div class="msg">Data tidak ditemukan.</div>'; return; }
      if (!MODE3) pilihan = "all";

      var html = "";
      if (pilihan === "all") {
        (data.bab || []).forEach(function (bab) { html += renderBab(bab); });
      } else if (pilihan.indexOf("b:") === 0) {
        var bi = parseInt(pilihan.slice(2), 10);
        var bab = (data.bab || [])[bi];
        if (bab) html += renderBab(bab);
      } else if (pilihan.indexOf("a:") === 0) {
        var parts = pilihan.split(":");
        var bi2 = parseInt(parts[1], 10);
        var ai2 = parseInt(parts[2], 10);
        var bab2 = (data.bab || [])[bi2];
        if (bab2) html += renderAyat(bab2, ai2);
      }

      elH.innerHTML = html || '<div class="msg">' + esc(cfg.labelKosong) + "</div>";
      
      // Panggil fungsi gabung Arab setiap kali konten berganti
      if (typeof updateArabMode === 'function') {
        updateArabMode();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function setupSearch(kunci) {
      elC.addEventListener("input", function () {
        var q = this.value.trim().toLowerCase();
        elSG.innerHTML = "";
        if (!q) { elSG.classList.remove("on"); return; }

        var hasil = [];
        kunci.forEach(function (nama) {
          if (nama.toLowerCase().indexOf(q) !== -1) hasil.push({ nama: nama, label: nama, tipe: "doa" });
        });
        kunci.forEach(function (nama) {
          var data = window.KONTEN[nama];
          (data.bab || []).forEach(function (bab, i) {
            if (bab.judul && bab.judul.toLowerCase().indexOf(q) !== -1) {
              hasil.push({ nama: nama, babIdx: i, label: nama + " → Bab " + (i + 1) + ": " + bab.judul, tipe: "bab" });
            }
          });
        });

        if (!hasil.length) { elSG.classList.remove("on"); return; }

        hasil.slice(0, 30).forEach(function (h) {
          var li = document.createElement("div");
          li.className = "li";
          li.style.cssText = "padding:9px 10px;cursor:pointer";
          li.textContent = h.label;
          li.addEventListener("click", function () {
            elC.value = ""; elSG.classList.remove("on"); elSG.innerHTML = "";
            elNF.value = h.nama;
            isiPembahasan(h.nama);
            if (h.tipe === "bab" && MODE3) {
              elP.value = "b:" + h.babIdx;
              renderPilihan(h.nama, "b:" + h.babIdx);
            } else {
              if (elP) elP.value = "all";
              renderPilihan(h.nama, "all");
            }
          });
          elSG.appendChild(li);
        });
        elSG.classList.add("on");
      });

      document.addEventListener("click", function (e) {
        if (!elSG.contains(e.target) && e.target !== elC) elSG.classList.remove("on");
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mulai);
    } else {
      mulai();
    }
  };
})();
