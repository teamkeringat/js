/* ============================================================
   MESIN READER UNIVERSAL (Versi 2.0)
   Bisa membaca katalog apa saja (Maulid, Kitab Kuning, dll)
   tanpa bentrok antar menu.
   ============================================================ */

window.bukaReader = function(config) {
    var app = document.getElementById("app");
    if (!app) return;

    // Pastikan struktur dasar HTML ada
    if (!document.getElementById("main")) {
        app.innerHTML = '<div class="bar-cari"><div class="srch-wrap"><input id="q" type="text" placeholder="Cari..." autocomplete="off"><div class="sg" id="sg"></div></div></div>' +
        '<div class="bar-pilih"><select id="k" class="ph"><option value="" selected>Pilih Kitab</option></select><select id="b" class="ph"><option>Pembahasan</option></select></div>' +
        '<div id="main"></div><p id="stat" style="font-size:.75rem;opacity:.7;margin-top:10px"></p>';
    }

    var elJudul = document.getElementById("app-judul");
    if (elJudul) elJudul.textContent = config.judul || "Reader";
    
    var elQ = document.getElementById("q");
    if (elQ) elQ.placeholder = config.placeholderCari || "Cari...";

    // --- STATE TERISOLASI ---
    var st = { all: [], sel: 0, bi: "all", ob: {}, ld: {} };
    var LV = { P: "Pemula", M: "Menengah", L: "Lanjut" };
    var lokalKatalog = [];
    var lokalKitab = {}; // Menyimpan isi kitab secara lokal agar tidak bentrok

    // --- FUNGSI BANTU ---
    function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function teks(t) { return Array.isArray(t) ? t.join("\n\n") : (t == null ? "" : String(t)); }
    function norm(s) { return String(s || "").toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/q/g, "k").replace(/[^a-z0-9\u0600-\u06FF]/g, ""); }
    
    function namaFile(nama) { 
        return nama.replace(/[^A-Za-z0-9\-]+/g, " ").trim().split(" ").map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join("") + ".js"; 
    }

    function status() {
        var s = document.getElementById("stat");
        if (!s) return;
        var p = window.NGPREF;
        if (p) s.textContent = "✅ Terhubung dengan pengaturan Ngelingan (Arab " + (p.font || 1) + ").";
        else s.textContent = "⏳ Menunggu pengaturan Ngelingan...";
    }

    function cariKitab(id) { return st.all.filter(function (x) { return x.id === id; })[0]; }
    
    // Cek isi kitab: Prioritaskan yang ada di lokal, baru cek global
    function buku(d) { 
        if (!d) return null;
        return lokalKitab[d.nama] || window.KITAB[d.nama]; 
    }

    // --- 1. MEMBACA KATALOG (UNIVERSAL) ---
    function muatDataInduk() {
        var namaVarGlobal = config.namaVariabel || "DATA_READER"; 
        var oldData = window[namaVarGlobal]; // Simpan jika ada variabel global sebelumnya
        
        var s = document.createElement("script");
        s.src = config.sumberData;
        s.onload = function() {
            var dataBaru = window[namaVarGlobal];
            if (dataBaru && Array.isArray(dataBaru)) {
                lokalKatalog = dataBaru;
                
                var n = 0;
                lokalKatalog.forEach(function (g) {
                    g[2].forEach(function (r) {
                        n++;
                        st.all.push({ id: n, grup: g[0], intro: g[1], nama: r[0], ar: r[1], ap: r[2], pl: r[3], arti: r[4], idn: r[5], lv: r[6] });
                    });
                });
                st.all.forEach(function (x) { x.nn = norm(x.nama); x.hay = norm([x.nama, x.pl, x.arti, x.ar, x.ap].join(" ")); });
                
                // Kembalikan variabel global ke asalnya (Isolasi)
                if (oldData !== undefined) window[namaVarGlobal] = oldData;
                else delete window[namaVarGlobal];
                
                view();
            } else {
                var m = document.getElementById("main");
                if(m) m.innerHTML = '<div class="msg">Format tidak dikenali. Pastikan file berisi <code>' + namaVarGlobal + '</code>.</div>';
            }
        };
        s.onerror = function() {
            var m = document.getElementById("main");
            if(m) m.innerHTML = '<div class="msg">Gagal memuat katalog dari ' + config.sumberData + '</div>';
        };
        document.head.appendChild(s);
    }

    // --- 2. MEMANGGIL ISI KITAB ---
    function muatIsi(d) {
        if (lokalKitab[d.nama] || window.KITAB[d.nama]) { st.ld[d.id] = "ok"; return; }
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
        s.onload = function () { 
            // Pindahkan isi dari global ke lokal agar tidak menimpa menu lain
            if (window.KITAB[d.nama]) {
                lokalKitab[d.nama] = window.KITAB[d.nama];
                delete window.KITAB[d.nama]; // Bersihkan global
            }
            fin(true); 
        };
        s.onerror = function () { fin(false); };
        s.async = true;
        
        // KITAB_BASE diambil dari file Daftar, jika tidak ada gunakan config
        var base = window.KITAB_BASE || config.kitabBase || "";
        s.src = base + namaFile(d.nama);
        document.head.appendChild(s);
    }

    // --- 3. TAMPILAN ISI ---
    function itemHtml(x) {
        return '<div class="it">' +
        (x.ar ? '<div class="ar">' + esc(x.ar) + "</div>" : "") +
        (x.lt ? '<div class="lt">' + esc(x.lt) + "</div>" : "") +
        (x.tr ? '<div class="tr">' + esc(x.tr) + "</div>" : "") +
        (x.ket ? '<div class="tn">' + esc(x.ket) + "</div>" : "") + "</div>";
    }

    function isiBab(r) {
        var h = "";
        if (r.pengantar) h += '<p class="pg">' + esc(teks(r.pengantar)) + "</p>";
        (r.isi || []).forEach(function (x) { h += itemHtml(x); });
        if (r.penjelasan) h += '<div class="pj"><b>Penjelasan</b><br>' + esc(teks(r.penjelasan)) + "</div>";
        return h;
    }

    function detail() {
        var d = st.sel ? cariKitab(st.sel) : null;
        if (!d) {
            return '<div class="msg">' + (st.warn ? config.labelKosong + "<br>" : "") +
            "Ketik nama di kotak pencarian, atau tekan " + config.labelPilih + " di kiri.</div>";
        }
        var h = '<div class="ic">' +
        '<div class="ar">' + esc(d.ar) + '</div>' +
        '<div class="ap">' + esc(d.ap) + "</div>" +
        '<div class="bh">' + esc(d.nama) + " — " + esc(d.arti) + "</div>" +
        '<div class="tn">' + esc(d.pl) + " · " + esc(d.grup) + " · " + esc(LV[d.lv] || "") + "</div>" +
        '<div class="tn">' + esc(d.idn) + "</div></div>";
        var b = buku(d), sb;
        if (!b) {
            if (st.ld[d.id] === "fail") {
                return h + '<div class="msg">Isi belum tersedia atau gagal dimuat.<br>File: ' + esc(namaFile(d.nama)) +
                '<br><br><a href="#" data-retry="1" style="color:#c9b86a">Coba lagi</a></div>';
            }
            return h + '<div class="msg">⏳ Memuat isi...</div>';
        }
        sb = b.sebutan || "Bab";
        if (b.catatan) h += '<p class="pg">' + esc(b.catatan) + "</p>";
        var bab = b.bab || [];
        if (st.bi === "all") {
            bab.forEach(function (r, i) {
                var k = d.id + ":" + i, on = st.ob[k] !== false;
                h += '<div class="dd' + (on ? " on" : "") + '" data-b="' + k + '">' +
                '<div class="hd"><span class="nm">' + esc(r.judul) + '</span><span class="ch">›</span></div>' +
                '<div class="bd">' + isiBab(r) + "</div></div>";
            });
        } else {
            var r1 = bab[+st.bi];
            if (r1) {
                h += '<div class="dd on"><div class="hd"><span class="nm">' + esc(sb) + " " + (+st.bi + 1) + ". " + esc(r1.judul) +
                '</span></div><div class="bd">' + isiBab(r1) + "</div></div>";
            }
        }
        return h;
    }

    function view() {
        var d = st.sel ? cariKitab(st.sel) : null, b = buku(d), sb = (b && b.sebutan) || "Bab";
        var elK = document.getElementById("k");
        var elB = document.getElementById("b");
        
        if (elK) {
            var hk = '<option value=""' + (d ? "" : " selected") + ">" + config.labelPilih + "</option>";
            if(lokalKatalog) {
                lokalKatalog.forEach(function (g) {
                    hk += '<optgroup label="' + esc(g[0]) + '">';
                    st.all.forEach(function (x) { if (x.grup === g[0]) hk += '<option value="' + x.id + '"' + (x.id === st.sel ? " selected" : "") + ">" + esc(x.nama) + "</option>"; });
                    hk += "</optgroup>";
                });
            }
            elK.innerHTML = hk;
        }

        if (elB) {
            var hb = "";
            if (!d) hb = '<option value="all">Pembahasan</option>';
            else if (!b) hb = '<option value="all">' + (st.ld[d.id] === "fail" ? "Belum ada isi" : "Memuat...") + "</option>";
            else {
                hb += '<option value="all"' + (st.bi === "all" ? " selected" : "") + ">Semua " + esc(sb) + "</option>";
                (b.bab || []).forEach(function (r, i) { hb += '<option value="' + i + '"' + (String(st.bi) === String(i) ? " selected" : "") + ">" + esc(sb) + " " + (i + 1) + " · " + esc(r.judul) + "</option>"; });
            }
            elB.innerHTML = hb;
        }
        
        var main = document.getElementById("main");
        if (main) main.innerHTML = detail();
    }

    function pilih(id) {
        st.sel = id; st.bi = "all"; st.warn = false;
        if (id) muatIsi(cariKitab(id));
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
        var el = document.getElementById("q");
        var box = document.getElementById("sg");
        if(!el || !box) return;
        var q = el.value;
        if (!q.trim()) { box.className = "sg"; box.innerHTML = ""; return []; }
        var r = saran(q), h = "";
        r.forEach(function (x) { h += '<button class="li" data-id="' + x.id + '">' + esc(x.nama) + '<div class="gp">' + esc(x.pl) + " · " + esc(x.arti) + "</div></button>"; });
        if (!r.length) h = '<div class="msg">Tidak ditemukan.</div>';
        box.innerHTML = h; box.className = "sg on";
        return r;
    }
    
    function tutupSaran() { var el = document.getElementById("q"); if(el) el.value = ""; tampilSaran(); }

    var lastWarn = 0;
    function peringatan() {
        var now = Date.now();
        if (now - lastWarn < 900) return;
        lastWarn = now; st.warn = true;
        var rt = document.getElementById("main"); if (rt) rt.innerHTML = detail();
        alert(config.labelKosong);
    }

    // --- 4. EVENT LISTENERS ---
    if(!app.dataset.bound) {
        app.dataset.bound = "1";
        app.addEventListener("input", function (e) { if (e.target.id === "q") tampilSaran(); });
        app.addEventListener("keydown", function (e) {
            if (e.target.id === "q" && e.key === "Enter") { var r = tampilSaran(); if (r[0]) { tutupSaran(); pilih(r[0].id); } }
            if (e.target.id === "b" && !st.sel) { e.preventDefault(); peringatan(); }
        });
        app.addEventListener("mousedown", function (e) { if (e.target.id === "b" && !st.sel) { e.preventDefault(); e.target.blur(); peringatan(); } });
        app.addEventListener("change", function (e) {
            if (e.target.id === "k") pilih(+e.target.value || 0);
            if (e.target.id === "b" && st.sel) { st.bi = e.target.value; view(); }
        });
        app.addEventListener("click", function (e) {
            var t = e.target;
            var li = t.closest && t.closest(".li[data-id]");
            if (li) { var id = +li.getAttribute("data-id"); tutupSaran(); pilih(id); return; }
            if (t.getAttribute && t.getAttribute("data-retry")) { e.preventDefault(); var d = cariKitab(st.sel); if (d) { st.ld[d.id] = ""; muatIsi(d); view(); } return; }
            var hd = t.closest && t.closest(".hd");
            if (hd) {
                var box = hd.parentNode, k = box.getAttribute("data-b");
                if (k) { var on = st.ob[k] === false; st.ob[k] = on; box.classList.toggle("on", on); }
            }
        });
    }

    window.addEventListener("ngpref", status);
    setTimeout(status, 2500);
    status();
    
    var elB = document.getElementById("b");
    if(elB && !elB.innerHTML.trim()) elB.innerHTML = '<option value="all">Pembahasan</option>';
    
    muatDataInduk();
};
