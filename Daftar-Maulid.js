(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // --- PENGATURAN URL FOLDER FILE KITAB ---
  // Ganti URL di bawah ini dengan folder GitHub tempat Boss menyimpan Simtudduror.js, Barjanji.js, dll.
  var BASE_URL = "https://teamkeringat.github.io/js/"; 

  // --- 1. KATALOG KITAB ---
  var DATA = [
    ["Maulid & Shalawat", "Kumpulan bacaan maulid dan pujian kepada Nabi Muhammad SAW.", [
      ["Simtudduror", "سِمْطُ الدُّرَرِ", "علي الحبشي", "Habib Ali bin Muhammad Al-Habsyi", "Untaian mutiara", "Maulid yang dibaca di banyak majelis, sastra yang indah.", "P"],
      ["Barjanji", "عِقْدُ الْجَوْهَرِ", "جعفر البرزنجي", "Ja'far al-Barzanji", "Untaian permata", "Syair dan kisah kelahiran Nabi yang sering dibaca.", "P"],
      ["Dibai", "مَوْلِدُ الدِّيبَعِيِّ", "عبد الرحمن الديبعي", "Abdurrahman ad-Diba'i", "Maulid Diba'i", "Bacaan maulid Nabi yang banyak dibaca di majelis.", "P"],
      ["QosidahBurdah", "قَصِيدَةُ الْبُرْدَةِ", "شرف الدين البوصيري", "Imam Al-Bushiri", "Qasidah Burdah", "Syair pujian kepada Nabi yang terkenal.", "P"]
    ]]
  ];

  // --- 2. FUNGSI MESIN (Diambil dari Daftar-Kitab.js asli) ---
  var st = { all: [], sel: 0, bi: "all", ob: {}, ld: {} };
  var LV = { P: "Pemula", M: "Menengah", L: "Lanjut" };
  window.KITAB = window.KITAB || {};

  var n = 0;
  DATA.forEach(function (g) {
    g[2].forEach(function (r) {
      n++;
      st.all.push({ id: n, grup: g[0], intro: g[1], nama: r[0], ar: r[1], ap: r[2], pl: r[3], arti: r[4], idn: r[5], lv: r[6] });
    });
  });

  function norm(s) {
    return String(s || "").toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/q/g, "k").replace(/[^a-z0-9\u0600-\u06FF]/g, "");
  }
  st.all.forEach(function (x) { x.nn = norm(x.nama); x.hay = norm([x.nama, x.pl, x.arti, x.ar, x.ap].join(" ")); });

  function namaFile(nama) {
    return nama.replace(/[^A-Za-z0-9]+/g, " ").trim().split(" ").map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join("") + ".js";
  }

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function teks(t) { return Array.isArray(t) ? t.join("\n\n") : (t == null ? "" : String(t)); }
  function cariKitab(id) { return st.all.filter(function (x) { return x.id === id; })[0]; }
  function buku(d) { return d ? window.KITAB[d.nama] : null; }

  function muat(d) {
    if (window.KITAB[d.nama]) { st.ld[d.id] = "ok"; return; }
    if (st.ld[d.id] === "load") return;
    st.ld[d.id] = "load";
    var s = document.createElement("script"), done = false, t;
    function fin(ok) {
      if (done) return; done = true; clearTimeout(t);
      st.ld[d.id] = (ok && window.KITAB[d.nama]) ? "ok" : "fail";
      if (s.parentNode) s.parentNode.removeChild(s);
      if (st.sel === d.id) view();
    }
    t = setTimeout(function () { fin(false); }, 20000);
    s.onload = function () { fin(true); };
    s.onerror = function () { fin(false); };
    s.async = true;
    s.src = BASE_URL + namaFile(d.nama);
    document.head.appendChild(s);
  }

  function itemHtml(x) {
    return '<div class="it">' + (x.no != null && x.no !== "" ? '<span class="bn">' + esc(x.no) + "</span>" : "") +
      (x.ar ? '<div class="ar">' + esc(x.ar) + "</div>" : "") +
      (x.lt ? '<div class="lt">' + esc(x.lt) + "</div>" : "") +
      (x.tr ? '<div class="tr">' + esc(x.tr) + "</div>" : "") +
      (x.ket ? '<div class="tn">' + esc(x.ket) + "</div>" : "") + "</div>";
  }
  function isiBab(r) {
    var h = "";
    if (r.pengantar) h += '<div class="tn" style="margin:0 0 6px">' + esc(teks(r.pengantar)) + "</div>";
    (r.isi || []).forEach(function (x) { h += itemHtml(x); });
    if (r.penjelasan) h += '<div class="tn pj"><b>Penjelasan</b>\n' + esc(teks(r.penjelasan)) + "</div>";
    return h;
  }

  function detail() {
    var d = st.sel ? cariKitab(st.sel) : null;
    if (!d) {
      return '<div class="msg">' + (st.warn ? "<b>Silakan pilih kitab terlebih dahulu.</b><br>" : "") +
        "Ketik nama kitab di kotak pencarian, atau tekan <b>Pilih Kitab</b> di kiri.</div>";
    }
    var h = '<div class="ic"><div class="ar">' + esc(d.ar) + '</div><div class="ap">' + esc(d.ap) + "</div>" +
      '<div class="tr" style="margin-top:6px"><b>' + esc(d.nama) + "</b> — " + esc(d.arti) + "</div>" +
      '<div class="tn">' + esc(d.pl) + " · " + esc(d.grup) + " · " + esc(LV[d.lv] || "") + "</div>" +
      '<div class="tn">' + esc(d.idn) + "</div></div>";
    var b = buku(d), sb;
    if (!b) {
      if (st.ld[d.id] === "fail") {
        return h + '<div class="msg">Isi kitab ini belum tersedia atau gagal dimuat.<br><span style="font-size:.8rem;opacity:.7">File: ' + esc(namaFile(d.nama)) +
          '</span><div class="ab" style="justify-content:center"><a href="#" data-retry="1">Coba lagi</a></div></div>';
      }
      return h + '<div class="msg">⏳ Memuat isi kitab...</div>';
    }
    sb = b.sebutan || "Bab";
    if (b.catatan) h += '<div class="tn" style="margin:0 0 8px">' + esc(b.catatan) + "</div>";
    var bab = b.bab || [];
    if (st.bi === "all") {
      bab.forEach(function (r, i) {
        var k = d.id + ":" + i, on = st.ob[k] !== false;
        h += '<div class="dd' + (on ? " on" : "") + '" data-b="' + k + '"><div class="hd"><span class="no">' + (i + 1) + '</span><div class="nm">' + esc(r.judul) +
          (r.arab ? '<div class="ap">' + esc(r.arab) + "</div>" : "") + '</div><span class="ch">›</span></div><div class="bd">' + isiBab(r) + "</div></div>";
      });
    } else {
      var r1 = bab[+st.bi];
      if (r1) h += '<div class="bh">' + esc(sb) + " " + (+st.bi + 1) + ". " + esc(r1.judul) + "</div>" + (r1.arab ? '<div class="ap">' + esc(r1.arab) + "</div>" : "") + isiBab(r1);
    }
    return h;
  }

  function view() {
    var d = st.sel ? cariKitab(st.sel) : null, b = buku(d), sb = (b && b.sebutan) || "Bab";
    var h = '<div class="bar"><select id="k" aria-label="Nama kitab"' + (d ? "" : ' class="ph"') + '><option value=""' + (d ? "" : " selected") + ">Pilih Kitab</option>";
    DATA.forEach(function (g) {
      h += '<optgroup label="' + esc(g[0]) + '">';
      st.all.forEach(function (x) { if (x.grup === g[0]) h += '<option value="' + x.id + '"' + (x.id === st.sel ? " selected" : "") + ">" + esc(x.nama) + "</option>"; });
      h += "</optgroup>";
    });
    h += '</select><select id="b" aria-label="Pembahasan"' + (d ? "" : ' class="ph"') + ">";
    if (!d) h += '<option value="">Pembahasan</option>';
    else if (!b) h += '<option value="all">' + (st.ld[d.id] === "fail" ? "Belum ada isi" : "Memuat...") + "</option>";
    else {
      h += '<option value="all"' + (st.bi === "all" ? " selected" : "") + ">Semua " + esc(sb) + "</option>";
      (b.bab || []).forEach(function (r, i) { h += '<option value="' + i + '"' + (String(st.bi) === String(i) ? " selected" : "") + ">" + esc(sb) + " " + (i + 1) + " · " + esc(r.judul) + "</option>"; });
    }
    h += '</select></div><div id="rt">' + detail() + "</div>";
    
    // Render ke ID main
    var main = document.getElementById("main");
    if (main) main.innerHTML = h;
  }

  function pilih(id) {
    st.sel = id; st.bi = "all"; st.warn = false;
    if (id) muat(cariKitab(id));
    view();
  }

  function saran(q) {
    var tk = String(q).split(/\s+/).map(norm).filter(Boolean);
    if (!tk.length) return [];
    return st.all.filter(function (x) { return tk.every(function (t) { return x.hay.indexOf(t) > -1; }); })
      .sort(function (a, b) {
        var sa = tk.every(function (t) { return a.nn.indexOf(t) > -1; }) ? 0 : 1, sb2 = tk.every(function (t) { return b.nn.indexOf(t) > -1; }) ? 0 : 1;
        return sa - sb2 || a.id - b.id;
      }).slice(0, 8);
  }
  function tampilSaran() {
    var q = document.getElementById("q").value, box = document.getElementById("sg");
    if (!q.trim()) { box.className = "sg"; box.innerHTML = ""; return []; }
    var r = saran(q), h = "";
    r.forEach(function (x) { h += '<button class="li" data-id="' + x.id + '">' + esc(x.nama) + '<div class="gp">' + esc(x.pl) + " · " + esc(x.arti) + "</div></button>"; });
    if (!r.length) h = '<div class="lg">Kitab tidak ditemukan.</div>';
    box.innerHTML = h; box.className = "sg on";
    return r;
  }
  function tutupSaran() { var q = document.getElementById("q"); q.value = ""; tampilSaran(); }

  var lastWarn = 0;
  function peringatan() {
    var now = Date.now();
    if (now - lastWarn < 900) return;
    lastWarn = now; st.warn = true;
    var rt = document.getElementById("rt"); if (rt) rt.innerHTML = detail();
    alert("Silakan pilih kitab terlebih dahulu.");
  }

  // Event Listeners
  app.addEventListener("input", function (e) { if (e.target.id === "q") tampilSaran(); });
  app.addEventListener("keydown", function (e) {
    if (e.target.id === "q" && e.key === "Enter") { var r = tampilSaran(); if (r[0]) { tutupSaran(); pilih(r[0].id); } }
    if (e.target.id === "b" && !st.sel) { e.preventDefault(); peringatan(); }
  });
  app.addEventListener("change", function (e) {
    if (e.target.id === "k") pilih(+e.target.value || 0);
    if (e.target.id === "b" && st.sel) { st.bi = e.target.value; view(); }
  });
  app.addEventListener("click", function (e) {
    var t = e.target;
    var li = t.closest && t.closest(".li[data-id]");
    if (li) { var id = +li.getAttribute("data-id"); tutupSaran(); pilih(id); return; }
    if (t.getAttribute && t.getAttribute("data-retry")) { e.preventDefault(); var d = cariKitab(st.sel); if (d) { st.ld[d.id] = ""; muat(d); view(); } return; }
    var hd = t.closest && t.closest(".hd");
    if (hd) {
      var box = hd.parentNode, k = box.getAttribute("data-b");
      if (k) { var on = st.ob[k] === false; st.ob[k] = on; box.classList.toggle("on", on); }
    }
  });

  view();
})();
