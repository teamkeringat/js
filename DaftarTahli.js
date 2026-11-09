/* Shared JS Mesin Tahlilan - Memanggil data dari folder /Data/ */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // Daftar pilihan Tahlil beserta nama filenya
  var MENU = [
    { label: "Tahlil Ringkas", file: "TahlilRingka.js" },
    { label: "Tahlil Lengkap", file: "TahlilLengkap.js" },
    { label: "Tahlil Majlis", file: "TahlilMajlis.js" },
    { label: "Doa Tahlil 1", file: "DoaTahlil1.js" },
    { label: "Doa Tahlil 2", file: "DoaTahlil2.js" },
    { label: "Doa Tahlil 3", file: "DoaTahlil3.js" },
    { label: "Doa Tahlil 4", file: "DoaTahlil4.js" },
    { label: "Doa Tahlil 5", file: "DoaTahlil5.js" },
    { label: "Doa Al-Fatihah 1", file: "DoaFatihahl1.js" },
    { label: "Doa Al-Fatihah 2", file: "DoaFatihahl2.js" },
    { label: "Doa Al-Fatihah 3", file: "DoaFatihahl3.js" }
  ];

  var st = { data: [], cari: "", _focusCari: false, selectedIdx: -1, loading: false };
  var BASE_URL = "https://teamkeringat.github.io/Data/";

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  
  // Fungsi untuk memuat file JS dari folder Data
  function loadFile(fileName, callback) {
    st.loading = true;
    render(); // Tampilkan loading
    
    // Hapus script lama jika ada (biar tidak bentrok)
    var oldScript = document.getElementById("data-tahlil-script");
    if (oldScript) oldScript.remove();
    
    // Buat script baru
    var script = document.createElement("script");
    script.id = "data-tahlil-script";
    // Tambahkan timestamp (?v=...) agar browser tidak menyimpan cache lama
    script.src = BASE_URL + fileName + "?v=" + new Date().getTime(); 
    
    script.onload = function () {
      st.loading = false;
      // Asumsi file di folder Data mendefinisikan variabel window.TAHLIL_DATA
      st.data = window.TAHLIL_DATA || [];
      if (callback) callback();
      render();
    };
    
    script.onerror = function () {
      st.loading = false;
      st.data = [];
      render();
      alert("Gagal memuat file: " + fileName + "\nPastikan file sudah di-upload ke folder Data/ di GitHub.");
    };
    
    document.body.appendChild(script);
  }

  function renderCard(item) {
    var h = '<div class="card">';
    
    if (item.judul) h += '<div class="nm">' + esc(item.judul) + '</div>';
    if (item.sub) h += '<div class="sub">' + esc(item.sub) + '</div>';
    
    var ar = item.arab || "";
    var tr = item.latin || "";
    var arti = item.arti || "";
    var ref = item.hadits || item.referensi || "";
    
    if (ar) h += '<div class="ar">' + esc(ar) + '</div>';
    if (tr) h += '<div class="lt">' + esc(tr) + '</div>';
    if (arti) h += '<div class="tr">' + esc(arti) + '</div>';
    if (ref) h += '<div class="tf on" style="background:transparent; padding:0; margin-top:10px; color:#c9bd8a; font-size: calc(.9rem * var(--z,1));">📚 ' + esc(ref) + '</div>';
    
    h += '</div>';
    return h;
  }

  function render() {
    var h = '<div class="w"><div class="top">';
    
    // Top Bar: Dropdown Kiri, Cari Kanan
    h += '<div class="bar">';
    
    // 1. Dropdown Tahlil
    h += '<select id="sel" style="flex:1; width:50%; min-width:0;">';
    h += '<option value=""' + (st.selectedIdx === -1 ? " selected" : "") + '>Pilih Tahlil...</option>';
    MENU.forEach(function(m, idx) {
      h += '<option value="' + idx + '"' + (st.selectedIdx === idx ? " selected" : "") + '>' + (idx+1) + '. ' + esc(m.label) + '</option>';
    });
    h += '</select>';
    
    // 2. Kotak Cari
    h += '<input id="cari" type="text" placeholder="Cari teks..." value="' + esc(st.cari) + '" style="flex:1; width:50%; min-width:0;">';
    
    h += '</div></div>'; // tutup top

    // Area Konten (Scroll)
    h += '<div class="mid">';
    
    if (st.loading) {
      h += '<div class="msg">Memuat data...</div>';
    } else if (st.selectedIdx === -1) {
      h += '<div class="msg" style="opacity:.6; background:transparent; border:none; margin-top:30px;">Silakan pilih salah satu Tahlil pada menu di atas.</div>';
    } else if (st.data.length === 0) {
      h += '<div class="msg">Data kosong atau file belum di-upload.</div>';
    } else {
      // Filter pencarian
      var q = st.cari.toLowerCase().trim();
      var filtered = st.data.filter(function(item) {
        if (!q) return true;
        var pool = [(item.judul||""), (item.latin||""), (item.arti||""), (item.arab||"")].join(" ").toLowerCase();
        return pool.indexOf(q) > -1;
      });

      if (filtered.length === 0) {
        h += '<div class="msg">😕 Tidak ada teks yang cocok.</div>';
      } else {
        filtered.forEach(function(item) {
          h += renderCard(item);
        });
      }
    }
    
    h += '</div>'; // tutup mid
    h += '<div class="bot"></div>'; // bot kosong
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
        st.data = [];
        render();
      } else {
        st.selectedIdx = +val;
        loadFile(MENU[st.selectedIdx].file);
      }
    }
  });

  // Render awal (kosong)
  render();
})();
