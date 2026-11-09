/* Shared JS Kumpulan Doa - EQuran.id API */
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  var st = { list: [], filtered: [], page: 0, cari: "", _focusCari: false };
  var PER = 10; // Tampilkan 10 doa per halaman

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function hl(text, q) {
    text = String(text || ""); if (!q) return esc(text);
    var t = text.toLowerCase(), ql = q.toLowerCase(), i = 0, out = "", idx;
    while ((idx = t.indexOf(ql, i)) > -1) { out += esc(text.slice(i, idx)); out += '<span class="hl">' + esc(text.slice(idx, idx + q.length)) + "</span>"; i = idx + q.length; }
    return out + esc(text.slice(i));
  }
  function msg(t) { app.innerHTML = '<div class="w"><div class="msg">' + t + "</div></div>"; }
  function gagal(e) { msg("Gagal memuat data (" + esc(e && e.message) + ").<br>Periksa koneksi internet, atau buka langsung di <a href='https://equran.id' target='_blank' rel='noopener'>equran.id</a>."); }

  // 1. Ambil Data dari API
  function loadData() {
    msg("Memuat daftar doa...");
    fetch("https://equran.id/api/doa")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        st.list = j.data || j;
        if (!Array.isArray(st.list)) throw new Error("Format data tidak dikenal");
        st.filtered = st.list;
        render();
      }).catch(gagal);
  }

  // 2. Filter Pencarian
  function applySearch() {
    var q = st.cari.toLowerCase().trim();
    if (!q) {
      st.filtered = st.list;
    } else {
      st.filtered = st.list.filter(function (d) {
        var pool = [(d.nama || d.judul || ""), (d.grup || ""), (d.arti || d.idn || "")].join(" ").toLowerCase();
        return pool.indexOf(q) > -1;
      });
    }
  }

  // 3. Render Tampilan (Top, Mid, Bot)
  function render() {
    applySearch();
    
    var total = st.filtered.length;
    var totPage = Math.ceil(total / PER) || 1;
    var a0 = st.page * PER;
    var a1 = Math.min(a0 + PER, total);
    var searching = st.cari && st.cari.trim();

    var h = '<div class="w"><div class="top">';
    
    // --- TOP BAR (1 Baris, 2 Kolom Sejajar) ---
    h += '<div class="bar">';
    
    // 1. Kiri: Dropdown Pilihan Doa
    h += '<select id="sel" style="flex:1; width:50%; min-width:0;">';
    if (searching && total > 0) {
      st.filtered.forEach(function(d) {
        var realIdx = st.list.indexOf(d);
        h += '<option value="' + realIdx + '">' + esc(d.nama || d.judul) + '</option>';
      });
    } else {
      st.list.forEach(function(d, idx) {
        var sel = (idx >= a0 && idx < a1) ? " selected" : "";
        h += '<option value="' + idx + '"' + sel + '>' + (idx+1) + '. ' + esc(d.nama || d.judul) + '</option>';
      });
    }
    h += '</select>';
    
    // 2. Kanan: Kotak Cari Doa
    h += '<input id="cari" type="text" placeholder="Cari Doa" value="' + esc(st.cari) + '" style="flex:1; width:50%; min-width:0;">';
    
    h += '</div>'; // tutup bar
    h += '</div>'; // tutup top

    // --- MIDDLE (Area Scroll) ---
    h += '<div class="mid">';
    if (total === 0) {
      h += '<div class="msg">😕 Tidak ada doa yang cocok</div>';
    } else {
      for (var i = a0; i < a1; i++) {
        var d = st.filtered[i];
        h += '<div class="card">';
        h += '<div class="nm">' + hl(d.nama || d.judul, st.cari) + '</div>';
        if (d.grup) h += '<div class="sub">' + esc(d.grup) + '</div>';
        
        var ar = d.ar || d.arab || "";
        var tr = d.tr || d.latin || "";
        var arti = d.arti || d.idn || "";
        var ref = d.tentang || d.referensi || "";
        
        if (ar) h += '<div class="ar">' + esc(ar) + '</div>';
        if (tr) h += '<div class="lt">' + esc(tr) + '</div>';
        if (arti) h += '<div class="tr">' + esc(arti) + '</div>';
        if (ref) h += '<div class="sub" style="margin-top:10px; opacity:.7">📚 ' + esc(ref) + '</div>';
        
        h += '</div>'; // tutup card
      }
    }
    h += '</div>'; // tutup mid

    // --- BOTTOM BAR ---
    h += '<div class="bot">';
    if (total > 0) {
      h += '<div class="pg"><button id="prev"' + (st.page === 0 ? " disabled" : "") + ">⬅ Sebelumnya</button><span>Doa " + (a0 + 1) + "-" + a1 + " dari " + total + '</span><button id="next"' + (st.page >= totPage - 1 ? " disabled" : "") + ">Berikutnya ➡</button></div>";
    }
    h += '</div>';

    h += '</div>'; // tutup w
    app.innerHTML = h;

    // Fokus kembali ke kotak cari jika sedang mengetik
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
      st.page = 0;
      st._focusCari = true;
      render();
    }
  });

  app.addEventListener("change", function (e) {
    if (e.target.id === "sel") {
      var idx = +e.target.value;
      if (idx >= 0 && idx < st.list.length) {
         st.page = Math.floor(idx / PER); // Lompat ke halaman doa yang dipilih
         st.cari = ""; // Bersihkan pencarian
         render();
      }
    }
  });

  app.addEventListener("click", function (e) {
    var t = e.target;
    if (t.id === "prev" || t.id === "next") {
      st.page += t.id === "next" ? 1 : -1;
      render();
      var mid = app.querySelector(".mid");
      if (mid) mid.scrollTop = 0;
      return;
    }
  });

  // Jalankan
  loadData();
})();
