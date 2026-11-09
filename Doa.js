/* Shared JS Kumpulan Doa - EQuran.id API */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // Mode: "empty" (awal), "all" (semua), "single" (satu doa)
  var st = { list: [], cari: "", _focusCari: false, viewMode: "empty", selectedIdx: -1, searchResults: [] };

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function hl(text, q) {
    text = String(text || ""); if (!q) return esc(text);
    var t = text.toLowerCase(), ql = q.toLowerCase(), i = 0, out = "", idx;
    while ((idx = t.indexOf(ql, i)) > -1) { out += esc(text.slice(i, idx)); out += '<span class="hl">' + esc(text.slice(idx, idx + q.length)) + "</span>"; i = idx + q.length; }
    return out + esc(text.slice(i));
  }
  function msg(t) { app.innerHTML = '<div class="w"><div class="msg">' + t + "</div></div>"; }
  function gagal(e) { msg("Gagal memuat data (" + esc(e && e.message) + ").<br>Periksa koneksi internet, atau buka langsung di <a href='https://equran.id' target='_blank' rel='noopener'>equran.id</a>."); }

  // 1. Ambil Data
  function loadData() {
    msg("Memuat daftar doa...");
    fetch("https://equran.id/api/doa")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        st.list = j.data || j;
        if (!Array.isArray(st.list)) throw new Error("Format data tidak dikenal");
        render();
      }).catch(gagal);
  }

  // 2. Kartu Tampilan Doa
  function renderCard(d) {
    var h = '<div class="card">';
    h += '<div class="nm">' + esc(d.nama || d.judul) + '</div>';
    if (d.grup) h += '<div class="sub">' + esc(d.grup) + '</div>';
    
    var ar = d.ar || d.arab || "";
    var tr = d.tr || d.latin || "";
    var arti = d.arti || d.idn || "";
    var ref = d.tentang || d.referensi || "";
    
    // Tambahan style display:block !important agar tidak disembunyikan oleh mode "Arab Saja"
    if (ar) h += '<div class="ar">' + esc(ar) + '</div>';
    if (tr) h += '<div class="lt" style="display:block !important;">' + esc(tr) + '</div>';
    if (arti) h += '<div class="tr" style="display:block !important;">' + esc(arti) + '</div>';
    if (ref) h += '<div class="sub" style="margin-top:10px; opacity:.7; display:block !important;">📚 ' + esc(ref) + '</div>';
    
    h += '</div>';
    return h;
  }

  // 3. Render Tampilan Utama
  function render() {
    var h = '<div class="w"><div class="top">';
    
    // --- TOP BAR ---
    h += '<div class="bar">';
    
    // Dropdown Kiri
    h += '<select id="sel" style="flex:1; width:50%; min-width:0;">';
    h += '<option value="empty"' + (st.viewMode === "empty" ? " selected" : "") + '>Pilih Doa</option>';
    h += '<option value="all"' + (st.viewMode === "all" ? " selected" : "") + '>Pilih Semua (Scroll)</option>';
    
    st.list.forEach(function(d, idx) {
      var isSel = (st.viewMode === "single" && st.selectedIdx === idx) ? " selected" : "";
      h += '<option value="' + idx + '"' + isSel + '>' + (idx+1) + '. ' + esc(d.nama || d.judul) + '</option>';
    });
    h += '</select>';
    
    // Kotak Cari Kanan
    h += '<input id="cari" type="text" placeholder="Cari Doa..." value="' + esc(st.cari) + '" style="flex:1; width:50%; min-width:0;">';
    
    h += '</div></div>'; // tutup top

    // --- MIDDLE (Area Konten) ---
    h += '<div class="mid">';
    
    if (st.cari && st.cari.trim()) {
      // TAMPILAN PENCARIAN
      var q = st.cari.toLowerCase().trim();
      st.searchResults = st.list.map(function(d, idx) { return {d:d, idx:idx}; }).filter(function(x) {
        var pool = [(x.d.nama || x.d.judul || ""), (x.d.grup || ""), (x.d.arti || x.d.idn || "")].join(" ").toLowerCase();
        return pool.indexOf(q) > -1;
      });
      
      if (!st.searchResults.length) {
        h += '<div class="msg">😕 Tidak ada doa yang cocok</div>';
      } else {
        h += '<div class="hasil">';
        h += '<div class="hd2">📋 ' + st.searchResults.length + ' doa cocok — klik untuk membuka:</div>';
        st.searchResults.forEach(function(x) {
          h += '<button class="it" data-pick="' + x.idx + '"><span class="num">' + (x.idx+1) + '.</span>' + hl(x.d.nama || x.d.judul, st.cari) + ' <span class="st">— ' + hl(x.d.arti || x.d.idn || "", st.cari) + '</span></button>';
        });
        h += '</div>';
      }
    } else if (st.viewMode === "empty") {
      // TAMPILAN AWAL KOSONG
      h += '<div class="msg" style="opacity:.6; background:transparent; border:none; margin-top:30px;">Silakan pilih doa pada menu di atas,<br>atau pilih "Pilih Semua (Scroll)" untuk melihat seluruh doa.</div>';
    } else if (st.viewMode === "all") {
      // TAMPILAN SEMUA DOA (Scroll ke bawah)
      for (var i = 0; i < st.list.length; i++) {
        h += renderCard(st.list[i]);
      }
    } else if (st.viewMode === "single" && st.selectedIdx >= 0) {
      // TAMPILAN SATU DOA SAJA
      h += renderCard(st.list[st.selectedIdx]);
    }
    
    h += '</div>'; // tutup mid

    // --- BOTTOM BAR ---
    h += '<div class="bot"></div>'; // Kosong karena scroll sudah ditangani .mid

    h += '</div>'; // tutup w
    app.innerHTML = h;

    // Fokus kembali ke kotak pencarian
    if (st._focusCari) {
      var inp = document.getElementById("cari");
      if (inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (x) {} }
      st._focusCari = false;
    }
  }

  // 4. Event Handler
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
      st.cari = ""; // Reset pencarian jika dropdown diubah
      
      if (val === "empty") {
        st.viewMode = "empty";
        st.selectedIdx = -1;
      } else if (val === "all") {
        st.viewMode = "all";
        st.selectedIdx = -1;
      } else {
        st.viewMode = "single";
        st.selectedIdx = +val;
      }
      render();
      
      // Scroll ke paling atas
      var mid = app.querySelector(".mid");
      if (mid) mid.scrollTop = 0;
    }
  });

  app.addEventListener("click", function (e) {
    var t = e.target;
    
    // Aksi saat mengklik hasil pencarian
    var pick = t.closest && t.closest("[data-pick]");
    if (pick) {
      var idx = +pick.getAttribute("data-pick");
      st.viewMode = "single"; // Pindah ke mode tampil 1 doa
      st.selectedIdx = idx;
      st.cari = ""; // Tutup kotak pencarian
      render();
      
      var mid = app.querySelector(".mid");
      if (mid) mid.scrollTop = 0;
      return;
    }
  });

  // Jalankan
  loadData();
})();
