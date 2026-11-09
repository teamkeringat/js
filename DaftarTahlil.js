/* Shared JS Mesin Tahlil */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // Surat Yasin sudah dihapus. Langsung ke Tahlil Ringkas, dst.
  var MENU = [
    { label: "Tahlil Ringkas", file: "TahlilRingkas.js", key: "Tahlil Ringkas" },
    { label: "Tahlil Lengkap", file: "TahlilLengkap.js", key: "Tahlil Lengkap" },
    { label: "Tahlil Majlis", file: "TahlilMajlis.js", key: "Tahlil Majlis" },
    { label: "Doa Tahlil 1", file: "DoaTahlil1.js", key: "Doa Tahlil 1" },
    { label: "Doa Tahlil 2", file: "DoaTahlil2.js", key: "Doa Tahlil 2" },
    { label: "Doa Tahlil 3", file: "DoaTahlil3.js", key: "Doa Tahlil 3" },
    { label: "Doa Tahlil 4", file: "DoaTahlil4.js", key: "Doa Tahlil 4" },
    { label: "Doa Tahlil 5", file: "DoaTahlil5.js", key: "Doa Tahlil 5" },
    { label: "Doa Al-Fatihah 1", file: "DoaFatihah1.js", key: "Doa Al-Fatihah 1" },
    { label: "Doa Al-Fatihah 2", file: "DoaFatihah2.js", key: "Doa Al-Fatihah 2" },
    { label: "Doa Al-Fatihah 3", file: "DoaFatihah3.js", key: "Doa Al-Fatihah 3" }
  ];

  var st = { data: null, cari: "", _focusCari: false, selectedIdx: -1, loading: false };
  var BASE_URL = "https://teamkeringat.github.io/Data/"; 

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  
  function loadFile(fileName, keyName) {
    st.loading = true;
    render(); 
    
    var oldScript = document.getElementById("data-tahlil-script");
    if (oldScript) oldScript.remove();
    
    var script = document.createElement("script");
    script.id = "data-tahlil-script";
    script.src = BASE_URL + fileName + "?v=" + new Date().getTime(); 
    
    script.onload = function () {
      st.loading = false;
      // Membaca data dari variabel KONTEN (sesuai kesepakatan)
      if (window.KONTEN && window.KONTEN[keyName]) {
        st.data = window.KONTEN[keyName];
      } else {
        st.data = null;
      }
      render();
    };
    
    script.onerror = function () {
      st.loading = false;
      st.data = null;
      render();
      alert("Gagal memuat file: " + fileName + "\nPastikan file sudah di-upload ke folder Data/ di GitHub.");
    };
    
    document.body.appendChild(script);
  }

  function render() {
    var h = '<div class="w"><div class="top">';
    
    // Top Bar
    h += '<div class="bar">';
    
    // Dropdown
    h += '<select id="sel" style="flex:1; width:50%; min-width:0;">';
    h += '<option value=""' + (st.selectedIdx === -1 ? " selected" : "") + '>Pilih Tahlil...</option>';
    MENU.forEach(function(m, idx) {
      h += '<option value="' + idx + '"' + (st.selectedIdx === idx ? " selected" : "") + '>' + (idx+1) + '. ' + esc(m.label) + '</option>';
    });
    h += '</select>';
    
    // Kotak Cari
    h += '<input id="cari" type="text" placeholder="Cari teks..." value="' + esc(st.cari) + '" style="flex:1; width:50%; min-width:0;">';
    
    h += '</div></div>'; 

    // Konten Area
    h += '<div class="mid">';
    
    if (st.loading) {
      h += '<div class="msg">Memuat data...</div>';
    } else if (st.selectedIdx === -1) {
      h += '<div class="msg" style="opacity:.6; background:transparent; border:none; margin-top:30px;">Silakan pilih Tahlil atau Doa pada menu di atas.</div>';
    } else if (!st.data || !st.data.bab) {
      h += '<div class="msg">Data kosong atau file belum di-upload.</div>';
    } else {
      var q = st.cari.toLowerCase().trim();
      var adaHasil = false;

      st.data.bab.forEach(function(b) {
        var matchItems = [];
        
        b.isi.forEach(function(item) {
          var itemMatches = !q || 
                            (item.ar && item.ar.indexOf(q) > -1) || 
                            (item.tr && item.tr.toLowerCase().indexOf(q) > -1);
          
          if (itemMatches) {
            matchItems.push(item);
          }
        });

        if (matchItems.length > 0) {
          adaHasil = true;
          
          // Judul Bab
          h += '<div class="card" style="margin-bottom:8px; background:rgba(201,184,106,0.1); border-color:#c9b86a;">';
          h += '<div class="nm" style="color:#c9b86a;">' + esc(b.judul) + '</div>';
          h += '</div>';

          // Isi Teks
          matchItems.forEach(function(item) {
            h += '<div class="card">';
            if (item.ar) h += '<div class="ar">' + esc(item.ar) + '</div>';
            if (item.tr) h += '<div class="tr" style="white-space:pre-wrap; margin-top:10px;">' + esc(item.tr) + '</div>';
            h += '</div>';
          });
        }
      });

      if (q && !adaHasil) {
        h += '<div class="msg">😕 Tidak ada teks yang cocok dengan pencarian.</div>';
      }
    }
    
    h += '</div>'; // tutup mid
    h += '<div class="bot"></div>'; 
    h += '</div>'; // tutup w

    app.innerHTML = h;

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
    if (e.target.id === "sel") {
      var val = e.target.value;
      st.cari = "";
      if (val === "") {
        st.selectedIdx = -1;
        st.data = null;
        render();
      } else {
        st.selectedIdx = +val;
        var selected = MENU[st.selectedIdx];
        loadFile(selected.file, selected.key);
      }
    }
  });

  // Render awal
  render();
})();
