/* Shared JS Mesin Asmaul Husna */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  var st = { data: null, cari: "", _focusCari: false, loading: false };
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
    // Tetap memanggil file data dari folder Data/
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
    
    h += '<div class="bar" style="margin-bottom:8px;">';
    h += '<input id="cari" type="text" placeholder="Cari Asmaul Husna..." value="' + esc(st.cari) + '" style="width:100%;">';
    h += '</div></div>'; 

    h += '<div class="mid">';
    
    if (st.loading) {
      h += '<div class="msg">Memuat data Asmaul Husna...</div>';
    } else if (!st.data || !st.data.bab) {
      h += '<div class="msg">Data kosong atau file belum di-upload.</div>';
    } else {
      var q = st.cari.toLowerCase().trim();

      if (q) {
        var hasil = [];
        st.data.bab.forEach(function(bab) {
          bab.isi.forEach(function(item) {
            var pool = [(item.ar||""), (item.tr||""), (item.arti||"")].join(" ").toLowerCase();
            if (pool.indexOf(q) > -1) hasil.push(item);
          });
        });
        
        if (hasil.length === 0) {
          h += '<div class="msg">😕 Tidak ada Asma yang cocok dengan "' + esc(st.cari) + '"</div>';
        } else {
          h += '<div class="card" style="margin-bottom:8px; background:rgba(201,184,106,0.1); border-color:#c9b86a;">';
          h += '<div class="nm" style="color:#c9b86a;">Hasil Pencarian (' + hasil.length + ')</div></div>';
          
          hasil.forEach(function(item) {
            h += '<div class="card">';
            if(item.no) h += '<div class="nm" style="font-size:1rem; margin-bottom:5px;">' + item.no + '. ' + hl(item.tr, st.cari) + '</div>';
            else h += '<div class="nm" style="font-size:1rem; margin-bottom:5px;">' + hl(item.tr, st.cari) + '</div>';
            h += '<div class="ar" style="margin:5px 0;">' + esc(item.ar) + '</div>';
            h += '<div class="tr" style="font-weight:bold; color:#c9b86a;">' + hl(item.arti, st.cari) + '</div>';
            h += '</div>';
          });
        }
      } else {
        st.data.bab.forEach(function(bab) {
          h += '<div class="card" style="background:rgba(201,184,106,0.1); border-color:#c9b86a; margin-bottom:10px; margin-top:10px;">';
          h += '<div class="nm" style="color:#c9b86a;">' + esc(bab.judul) + '</div></div>';

          bab.isi.forEach(function(item) {
            h += '<div class="card" style="display:flex; flex-direction:column; gap:5px; padding:10px;">';
            
            if (bab.judul === "99 Asmaul Husna") {
              h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
              h += '<div class="nm" style="font-size:1rem;">' + item.no + '. ' + esc(item.tr) + '</div>';
              h += '<div style="font-weight:bold; color:#c9b86a; font-size:.9rem;">' + esc(item.arti) + '</div>';
              h += '</div>';
              h += '<div class="ar" style="margin:0; font-size:calc(24px * var(--z,1));">' + esc(item.ar) + '</div>';
            } else {
              h += '<div class="ar" style="margin:5px 0;">' + esc(item.ar) + '</div>';
              h += '<div class="lt" style="font-style:italic; margin-bottom:5px;">' + esc(item.tr) + '</div>';
              h += '<div class="tr" style="font-weight:bold;">' + esc(item.arti) + '</div>';
            }
            h += '</div>';
          });
        });
      }
    }
    
    h += '</div><div class="bot"></div></div>'; 
    app.innerHTML = h;

    if (st._focusCari) {
      var inp = document.getElementById("cari");
      if (inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (x) {} }
      st._focusCari = false;
    }
  }

  app.addEventListener("input", function(e) {
    if (e.target.id === "cari") {
      st.cari = e.target.value;
      st._focusCari = true;
      render();
    }
  });

  loadData();
})();
