/* Shared JS Mesin Khutbah */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // Daftar Kategori (Lengkap dengan Khutbah Haji)
  var KATEGORI = [
    { label: "Khutbah Idul Fitri", key: "Khutbah Idul Fitri" },
    { label: "Khutbah Idul Adha", key: "Khutbah Idul Adha" },
    { label: "Khutbah Jumat", key: "Khutbah Jumat" },
    { label: "Khutbah Haji", key: "Khutbah Haji" },
    { label: "Khutbah Nikah", key: "Khutbah Nikah" }
  ];

  // === TEKS STANDAR KHUTBAH (OTOMATIS) ===
  var SALAM_1 = "السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ. إِنَّ الْحَمْدَ لِلّٰهِ نَحْمَدُهُ وَنَسْتَعِيْنُهُ وَنَسْتَغْفِرُهُ. وَنَعُوْذُ بِاللّٰهِ مِنْ شُرُوْرِ أَنْفُسِنَا وَمِنْ سَيِّئَاتِ أَعْمَالِنَا. مَنْ يَهْدِهِ اللّٰهُ فَلَا مُضِلَّ لَهُ وَمَنْ يُضْلِلْ فَلَا هَادِيَ لَهُ. أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُوْلُ اللّٰهِ. اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِيْنَ. أَمَّا بَعْدُ، فَيَا عِبَادَ اللّٰهِ، أُوْصِيْكُمْ وَنَفْسِيْ بِتَقْوَى اللّٰهِ.\n\n";
  var TR_SALAM_1 = "Assalamu'alaikum warahmatullahi wabarakatuh. Sesungguhnya segala puji bagi Allah, kami memuji-Nya, memohon pertolongan dan ampunan-Nya. Kami berlindung kepada Allah dari keburukan diri kami dan kejelekan amal perbuatan kami. Barangsiapa yang diberi petunjuk oleh Allah, maka tidak ada yang dapat menyesatkannya. Aku bersaksi tiada Tuhan selain Allah dan Muhammad adalah Rasul-Nya. Ya Allah, limpahkanlah shalawat kepada Nabi Muhammad beserta keluarga dan sahabatnya. Amma ba'du, wahai hamba Allah, aku berwasiat kepada kalian dan diriku untuk bertakwa kepada Allah.\n\n";
  
  var SALAM_2 = "اَلْحَمْدُ لِلّٰهِ الَّذِيْ هَدَانَا لِهَذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلَا أَنْ هَدَانَا اللّٰهُ. أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُوْلُ اللّٰهِ. اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِيْنَ. أَمَّا بَعْدُ، فَيَا عِبَادَ اللّٰهِ، اِتَّقُوا اللّٰهَ حَقَّ تُقَاتِهِ.\n\n";
  var TR_SALAM_2 = "Segala puji bagi Allah yang telah memberi petunjuk kepada kami... Amma ba'du, wahai hamba-hamba Allah, bertakwalah kepada Allah dengan sebenar-benarnya takwa.\n\n";

  var DOA_PENUTUP = "\n\nاَللّٰهُمَّ اغْفِرْ لِلْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ، وَالْمُؤْمِنِيْنَ وَالْمُؤْمِنَاتِ، اَلْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. وَالسَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ.";
  var TR_DOA_PENUTUP = "\n\nYa Allah, ampunilah kaum muslimin dan muslimat... Wassalamu'alaikum warahmatullahi wabarakatuh.";
  // =======================================

  var st = { katIdx: 0, topikIdx: 0, cari: "", _focusCari: false, loading: false, jumpTo: null };
  var BASE_URL = "https://teamkeringat.github.io/Data/"; 

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function hl(text, q) {
    text = String(text || ""); 
    if (!q) return esc(text);
    var t = text.toLowerCase(), ql = q.toLowerCase(), i = 0, out = "", idx;
    while ((idx = t.indexOf(ql, i)) > -1) {
      out += esc(text.slice(i, idx)); 
      out += '<span class="hl">' + esc(text.slice(idx, idx + q.length)) + "</span>"; 
      i = idx + q.length; 
    }
    return out + esc(text.slice(i));
  }

  function loadData() {
    st.loading = true;
    render(); 
    var oldScript = document.getElementById("data-khutbah-script");
    if (oldScript) oldScript.remove();
    var script = document.createElement("script");
    script.id = "data-khutbah-script";
    script.src = BASE_URL + "Khutbah.js?v=" + new Date().getTime(); 
    script.onload = function () { st.loading = false; render(); };
    script.onerror = function () { st.loading = false; render(); alert("Gagal memuat file: Data/Khutbah.js"); };
    document.body.appendChild(script);
  }

  function getActiveBab() {
    if (!window.KONTEN) return null;
    var key = KATEGORI[st.katIdx].key;
    if (!window.KONTEN[key] || !window.KONTEN[key].bab) return null;
    return window.KONTEN[key].bab;
  }

  function getSearchResults(q) {
    var babList = getActiveBab();
    if (!babList || !q) return [];
    var res = [], lowerQ = q.toLowerCase();
    babList.forEach(function(b, bIdx) {
      if (b.judul && b.judul.toLowerCase().indexOf(lowerQ) > -1) {
        res.push({ type: "judul", b: bIdx, text: b.judul, label: "📌 Judul: " + b.judul });
      }
      b.isi.forEach(function(item, iIdx) {
        if (item.ar && item.ar.indexOf(lowerQ) > -1) {
          res.push({ type: "isi", b: bIdx, i: iIdx, text: item.ar, label: "Arab: " + item.ar });
        }
        if (item.tr && item.tr.toLowerCase().indexOf(lowerQ) > -1) {
          res.push({ type: "isi", b: bIdx, i: iIdx, text: item.tr, label: "Terjemah: " + item.tr });
        }
      });
    });
    return res;
  }

  function render() {
    var h = '<div class="w"><div class="top">';
    
    h += '<div class="bar" style="margin-bottom:8px;">';
    h += '<input id="cari" type="text" placeholder="Cari teks khutbah..." value="' + esc(st.cari) + '" style="width:100%;">';
    h += '</div>';

    h += '<div class="bar">';
    h += '<select id="sel-kat" style="flex:1; width:50%; min-width:0;">';
    KATEGORI.forEach(function(k, idx) {
      h += '<option value="' + idx + '"' + (st.katIdx === idx ? " selected" : "") + '>' + esc(k.label) + '</option>';
    });
    h += '</select>';
    
    h += '<select id="sel-topik" style="flex:1; width:50%; min-width:0;">';
    var babList = getActiveBab();
    if (babList) {
      babList.forEach(function(b, idx) {
        h += '<option value="' + idx + '"' + (st.topikIdx === idx ? " selected" : "") + '>' + esc(b.judul) + '</option>';
      });
    }
    h += '</select>';
    h += '</div></div>'; 

    h += '<div class="mid">';
    if (st.loading) {
      h += '<div class="msg">Memuat data khutbah...</div>';
    } else if (!babList || babList.length === 0) {
      h += '<div class="msg">Data kosong atau file belum di-upload.</div>';
    } else {
      var q = st.cari.toLowerCase().trim();
      var currentBab = babList[st.topikIdx];

      if (q) {
        var results = getSearchResults(q);
        if (!results.length) {
          h += '<div class="msg">😕 Tidak ada teks yang cocok dengan "' + esc(st.cari) + '"</div>';
        } else {
          h += '<div class="hasil" style="background:rgba(0,0,0,.35); border:1px solid #c9b86a; border-radius:12px; padding:8px;">';
          h += '<div class="hd2" style="font-size:.8rem; opacity:.75; padding:2px 8px 6px;">📋 ' + results.length + ' hasil ditemukan:</div>';
          results.forEach(function(r) {
            var cleanLabel = r.label.replace(/\n/g, ' ');
            if (cleanLabel.length > 80) cleanLabel = cleanLabel.substring(0, 80) + "...";
            h += '<button class="it" data-pick="' + r.b + '" data-sub="' + (r.i !== undefined ? r.i : "") + '" style="display:block; width:100%; text-align:left; padding:8px 10px; border-radius:8px; border:0; background:transparent; color:inherit; cursor:pointer; font-size:.95rem; line-height:1.4; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:4px;">';
            h += hl(cleanLabel, q) + '</button>';
          });
          h += '</div>';
        }
      } else {
        if (!currentBab) {
          h += '<div class="msg">Silakan pilih judul khutbah.</div>';
        } else {
          h += '<div class="card" id="bab-0" style="margin-bottom:8px; background:rgba(201,184,106,0.1); border-color:#c9b86a;">';
          h += '<div class="nm" style="color:#c9b86a;">' + esc(currentBab.judul) + '</div></div>';

          currentBab.isi.forEach(function(item, iIdx) {
            h += '<div class="card" id="ay-0-' + iIdx + '">';
            var arText = item.ar;
            var trText = item.tr;
            if (iIdx === 0) { arText = SALAM_1 + arText; trText = TR_SALAM_1 + trText; } 
            else if (iIdx === 1) { arText = SALAM_2 + arText + DOA_PENUTUP; trText = TR_SALAM_2 + trText + TR_DOA_PENUTUP; }
            if (arText) h += '<div class="ar">' + esc(arText) + '</div>';
            if (trText) h += '<div class="tr" style="white-space:pre-wrap; margin-top:10px;">' + esc(trText) + '</div>';
            h += '</div>';
          });
        }
      }
    }
    h += '</div><div class="bot"></div></div>'; 
    app.innerHTML = h;

    if (st.jumpTo) {
      var targetId = st.jumpTo.i !== "" ? 'ay-0-' + st.jumpTo.i : 'bab-0';
      var el = document.getElementById(targetId);
      if (el) {
        setTimeout(function() {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.transition = "background 0.5s"; el.style.background = "rgba(201,184,106,0.6)"; 
          setTimeout(function() { el.style.background = ""; }, 1500);
        }, 100);
      }
      st.jumpTo = null;
    }
    if (st._focusCari) {
      var inp = document.getElementById("cari");
      if (inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (x) {} }
      st._focusCari = false;
    }
  }

  app.addEventListener("input", function(e) { if (e.target.id === "cari") { st.cari = e.target.value; st._focusCari = true; render(); } });
  app.addEventListener("change", function(e) {
    if (e.target.id === "sel-kat") { st.katIdx = +e.target.value; st.topikIdx = 0; st.cari = ""; render(); }
    if (e.target.id === "sel-topik") { st.topikIdx = +e.target.value; st.cari = ""; render(); }
  });
  app.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-pick]");
    if (btn) {
      st.topikIdx = +btn.getAttribute("data-pick");
      st.jumpTo = { b: st.topikIdx, i: btn.getAttribute("data-sub") };
      st.cari = ""; render();     
    }
  });

  loadData();
})();
