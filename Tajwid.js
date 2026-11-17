/* Shared JS Ilmu Tajwid - FINAL (tanpa duplikasi) */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  var dataTajwid = [
    // ---------- DASAR ----------
    {
      nama: "Pengertian Ilmu Tajwid",
      grup: "Dasar",
      ar: "التَّجْوِيدُ",
      tr: "At-Tajwid",
      arti: "Ilmu Tajwid adalah ilmu yang mempelajari cara melafalkan huruf-huruf Al-Qur'an dengan benar, sesuai dengan makhraj dan sifat-sifatnya, agar terhindar dari kesalahan yang dapat mengubah makna.",
      tentang: "Hukum mempelajarinya Fardhu Kifayah, mengamalkannya Fardhu 'Ain."
    },
    {
      nama: "Hukum Mempelajari Ilmu Tajwid",
      grup: "Dasar",
      ar: "حُكْمُ تَعَلُّمِ التَّجْوِيدِ",
      tr: "Hukum Ta'allum At-Tajwid",
      arti: "Mempelajari tajwid secara teori Fardhu Kifayah; mengamalkannya Fardhu 'Ain bagi setiap pembaca Al-Qur'an.",
      tentang: "Dalil: QS. Al-Muzzammil: 4 — bacalah Al-Qur'an dengan tartil."
    },

    // ---------- NUN SUKUN & TANWIN ----------
    {
      nama: "Idzhar Halqi",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِظْهَارُ الْحَلْقِيُّ",
      tr: "Idzhar Halqi",
      arti: "Membaca nun sukun atau tanwin dengan jelas tanpa dengung ketika bertemu huruf halqi: ء, ه, ع, ح, غ, خ.",
      tentang: "Contoh: مِنْ هَادٍ (Min Haadin)."
    },
    {
      nama: "Idgham Bighunnah",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِدْغَامُ بِغُنَّةٍ",
      tr: "Idgham Bighunnah",
      arti: "Nun sukun atau tanwin bertemu ي, ن, م, و dibaca melebur disertai dengung 2 harakat.",
      tentang: "Contoh: مَنْ يَعْمَلْ (May Ya'mal)."
    },
    {
      nama: "Idgham Bilaghunnah",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِدْغَامُ بِلَا غُنَّةٍ",
      tr: "Idgham Bilaghunnah",
      arti: "Nun sukun atau tanwin bertemu ل dan ر dibaca melebur tanpa dengung.",
      tentang: "Contoh: مِنْ رَبِّهِمْ (Mir Rabbihim)."
    },
    {
      nama: "Iqlab",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِقْلَابُ",
      tr: "Iqlab",
      arti: "Nun sukun atau tanwin bertemu ب berubah menjadi mim dan dibaca dengung 2 harakat.",
      tentang: "Contoh: سَمِيعٌ بَصِيرٌ (Sami'um Bashir)."
    },
    {
      nama: "Ikhfa Haqiqi",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْإِخْفَاءُ الْحَقِيقِيُّ",
      tr: "Ikhfa Haqiqi",
      arti: "Nun sukun atau tanwin bertemu 15 huruf ikhfa dibaca samar antara jelas dan lebur, disertai dengung 2 harakat.",
      tentang: "Contoh: مِنْ قَبْلِ (Min Qabli)."
    },
    {
      nama: "Ghunnah Musyaddadah",
      grup: "Nun Sukun & Tanwin",
      ar: "اَلْغُنَّةُ الْمُشَدَّدَةُ",
      tr: "Ghunnah Musyaddadah",
      arti: "Membaca nun (نّ) atau mim (مّ) bertasydid dengan dengung ditahan 2-3 harakat dari rongga hidung (khaisyum).",
      tentang: "Contoh: إِنَّ (Inna), ثُمَّ (Tsumma), جَهَنَّمَ (Jahannam)."
    },

    // ---------- MIM SUKUN ----------
    {
      nama: "Idzhar Syafawi",
      grup: "Mim Sukun",
      ar: "اَلْإِظْهَارُ الشَّفَوِيُّ",
      tr: "Idzhar Syafawi",
      arti: "Mim sukun dibaca jelas di bibir tanpa dengung ketika bertemu selain Mim dan Ba.",
      tentang: "Contoh: هُمْ فِيهَا (Hum Fiha)."
    },
    {
      nama: "Ikhfa Syafawi",
      grup: "Mim Sukun",
      ar: "اَلْإِخْفَاءُ الشَّفَوِيُّ",
      tr: "Ikhfa Syafawi",
      arti: "Mim sukun bertemu ب dibaca samar di bibir disertai dengung 2 harakat.",
      tentang: "Contoh: تَرْمِيهِمْ بِحِجَارَةٍ (Tarmihim Bihijarah)."
    },
    {
      nama: "Idgham Mimi",
      grup: "Mim Sukun",
      ar: "اَلْإِدْغَامُ الْمِيمِيُّ",
      tr: "Idgham Mimi",
      arti: "Mim sukun bertemu م dibaca melebur dengan dengung sempurna.",
      tentang: "Contoh: لَكُمْ مَّا (Lakum Maa)."
    },

    // ---------- HUKUM LAM ----------
    {
      nama: "Lam Qamariyah",
      grup: "Hukum Lam",
      ar: "اَللَّامُ الْقَمَرِيَّةُ",
      tr: "Lam Qamariyah",
      arti: "Lam pada 'al' dibaca jelas ketika bertemu huruf qamariyah.",
      tentang: "Contoh: الْقَمَرُ (Al-Qamar)."
    },
    {
      nama: "Lam Syamsiyah",
      grup: "Hukum Lam",
      ar: "اَللَّامُ الشَّمْسِيَّةُ",
      tr: "Lam Syamsiyah",
      arti: "Lam pada 'al' tidak dibaca dan huruf sesudahnya ditasydid.",
      tentang: "Contoh: الشَّمْسُ (Asy-Syams)."
    },

    // ---------- MAD ----------
    {
      nama: "Mad Thabi'i",
      grup: "Mad",
      ar: "اَلْمَدُّ الطَّبِيعِيُّ",
      tr: "Mad Thabi'i",
      arti: "Membaca panjang 2 harakat pada huruf mad yang tidak diikuti hamzah atau sukun.",
      tentang: "Contoh: قَالَ (Qaala)."
    },
    {
      nama: "Mad Wajib Muttashil",
      grup: "Mad",
      ar: "اَلْمَدُّ الْوَاجِبُ الْمُتَّصِلُ",
      tr: "Mad Wajib Muttashil",
      arti: "Membaca panjang 4-5 harakat karena huruf mad bertemu hamzah dalam satu kata.",
      tentang: "Contoh: وَالسَّمَاءِ (Wassamaa'i)."
    },
    {
      nama: "Mad Jaiz Munfasil",
      grup: "Mad",
      ar: "اَلْمَدُّ الْجَائِزُ الْمُنْفَصِلُ",
      tr: "Mad Jaiz Munfasil",
      arti: "Huruf mad bertemu hamzah di kata berbeda. Boleh dibaca 2, 4, atau 5 harakat.",
      tentang: "Contoh: بِمَا أُنْزِلَ (Bimaa Unzila)."
    },

    // ---------- QALQALAH ----------
    {
      nama: "Qalqalah Sugra",
      grup: "Qalqalah",
      ar: "اَلْقَلْقَلَةُ الصُّغْرَى",
      tr: "Qalqalah Sugra",
      arti: "Memantulkan huruf qalqalah (ق, ط, ب, ج, د) sukun di tengah kata dengan pantulan ringan.",
      tentang: "Contoh: يَقْطَعُونَ (Yaqtha'una)."
    },
    {
      nama: "Qalqalah Kubra",
      grup: "Qalqalah",
      ar: "اَلْقَلْقَلَةُ الْكُبْرَى",
      tr: "Qalqalah Kubra",
      arti: "Memantulkan huruf qalqalah dengan pantulan lebih kuat karena di akhir kata (waqaf).",
      tentang: "Contoh: مِنْ عَلَقٍ (Min 'Alaq)."
    }
  ];

  var st = { list: dataTajwid, cari: "", _focusCari: false, viewMode: "empty", selectedIdx: -1, searchResults: [] };

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
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
    var ar = d.ar || "", tr = d.tr || "", arti = d.arti || "", ref = d.tentang || "";
    if (ar) h += '<div class="ar" style="font-size:1.5em; text-align:right; margin:10px 0;">' + esc(ar) + '</div>';
    if (tr) h += '<div class="lt" style="font-weight:bold; margin-bottom:5px;">' + esc(tr) + '</div>';
    if (arti) h += '<div class="tr" style="margin-bottom:10px;">' + esc(arti) + '</div>';
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
      if (!st.searchResults.length) { h += '<div class="msg">😕 Tidak ada materi tajwid yang cocok</div>'; }
      else {
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
      for (var i = 0; i < st.list.length; i++) { h += renderCard(st.list[i]); }
    } else if (st.viewMode === "single" && st.selectedIdx >= 0) {
      h += renderCard(st.list[st.selectedIdx]);
    }
    h += '</div><div class="bot"></div></div>';
    app.innerHTML = h;
    if (st._focusCari) {
      var inp = document.getElementById("cari");
      if (inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (x) {} }
      st._focusCari = false;
    }
  }

  app.addEventListener("input", function (e) { if (e.target.id === "cari") { st.cari = e.target.value; st._focusCari = true; render(); } });
  app.addEventListener("change", function (e) {
    if (e.target.id === "sel") {
      var val = e.target.value; st.cari = "";
      if (val === "empty") { st.viewMode = "empty"; st.selectedIdx = -1; }
      else if (val === "all") { st.viewMode = "all"; st.selectedIdx = -1; }
      else { st.viewMode = "single"; st.selectedIdx = +val; }
      render();
      var mid = app.querySelector(".mid"); if (mid) mid.scrollTop = 0;
    }
  });
  app.addEventListener("click", function (e) {
    var t = e.target;
    var pick = t.closest && t.closest("[data-pick]");
    if (pick) {
      var idx = +pick.getAttribute("data-pick");
      st.viewMode = "single"; st.selectedIdx = idx; st.cari = "";
      render();
      var mid = app.querySelector(".mid"); if (mid) mid.scrollTop = 0;
    }
  });

  render();
})();
