/* ============================================================
   MESIN READER UNIVERSAL (Versi Final Perbaikan)
   - Mendukung Nama File Eksplisit (Field ke-8)
   - Toolbar Fixed (Diam di Atas)
   - Penanganan Error & Retry
   - Support Tema Gelap/Terang (ng-light)
   ============================================================ */

window.bukaReader = function(config) {
    var app = document.getElementById("app");
    if (!app) return;

    // Pastikan struktur HTML dasar ada, bungkus dengan .toolbar-fix
    if (!document.getElementById("main")) {
        app.innerHTML =
            '<div class="toolbar-fix">' +
                '<div class="bar-cari"><div class="srch-wrap">' +
                    '<input id="q" type="text" placeholder="' + (config.placeholderCari || "Cari...") + '" autocomplete="off">' +
                    '<div class="sg" id="sg"></div>' +
                '</div></div>' +
                '<div class="bar-pilih">' +
                    '<select id="k" class="ph"><option value="" selected>' + (config.labelPilih || "Pilih Kitab") + '</option></select>' +
                    '<select id="b" class="ph"><option>Pembahasan</option></select>' +
                '</div>' +
            '</div>' +
            '<div id="main"></div>' +
            '<p id="stat" style="font-size:.75rem;opacity:.7;margin-top:10px"></p>';
    }

    // ============================================================
    // STATE
    // ============================================================
    var st = { all: [], sel: 0, bi: "all", ob: {}, ld: {} };
    var LV = { P: "Pemula", M: "Menengah", L: "Lanjut" };
    var lokalKatalog = [];
    var lokalKitab = {};

    // ============================================================
    // UTILITAS
    // ============================================================
    function esc(t) {
        return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
        });
    }
    
    function teks(t) { 
        return Array.isArray(t) ? t.join("\n\n") : (t == null ? "" : String(t)); 
    }
    
    function norm(s) {
        return String(s || "").toLowerCase()
            .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
            .replace(/q/g, "k")
            .replace(/[^a-z0-9\u0600-\u06FF]/g, "");
    }

    // Fungsi menentukan nama file (Prioritaskan field ke-8)
    function namaFile(nama, fileEksplisit) {
        if (fileEksplisit && String(fileEksplisit).trim()) {
            var f = String(fileEksplisit).trim();
            return /\.js$/i.test(f) ? f : f + ".js";
        }
        // Fallback jika Daftar-*.js belum diupdate
        return nama.replace(/[^A-Za-z0-9\-]+/g, " ").trim()
            .split(" ").map(function (w) {
                return w.charAt(0).toUpperCase() + w.slice(1);
            }).join("") + ".js";
    }

    function cariKitab(id) { 
        return st.all.filter(function (x) { return x.id === id; })[0]; 
    }

    function buku(d) {
        if (!d) return null;
        // Cek lokal dulu, baru cek global window.KITAB
        return lokalKitab[d.nama] || (window.KITAB && window.KITAB[d.nama]) || null;
    }

    // ============================================================
    // 1. MUAT KATALOG (Dari Daftar-*.js)
    // ============================================================
    function muatDataInduk() {
        var namaVar = config.namaVariabel || "DATA_READER";
        var oldData = window[namaVar];

        var s = document.createElement("script");
        s.src = config.sumberData;
        s.onload = function () {
            var dataBaru = window[namaVar];
            if (dataBaru && Array.isArray(dataBaru)) {
                lokalKatalog = dataBaru;
                st.all = [];
                var n = 0;
                
                // Parsing Katalog
                lokalKatalog.forEach(function (g) {
                    (g[2] || []).forEach(function (r) {
                        n++;
                        st.all.push({
                            id: n,
                            grup: g[0],
                            intro: g[1],
                            nama: r[0],
                            ar: r[1],
                            ap: r[2],
                            pl: r[3],
                            arti: r[4],
                            idn: r[5],
                            lv: r[6],
                            file: r[7] || null // Nama file eksplisit
                        });
                    });
                });
                
                // Persiapan pencarian (Normalisasi)
                st.all.forEach(function (x) {
                    x.nn = norm(x.nama);
                    x.hay = norm([x.nama, x.pl, x.arti, x.ar, x.ap].join(" "));
                });

                if (oldData !== undefined) window[namaVar] = oldData;
                else delete window[namaVar];
                
                view();
            } else {
                var m = document.getElementById("main");
                if (m) m.innerHTML = '<div class="msg" style="color:red">❌ Gagal membaca katalog. Pastikan file berisi <code>window.' + namaVar + '</code>.</div>';
            }
        };
        s.onerror = function () {
            var m = document.getElementById("main");
            if (m) m.innerHTML = '<div class="msg" style="color:red">❌ Gagal mengunduh katalog dari:<br>' + esc(config.sumberData) + '</div>';
        };
        document.head.appendChild(s);
    }

    // ============================================================
    // 2. MUAT ISI KITAB (Dari Folder Kitab/)
    // ============================================================
    function muatIsi(d) {
        if (!d) return;
        
        // Jika sudah ada di cache lokal atau global, langsung tampilkan
        if (lokalKitab[d.nama] || (window.KITAB && window.KITAB[d.nama])) { 
            st.ld[d.id] = "ok"; return; 
        }
        // Cegah double loading
        if (st.ld[d.id] === "load") return;
        st.ld[d.id] = "load";

        var s = document.createElement("script");
        var done = false, t;

        function fin(ok, err) {
            if (done) return;
            done = true;
            clearTimeout(t);
            st.ld[d.id] = ok ? "ok" : "fail";
            if (!ok && err) st.ld[d.id + "_err"] = err;
            if (s.parentNode) s.parentNode.removeChild(s);
            if (st.sel === d.id) view();
        }

        // Timeout 20 Detik
        t = setTimeout(function () { fin(false, "Waktu habis (Timeout 20 detik)."); }, 20000);

        s.onload = function () {
            if (window.KITAB && window.KITAB[d.nama]) {
                lokalKitab[d.nama] = window.KITAB[d.nama];
                // TIDAK MENGHAPUS window.KITAB agar tidak bentrok dengan kitab lain
                fin(true);
            } else {
                var keys = window.KITAB ? Object.keys(window.KITAB) : [];
                fin(false,
                    "File berhasil diunduh, tapi tidak ada <code>window.KITAB['" +
                    esc(d.nama) + "']</code> di dalamnya.<br>" +
                    "Kunci yang ditemukan: <code>" + esc(keys.join(", ") || "(kosong)") + "</code>"
                );
            }
        };
        
        s.onerror = function () { 
            fin(false, "Gagal mengunduh file. Pastikan file benar-benar ada di GitHub."); 
        };
        
        s.async = true;

        var base = window.KITAB_BASE || config.kitabBase || "";
        var urlFile = base + namaFile(d.nama, d.file);
        s.src = urlFile;
        st.ld[d.id + "_url"] = urlFile;
        console.log("[Reader] Load:", urlFile);
        
        document.head.appendChild(s);
    }

    // ============================================================
    // 3. RENDER TAMPILAN
    // ============================================================
    function itemHtml(x) {
        return '<div class="it">' +
            (x.ar ? '<div class="ar">' + esc(x.ar) + "</div>" : "") +
            (x.lt ? '<div class="lt">' + esc(x.lt) + "</div>" : "") +
            (x.tr ? '<div class="tr">' + esc(x.tr) + "</div>" : "") +
            (x.ket ? '<div class="tn">' + esc(x.ket) + "</div>" : "") +
            "</div>";
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
        return '<div class="msg">' + (st.warn ? esc(config.labelKosong) + "<br>" : "") +
            "Ketik nama di kotak pencarian, atau pilih " + esc(config.labelPilih) + ".</div>";
    }
    
    // --- PERUBAHAN DISINI: JUDUL BOLD DIPINDAH KE PALING ATAS ---
    var h = '<div class="ic">' +
        '<div class="bh">' + esc(d.nama) + " — " + esc(d.arti) + "</div>" + // Judul di atas
        '<div class="ar">' + esc(d.ar) + "</div>" + // Teks Arab di bawah judul
        '<div class="ap">' + esc(d.ap) + "</div>" + // Pengarang Arab
        '<div class="tn">' + esc(d.pl) + " · " + esc(d.grup) + " · " + esc(LV[d.lv] || "") + "</div>" +
        '<div class="tn">' + esc(d.idn) + "</div></div>";

    var b = buku(d), sb;
    if (!b) {
        if (st.ld[d.id] === "fail") {
            var pesanErr = st.ld[d.id + "_err"] || "Isi belum tersedia.";
            var urlDicoba = st.ld[d.id + "_url"] || "";
            return h + '<div class="msg" style="border:1px solid red; text-align:left;">' +
                '<b style="color:red">❌ GAGAL MEMUAT KITAB</b><br><br>' +
                '<b>Pesan:</b> ' + pesanErr + '<br><br>' +
                '<b>URL yang dicoba:</b><br>' +
                '<a href="' + esc(urlDicoba) + '" target="_blank" style="word-break:break-all;color:#c9b86a">' + esc(urlDicoba) + '</a>' +
                '<br><br><a href="#" data-retry="1" style="color:#c9b86a; font-weight:bold;">🔄 Coba Lagi</a></div>';
        }
        return h + '<div class="msg">⏳ Memuat isi kitab...</div>';
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
        var d = st.sel ? cariKitab(st.sel) : null;
        var b = buku(d);
        var sb = (b && b.sebutan) || "Bab";
        var elK = document.getElementById("k");
        var elB = document.getElementById("b");

        // Render Dropdown Kitab
        if (elK) {
            var hk = '<option value=""' + (d ? "" : " selected") + ">" + esc(config.labelPilih) + "</option>";
            lokalKatalog.forEach(function (g) {
                hk += '<optgroup label="' + esc(g[0]) + '">';
                st.all.forEach(function (x) {
                    if (x.grup === g[0]) hk += '<option value="' + x.id + '"' + (x.id === st.sel ? " selected" : "") + ">" + esc(x.nama) + "</option>";
                });
                hk += "</optgroup>";
            });
            elK.innerHTML = hk;
        }

        // Render Dropdown Bab
        if (elB) {
            var hb = "";
            if (!d) hb = '<option value="all">Pembahasan</option>';
            else if (!b) hb = '<option value="all">' + (st.ld[d.id] === "fail" ? "Gagal Dimuat" : "Memuat...") + "</option>";
            else {
                hb += '<option value="all"' + (st.bi === "all" ? " selected" : "") + ">Semua " + esc(sb) + "</option>";
                (b.bab || []).forEach(function (r, i) {
                    hb += '<option value="' + i + '"' + (String(st.bi) === String(i) ? " selected" : "") + ">" + esc(sb) + " " + (i + 1) + " · " + esc(r.judul) + "</option>";
                });
            }
            elB.innerHTML = hb;
        }

        var main = document.getElementById("main");
        if (main) main.innerHTML = detail();
    }

    function pilih(id) {
        st.sel = id;
        st.bi = "all";
        st.warn = false;
        if (id) muatIsi(cariKitab(id));
        view();
    }

    // ============================================================
    // 4. PENCARIAN & SARAN
    // ============================================================
    function saran(q) {
        var tk = String(q).split(/\s+/).map(norm).filter(Boolean);
        if (!tk.length) return [];
        return st.all.filter(function (x) {
            return tk.every(function (t) { return x.hay.indexOf(t) > -1; });
        }).sort(function (a, b) {
            var sa = tk.every(function (t) { return a.nn.indexOf(t) > -1; }) ? 0 : 1;
            var sb2 = tk.every(function (t) { return b.nn.indexOf(t) > -1; }) ? 0 : 1;
            return sa - sb2 || a.id - b.id;
        }).slice(0, 8);
    }

    function tampilSaran() {
        var el = document.getElementById("q");
        var box = document.getElementById("sg");
        if (!el || !box) return [];
        var q = el.value;
        if (!q.trim()) { box.className = "sg"; box.innerHTML = ""; return []; }
        var r = saran(q), h = "";
        r.forEach(function (x) {
            h += '<button class="li" data-id="' + x.id + '">' + esc(x.nama) +
                '<div class="gp">' + esc(x.pl) + " · " + esc(x.arti) + "</div></button>";
        });
        if (!r.length) h = '<div class="msg">Tidak ditemukan.</div>';
        box.innerHTML = h;
        box.className = "sg on";
        return r;
    }

    function tutupSaran() {
        var el = document.getElementById("q");
        if (el) el.value = "";
        tampilSaran();
    }

    var lastWarn = 0;
    function peringatan() {
        var now = Date.now();
        if (now - lastWarn < 900) return;
        lastWarn = now;
        st.warn = true;
        var rt = document.getElementById("main");
        if (rt) rt.innerHTML = detail();
        alert(config.labelKosong);
    }

    // ============================================================
    // 5. EVENT LISTENERS
    // ============================================================
    if (!app.dataset.bound) {
        app.dataset.bound = "1";
        app.addEventListener("input", function (e) {
            if (e.target.id === "q") tampilSaran();
        });
        app.addEventListener("keydown", function (e) {
            if (e.target.id === "q" && e.key === "Enter") {
                var r = tampilSaran();
                if (r[0]) { tutupSaran(); pilih(r[0].id); }
            }
            if (e.target.id === "b" && !st.sel) { e.preventDefault(); peringatan(); }
        });
        app.addEventListener("change", function (e) {
            if (e.target.id === "k") pilih(+e.target.value || 0);
            if (e.target.id === "b" && st.sel) { st.bi = e.target.value; view(); }
        });
        app.addEventListener("click", function (e) {
            var t = e.target;
            
            // Klik saran pencarian
            var li = t.closest && t.closest(".li[data-id]");
            if (li) { 
                var id = +li.getAttribute("data-id"); 
                tutupSaran(); 
                pilih(id); 
                return; 
            }
            
            // Klik tombol Retry
            if (t.getAttribute && t.getAttribute("data-retry")) {
                e.preventDefault();
                var d = cariKitab(st.sel);
                if (d) {
                    st.ld[d.id] = "";
                    delete st.ld[d.id + "_err"];
                    muatIsi(d);
                    view();
                }
                return;
            }
            
            // Klik buka/tutup bab
            var hd = t.closest && t.closest(".hd");
            if (hd) {
                var box = hd.parentNode, k = box.getAttribute("data-b");
                if (k) {
                    var on = st.ob[k] === false;
                    st.ob[k] = on;
                    box.classList.toggle("on", on);
                }
            }
        });
        
        // Tutup saran jika klik di luar
        document.addEventListener("click", function(e) {
            var box = document.getElementById("sg");
            var elQ = document.getElementById("q");
            if (box && box.classList.contains("on") && e.target !== elQ && !box.contains(e.target)) {
                box.className = "sg";
            }
        });
    }

    // Jalankan!
    muatDataInduk();
};
