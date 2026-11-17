/* Shared JS Ilmu Tajwid - Data Lokal */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // DATA TAJWID LENGKAP (Berdasarkan Riset Web)
  var dataTajwid = [
    {
      nama: "Pengertian Ilmu Tajwid",
      grup: "Dasar",
      ar: "التَّجْوِيدُ",
      tr: "At-Tajwid",
      arti: "Ilmu Tajwid adalah ilmu yang mempelajari cara melafalkan huruf-huruf Al-Qur'an dengan benar, sesuai dengan makhraj (tempat keluar huruf) dan sifat-sifatnya, agar terhindar dari kesalahan dalam membaca Al-Qur'an [citation:7].",
      tentang: "Secara bahasa, Tajwid berarti memperbaiki atau memperbagus (Tahsin). Sedangkan menurut istilah, mengucapkan setiap huruf dari tempat keluarnya dengan memberikan hak dan mustahaknya [citation:14]."
    },
    {
      nama: "Hukum Mempelajari Ilmu Tajwid",
      grup: "Dasar",
      ar: "حُكْمُ تَعَلُّمِ التَّجْوِيدِ",
      tr: "Hukum Ta'allum At-Tajwid",
      arti: "Hukum mempelajari ilmu Tajwid secara teori adalah **Fardhu Kifayah** (jika sebagian umat Islam sudah ada yang mempelajari, maka gugurlah kewajiban yang lain). Namun, hukum **mengamalkan** (membaca dengan tajwid) adalah **Fardhu 'Ain** bagi setiap mukallaf yang membaca Al-Qur'an [citation:1][citation:7].",
      tentang: "Dalil kewajiban mengamalkan tajwid: QS. Al-Muzzammil: 4 (Dan bacalah Al-Qur'an itu dengan tartil)."
    },
    {
      nama: "Hukum Nun Sukun & Tanwin (Idzhar Halqi)",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِظْهَارُ الْحَلْقِيُّ",
      tr: "Idzhar Halqi",
      arti: "Membaca nun sukun atau tanwin dengan **jelas dan terang** tanpa dengung ketika bertemu dengan salah satu huruf halqi (tenggorokan): ء, ه, ع, ح, غ, خ .",
      tentang: "Contoh: مِنْ هَادٍ (Min Haadin) — Nun sukun bertemu Ha."
    },
    {
      nama: "Hukum Nun Sukun & Tanwin (Idgham Bighunnah)",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِدْغَامُ بِغُنَّةٍ",
      tr: "Idgham Bighunnah",
      arti: "Memasukkan (meleburkan) nun sukun atau tanwin ke huruf berikutnya **dengan disertai dengung** (ghunnah). Hurufnya: ي, ن, م, و [citation:13].",
      tentang: "Contoh: مَنْ يَعْمَلْ (May Ya'mal) — Nun sukun bertemu Ya."
    },
    {
      nama: "Hukum Nun Sukun & Tanwin (Idgham Bilaghunnah)",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِدْغَامُ بِلَا غُنَّةٍ",
      tr: "Idgham Bilaghunnah",
      arti: "Memasukkan nun sukun atau tanwin ke huruf berikutnya **tanpa dengung**. Hurufnya hanya dua: ل dan ر .",
      tentang: "Contoh: مِنْ رَبِّهِمْ (Mir Rabbihim) — Nun sukun bertemu Ra."
    },
    {
      nama: "Hukum Nun Sukun & Tanwin (Iqlab)",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِقْلَابُ",
      tr: "Iqlab",
      arti: "Mengubah bunyi nun sukun atau tanwin menjadi **huruf Mim (م)** disertai dengung ketika bertemu dengan huruf Ba (ب) .",
      tentang: "Contoh: سَمِيعٌ بَصِيرٌ (Sami'um Bashir) — Tanwin bertemu Ba."
    },
    {
      nama: "Hukum Nun Sukun & Tanwin (Ikhfa Haqiqi)",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِخْفَاءُ الْحَقِيقِيُّ",
      tr: "Ikhfa Haqiqi",
      arti: "Membaca nun sukun atau tanwin dengan **samar-samar** (antara jelas dan lebur) disertai dengung. Terjadi jika bertemu 15 huruf: ت, ث, ج, د, ذ, ز, س, ش, ص, ض, ط, ظ, ف, ق, ك .",
      tentang: "Contoh: مِنْ قَبْلِ (Min Qabli) — Nun sukun bertemu Qaf."
    },
    {
      nama: "Hukum Mim Sukun (Idzhar Syafawi)",
      grup: "Mim Sukun",
      ar: "اَلْإِظْهَارُ الشَّفَوِيُّ",
      tr: "Idzhar Syafawi",
      arti: "Membaca mim sukun dengan **jelas** di bibir (tanpa dengung) ketika bertemu dengan huruf selain Mim dan Ba [citation:3][citation:10].",
      tentang: "Contoh: هُمْ فِيهَا (Hum Fiha) — Mim sukun bertemu Fa."
    },
    {
      nama: "Hukum Mim Sukun (Ikhfa Syafawi)",
      grup: "Mim Sukun",
      ar: "اَلْإِخْفَاءُ الشَّفَوِيُّ",
      tr: "Ikhfa Syafawi",
      arti: "Membaca mim sukun dengan **samar-samar** di bibir disertai dengung ketika bertemu dengan huruf Ba (ب) [citation:3][citation:10].",
      tentang: "Contoh: تَرْمِيهِمْ بِحِجَارَةٍ (Tarmihim Bihijarah) — Mim sukun bertemu Ba."
    },
    {
      nama: "Hukum Mim Sukun (Idgham Mimi)",
      grup: "Mim Sukun",
      ar: "اَلْإِدْغَامُ الْمِيمِيُّ",
      tr: "Idgham Mimi / Mitslain",
      arti: "Meleburkan mim sukun ke dalam huruf Mim berikutnya sehingga seolah-olah menjadi satu huruf yang bertasydid, disertai dengung [citation:3][citation:10].",
      tentang: "Contoh: لَكُمْ مَّا (Lakum Maa) — Mim sukun bertemu Mim."
    },
    {
      nama: "Hukum Mad (Mad Thabi'i)",
      grup: "Mad",
      ar: "اَلْمَدُّ الطَّبِيعِيُّ",
      tr: "Mad Thabi'i",
      arti: "Membaca panjang **2 harakat** (ketukan) pada huruf mad (Alif, Ya, Wau) yang tidak diikuti oleh hamzah atau sukun [citation:11].",
      tentang: "Contoh: قَالَ (Qaala) — Fathah bertemu Alif."
    },
    {
      nama: "Hukum Mad (Mad Far'i - Wajib Muttashil)",
      grup: "Mad",
      ar: "اَلْمَدُّ الْوَاجِبُ الْمُتَّصِلُ",
      tr: "Mad Wajib Muttashil",
      arti: "Membaca panjang **4-5 harakat** karena huruf mad bertemu dengan hamzah dalam **satu kata** (kalimat) [citation:11].",
      tentang: "Contoh: وَالسَّمَاءِ (Wassamaa'i) — Mad bertemu hamzah dalam satu kata."
    },
    {
      nama: "Hukum Qalqalah (Qalqalah Sugra)",
      grup: "Qalqalah",
      ar: "اَلْقَلْقَلَةُ الصُّغْرَى",
      tr: "Qalqalah Sugra",
      arti: "Memantulkan bunyi huruf qalqalah (ق, ط, ب, ج, د) yang berada di **tengah kata** (sukun asli) dengan pantulan ringan [citation:12].",
      tentang: "Contoh: يَقْطَعُونَ (Yaqtha'una) — Qaf sukun di tengah kata."
    },
    {
      nama: "Hukum Qalqalah (Qalqalah Kubra)",
      grup: "Qalqalah",
      ar: "اَلْقَلْقَلَةُ الْكُبْرَى",
      tr: "Qalqalah Kubra",
      arti: "Memantulkan bunyi huruf qalqalah dengan pantulan **lebih kuat** karena huruf tersebut berada di **akhir kata** (diwaqafkan) [citation:12].",
      tentang: "Contoh: مِنْ عَلَقٍ (Min 'Alaq) — Qaf di akhir ayat (waqaf)."
    }
  ];

  var st = { list: dataTajwid, cari: "", _focusCari: false, viewMode: "empty", selectedIdx: -1, searchResults: [] };

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&", "<": "<", ">": ">", '"': """ }[c]; }); }
  function hl(text, q) {
    text = String(text || ""); if (!q) return esc(text);
    var t = text.toLowerCase(), ql = q.toLowerCase(), i = 0, out = "", idx;
    while ((idx = t.indexOf(ql, i)) > -1) { out += esc(text.slice(i, idx)); out += '<span class="hl">' + esc(text.slice(idx, idx + q.length)) + "</span>"; i = idx + q.length; }
    return out + esc(text.slice(i));
  }
  function msg(t) { app.innerHTML = '<div class="w"><div class="msg">' + t + "</div></div>"; }

  function renderCard(d) {
    var h = '<div class="card">';
    h += '<div class="nm">' + esc(d.nama) + '</div>';
    if (d.grup) h += '<div class="sub">' + esc(d.grup) + '</div>';
    
    var ar = d.ar || "";
    var tr = d.tr || "";
    var arti = d.arti || "";
    var ref = d.tentang || "";

    if (ar) h += '<div class="ar" style="font-size: 1.5em; text-align: right; margin: 10px 0;">' + esc(ar) + '</div>';
    if (tr) h += '<div class="lt" style="font-weight: bold; margin-bottom: 5px;">' + esc(tr) + '</div>';
    if (arti) h += '<div class="tr" style="margin-bottom: 10px;">' + esc(arti) + '</div>';
    if (ref) h += '<div class="tf on" style="background:transparent; padding:0; margin-top:10px; color:#c9bd8a; font-size: calc(.9rem * var(--z,1));">📚 ' + esc(ref) + '</div>';

    h += '</div>';
    return h;
  }

  function render() {
    var h = '<div class="w"><div class="top">';
    h += '<div class="bar">';
    h += '<select id="sel" style="flex:1; width:50%; min-width:0;">';
    h += '<option value="empty"' + (st.viewMode === "empty" ? " selected" : "") + '>Pilih Materi</option>';
    h += '<option value="all"' + (st.viewMode === "all" ? " selected" : "") + '>Pilih Semua (Scroll)</option>';

    st.list.forEach(function(d, idx) {
      var isSel = (st.viewMode === "single" && st.selectedIdx === idx) ? " selected" : "";
      h += '<option value="' + idx + '"' + isSel + '>' + (idx+1) + '. ' + esc(d.nama) + '</option>';
    });
    h += '</select>';

    h += '<input id="cari" type="text" placeholder="Cari Hukum Tajwid..." value="' + esc(st.cari) + '" style="flex:1; width:50%; min-width:0;">';
    h += '</div></div>'; 

    h += '<div class="mid">';

    if (st.cari && st.cari.trim()) {
      var q = st.cari.toLowerCase().trim();
      st.searchResults = st.list.map(function(d, idx) { return {d:d, idx:idx}; }).filter(function(x) {
        var pool = [(x.d.nama || ""), (x.d.grup || ""), (x.d.arti || ""), (x.d.tr || "")].join(" ").toLowerCase();
        return pool.indexOf(q) > -1;
      });

      if (!st.searchResults.length) {
        h += '<div class="msg">😕 Tidak ada materi tajwid yang cocok</div>';
      } else {
        h += '<div class="hasil">';
        h += '<div class="hd2">📋 ' + st.searchResults.length + ' materi cocok — klik untuk membuka:</div>';
        st.searchResults.forEach(function(x) {
          h += '<button class="it" data-pick="' + x.idx + '"><span class="num">' + (x.idx+1) + '.</span>' + hl(x.d.nama, st.cari) + ' <span class="st">— ' + hl(x.d.grup || "", st.cari) + '</span></button>';
        });
        h += '</div>';
      }
    } else if (st.viewMode === "empty") {
      h += '<div class="msg" style="opacity:.6; background:transparent; border:none; margin-top:30px;">Silakan pilih materi tajwid pada menu di atas,<br>atau pilih "Pilih Semua (Scroll)" untuk melihat seluruh materi.</div>';
    } else if (st.viewMode === "all") {
      for (var i = 0; i < st.list.length; i++) {
        h += renderCard(st.list[i]);
      }
    } else if (st.viewMode === "single" && st.selectedIdx >= 0) {
      h += renderCard(st.list[st.selectedIdx]);
    }

    h += '</div>'; 
    h += '<div class="bot"></div>'; 
    h += '</div>'; 

    app.innerHTML = h;

    if (st._focusCari) {
      var inp = document.getElementById("cari");
      if (inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (x) {} }
      st._focusCari = false;
    }
  }

  app.addEventListener("input", function (e) {
    if (e.target.id === "cari") {
      st.cari = e.target.value;
      st._focusCari = true;
      render();
    }
  });

  app.addEventListener("change", function (e) {
    if (e.target.id === "sel") {
      var val = e.target.value;
      st.cari = ""; 
      if (val === "empty") { st.viewMode = "empty"; st.selectedIdx = -1; }
      else if (val === "all") { st.viewMode = "all"; st.selectedIdx = -1; }
      else { st.viewMode = "single"; st.selectedIdx = +val; }
      render();
      var mid = app.querySelector(".mid");
      if (mid) mid.scrollTop = 0;
    }
  });

  app.addEventListener("click", function (e) {
    var t = e.target;
    var pick = t.closest && t.closest("[data-pick]");
    if (pick) {
      var idx = +pick.getAttribute("data-pick");
      st.viewMode = "single"; 
      st.selectedIdx = idx;
      st.cari = ""; 
      render();
      var mid = app.querySelector(".mid");
      if (mid) mid.scrollTop = 0;
      return;
    }
  });

  render(); // Langsung render karena data sudah ada
})();
