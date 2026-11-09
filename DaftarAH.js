/* Shared JS Mesin Asmaul Husna */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // Default: 0 (99 Asmaul Husna)
  var st = { data: null, selectedBabIdx: 0, cari: "", _focusCari: false, loading: false, jumpTo: null };
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
    var oldScript = document.getElementById("data-asma-script");
    if (oldScript) oldScript.remove();
    var script = document.createElement("script");
    script.id = "data-asma-script";
    script.src = BASE_URL + "AsmaulHusna.js?v=" + new Date().getTime(); 
    script.onload = function () { 
      st.loading = false; 
      if (window.KONTEN && window.KONTEN["Asmaul Husna"]) {
        st.data = window.KONTEN["Asmaul Husna"];
      }
      render(); 
    };
    script.onerror = function () { st.loading = false; render(); alert("Gagal memuat file: Data/AsmaulHusna.js"); };
    document.body.appendChild(script);
  }

  function render() {
    var h = '<div class="w"><div class="top">';
    
    // --- TOP BAR (KIRI: SELECT, KANAN: CARI) ---
    if (st.data && st.data.bab) {
      h += '<div class="bar">';
      // Kiri: Dropdown Pilih Judul
      h += '<select id="sel-bab" style="flex:1; width:50%; min-width:0;">';
      st.data.bab.forEach(function(b, idx) {
        h += '<option value="' + idx + '"' + (st.selectedBabIdx === idx ? " selected" : "") + '>' + esc(b.judul) + '</option>';
      });
      h += '</select>';
      
      // Kanan: Kotak Cari
      h += '<input id="cari" type="text" placeholder="Cari..." value="' + esc(st.cari) + '" style="flex:1; width:50%; min-width:0;">';
      h += '</div>';
    }
    h += '</div>'; 

    // --- KONTEN TENGAH ---
    h += '<div class="mid">';
    
    if (st.loading) {
      h += '<div class="msg">Memuat data Asmaul Husna...</div>';
    } else if (!st.data || !st.data.bab) {
      h += '<div class="msg">Data kosong atau file belum di-upload.</div>';
    } else {
      var q = st.cari.toLowerCase().trim();

      // 1. MODE PENCARIAN (Semua Bab Dicari)
      if (q) {
        var hasil = [];
        st.data.bab.forEach(function(bab, bIdx) {
          bab.isi.forEach(function(item, iIdx) {
            var pool = [(item.ar||""), (item.tr||""), (item.arti||"")].join(" ").toLowerCase();
            if (pool.indexOf(q) > -1) {
              hasil.push({ bab: bab, bIdx: bIdx, item: item, iIdx: iIdx });
            }
          });
        });
        
        if (hasil.length === 0) {
          h += '<div class="msg">😕 Tidak ada teks yang cocok dengan "' + esc(st.cari) + '"</div>';
        } else {
          h += '<div class="hasil" style="background:rgba(0,0,0,.35); border:1px solid #c9b86a; border-radius:12px; padding:8px;">';
          h += '<div class="hd2" style="font-size:.8rem; opacity:.75; padding:2px 8px 6px;">📋 ' + hasil.length + ' hasil ditemukan — klik untuk membuka:</div>';
          
          hasil.forEach(function(r) {
            var label = (r.item.no ? r.item.no + ". " : "") + (r.item.tr || r.item.arti || "Teks");
            var cleanLabel = label.replace(/\n/g, ' ');
            if (cleanLabel.length > 80) cleanLabel = cleanLabel.substring(0, 80) + "...";
            
            h += '<button class="it" data-bab="' + r.bIdx + '" data-item="' + r.iIdx + '" style="display:block; width:100%; text-align:left; padding:8px 10px; border-radius:8px; border:0; background:transparent; color:inherit; cursor:pointer; font-size:.95rem; line-height:1.4; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:4px;">';
            h += '<span style="font-size:.75rem; color:#c9b86a; display:block; margin-bottom:2px;">' + esc(r.bab.judul) + '</span>';
            h += hl(cleanLabel, q);
            h += '</button>';
          });
          h += '</div>';
        }
      } 
      // 2. MODE NORMAL (Tampilkan Bab yang Dipilih)
      else {
        var currentBab = st.data.bab[st.selectedBabIdx];

        if (!currentBab) {
          h += '<div class="msg">Silakan pilih judul di atas.</div>';
        } else {
          // Judul Bab
          h += '<div class="card" id="bab-head" style="margin-bottom:8px; background:rgba(201,184,106,0.1); border-color:#c9b86a;">';
          h += '<div class="nm" style="color:#c9b86a;">' + esc(currentBab.judul) + '</div></div>';

          // Isi Bab
          currentBab.isi.forEach(function(item, iIdx) {
            // === LAYOUT KHUSUS 99 ASMAUL HUSNA ===
            if (currentBab.judul === "99 Asmaul Husna") {
              h += '<div class="card" id="item-' + iIdx + '" style="padding:12px;">';
              h += '<div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">';
              // Kiri: Nomor + Latin + Arti (Bertumpuk)
              h += '<div style="flex:1; min-width:0;">';
              h += '<div style="font-weight:700; font-size:1rem; color:#e6ecdc;">' + item.no + '. ' + esc(item.tr) + '</div>';
              h += '<div style="color:#c9b86a; font-size:.9rem; margin-top:6px; font-weight:600;">' + esc(item.arti) + '</div>';
              h += '</div>';
              // Kanan: Teks Arab (Sendiri)
              h += '<div class="ar" style="margin:0; text-align:right; font-size:calc(26px * var(--z,1)); flex-shrink:0; max-width:50%;">' + esc(item.ar) + '</div>';
              h += '</div>';
              h += '</div>';
            } 
            // === LAYOUT BAB LAIN (Dalil, Qoshidah, Doa) ===
            else {
              h += '<div class="card" id="item-' + iIdx + '" style="display:flex; flex-direction:column; gap:5px; padding:10px;">';
              h += '<div class="ar" style="margin:5px 0;">' + esc(item.ar) + '</div>';
              h += '<div class="lt" style="font-style:italic; margin-bottom:5px;">' + esc(item.tr) + '</div>';
              h += '<div class="tr" style="font-weight:bold;">' + esc(item.arti) + '</div>';
              h += '</div>';
            }
          });
        }
      }
    }
    
    h += '</div><div class="bot"></div></div>'; 
    app.innerHTML = h;

    // --- LOGIKA LOMPAT KE TEKS YANG DIKLIK ---
    if (st.jumpTo) {
      var el = document.getElementById('item-' + st.jumpTo.i);
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

  // --- EVENT LISTENERS ---
  app.addEventListener("input", function(e) {
    if (e.target.id === "cari") {
      st.cari = e.target.value;
      st._focusCari = true;
      render();
    }
  });

  app.addEventListener("change", function(e) {
    if (e.target.id === "sel-bab") {
      st.selectedBabIdx = +e.target.value;
      st.cari = ""; 
      render();
    }
  });

  app.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-bab]");
    if (btn) {
      var bIdx = +btn.getAttribute("data-bab");
      var iIdx = btn.getAttribute("data-item");
      
      st.selectedBabIdx = bIdx;
      st.jumpTo = { i: iIdx };
      st.cari = ""; 
      render(); 
    }
  });

  loadData();
})();
