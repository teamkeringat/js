/* Shared JS Mesin Khutbah (Kategori & Topik) */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // Daftar Kategori
  var KATEGORI = [
    { label: "Khutbah Idul Fitri", key: "Khutbah Idul Fitri" },
    { label: "Khutbah Idul Adha", key: "Khutbah Idul Adha" },
    { label: "Khutbah Nikah", key: "Khutbah Nikah" }
  ];

  var st = { katIdx: 0, topikIdx: 0, cari: "", _focusCari: false, loading: false, jumpTo: null };
  var BASE_URL = "https://teamkeringat.github.io/Data/"; 

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // Highlight teks
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
    
    script.onload = function () {
      st.loading = false;
      render();
    };
    
    script.onerror = function () {
      st.loading = false;
      render();
      alert("Gagal memuat file: Data/Khutbah.js");
    };
    
    document.body.appendChild(script);
  }

  // Ambil data topik aktif
  function getActiveBab() {
    if (!window.KONTEN) return null;
    var key = KATEGORI[st.katIdx].key;
    if (!window.KONTEN[key] || !window.KONTEN[key].bab) return null;
    return window.KONTEN[key].bab;
  }

  // Fungsi pencarian
  function getSearchResults(q) {
    var babList = getActiveBab();
    if (!babList || !q) return [];
    
    var res = [];
    q = q.toLowerCase();
    
    babList.forEach(function(b, bIdx) {
      // Cari Judul Topik
      if (b.judul && b.judul.toLowerCase().indexOf(q) > -1) {
        res.push({ type: "judul", b: bIdx, text: b.judul, label: "📌 Judul: " + b.judul });
      }
      // Cari Isi Teks
      b.isi.forEach(function(item, iIdx) {
        if (item.ar && item.ar.indexOf(q) > -1) {
          res.push({ type: "isi", b: bIdx, i: iIdx, text: item.ar, label: "Arab: " + item.ar });
        }
        if (item.tr && item.tr.toLowerCase().indexOf(q) > -1) {
          res.push({ type: "isi", b: bIdx, i: iIdx, text: item.tr, label: "Terjemah: " + item.tr });
        }
      });
    });
    return res;
  }

  function render() {
    var h = '<div class="w"><div class="top">';
    
    // --- BARIS 1: PENCARIAN ---
    h += '<div class="bar" style="margin-bottom:8px;">';
    h += '<input id="cari" type="text" placeholder="Cari teks khutbah..." value="' + esc(st.cari) + '" style="width:100%;">';
    h += '</div>';

    // --- BARIS 2: KATEGORI & TOPIK ---
    h += '<div class="bar">';
    
    // Dropdown Kiri (Kategori)
    h += '<select id="sel-kat" style="flex:1; width:50%; min-width:0;">';
    KATEGORI.forEach(function(k, idx) {
      h += '<option value="' + idx + '"' + (st.katIdx === idx ? " selected" : "") + '>' + esc(k.label) + '</option>';
    });
    h += '</select>';
    
    // Dropdown Kanan (Topik/Judul)
    h += '<select id="sel-topik" style="flex:1; width:50%; min-width:0;">';
    var babList = getActiveBab();
    if (babList) {
      babList.forEach(function(b, idx) {
        h += '<option value="' + idx + '"' + (st.topikIdx === idx ? " selected" : "") + '>' + esc(b.judul) + '</option>';
      });
    }
    h += '</select>';
    
    h += '</div></div>'; 

    // --- KONTEN AREA ---
    h += '<div class="mid">';
    
    if (st.loading) {
      h += '<div class="msg">Memuat data khutbah...</div>';
    } else if (!babList || babList.length === 0) {
      h += '<div class="msg">Data kosong atau file belum di-upload.</div>';
    } else {
      var q = st.cari.toLowerCase().trim();
      var currentBab = babList[st.topikIdx];

      // MODE PENCARIAN
      if (q) {
        var results = getSearchResults(q);
        if (!results.length) {
          h += '<div class="msg">😕 Tidak ada teks yang cocok dengan "' + esc(st.cari) + '"</div>';
        } else {
          h += '<div class="hasil" style="background:rgba(0,0,0,.35); border:1px solid #c9b86a; border-radius:12px; padding:8px;">';
          h += '<div class="hd2" style="font-size:.8rem; opacity:.75; padding:2px 8px 6px;">📋 ' + results.length + ' hasil ditemukan — klik untuk melompat:</div>';
          
          results.forEach(function(r) {
            var cleanLabel = r.label.replace(/\n/g, ' ');
            if (cleanLabel.length > 80) cleanLabel = cleanLabel.substring(0, 80) + "...";
            
            h += '<button class="it" data-pick="' + r.b + '" data-sub="' + (r.i !== undefined ? r.i : "") + '" style="display:block; width:100%; text-align:left; padding:8px 10px; border-radius:8px; border:0; background:transparent; color:inherit; cursor:pointer; font-size:.95rem; line-height:1.4; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:4px;">';
            h += hl(cleanLabel, q);
            h += '</button>';
          });
          h += '</div>';
        }
      } 
      // MODE NORMAL (TAMPILKAN TEKS)
      else {
        if (!currentBab) {
          h += '<div class="msg">Silakan pilih judul khutbah.</div>';
        } else {
          // Judul Topik
          h += '<div class="card" id="bab-0" style="margin-bottom:8px; background:rgba(201,184,106,0.1); border-color:#c9b86a;">';
          h += '<div class="nm" style="color:#c9b86a;">' + esc(currentBab.judul) + '</div>';
          h += '</div>';

          // Isi Teks
          currentBab.isi.forEach(function(item, iIdx) {
            h += '<div class="card" id="ay-0-' + iIdx + '">';
            if (item.ar) h += '<div class="ar">' + esc(item.ar) + '</div>';
            if (item.tr) h += '<div class="tr" style="white-space:pre-wrap; margin-top:10px;">' + esc(item.tr) + '</div>';
            h += '</div>';
          });
        }
      }
    }
    
    h += '</div>'; // tutup mid
    h += '<div class="bot"></div>'; 
    h += '</div>'; // tutup w

    app.innerHTML = h;

    // LOMPAT KE TEKS YANG DICARI
    if (st.jumpTo) {
      var targetId = st.jumpTo.i !== "" ? 'ay-0-' + st.jumpTo.i : 'bab-0';
      var el = document.getElementById(targetId);
      if (el) {
        setTimeout(function() {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.transition = "background 0.5s";
          el.style.background = "rgba(201,184,106,0.6)"; 
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

  // Events
  app.addEventListener("input", function(e) {
    if (e.target.id === "cari") {
      st.cari = e.target.value;
      st._focusCari = true;
      render();
    }
  });

  app.addEventListener("change", function(e) {
    if (e.target.id === "sel-kat") {
      st.katIdx = +e.target.value;
      st.topikIdx = 0; // Reset ke topik pertama saat ganti kategori
      st.cari = ""; 
      render();
    }
    if (e.target.id === "sel-topik") {
      st.topikIdx = +e.target.value;
      st.cari = "";
      render();
    }
  });

  app.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-pick]");
    if (btn) {
      var bIdx = +btn.getAttribute("data-pick");
      var subIdx = btn.getAttribute("data-sub"); 
      
      // Update topik jika hasil pencarian ada di topik yang berbeda
      if (st.topikIdx !== bIdx) {
        st.topikIdx = bIdx;
      }
      
      st.jumpTo = { b: bIdx, i: subIdx };
      st.cari = ""; 
      render();     
    }
  });

  // Muat data pertama kali
  loadData();
})();
