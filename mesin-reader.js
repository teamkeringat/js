/* ============================================================
   MESIN READER UNIVERSAL (mesin-reader.js)
   Berisi 2 fungsi utama:
   1. bukaReader(config)  -> Untuk menu statis (Kitab, Kamus, Hadis)
   2. bukaDoaEQuran()     -> Untuk menu Doa dari API EQuran.id
   ============================================================ */

/* ==========================================
   FUNGSI 1: MENU STATIS (Kitab, Kamus, dll)
   ========================================== */
window.bukaReader = function(config) {
    document.getElementById("app-judul").textContent = config.judul || "Reader";
    document.querySelector("#q").placeholder = config.placeholderCari || "Cari...";
    
    var st = { all: [], sel: 0, bi: "all", ob: {}, ld: {} };
    var LV = { P: "Pemula", M: "Menengah", L: "Lanjut" };
    window.KITAB = window.KITAB || {};

    function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&", "<": "<", ">": ">", '"': '"' }[c]; }); }
    function teks(t) { return Array.isArray(t) ? t.join("\n\n") : (t == null ? "" : String(t)); }
    function norm(s) { return String(s || "").toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/q/g, "k").replace(/[^a-z0-9\u0600-\u06FF]/g, ""); }
    function namaFile(nama) { return nama.replace(/[^A-Za-z0-9]+/g, " ").trim().split(" ").map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join("") + ".js"; }

    function status() {
        var s = document.getElementById("stat");
        if (!s) return;
        var p = window.NGPREF;
        if (p) s.textContent = "✅ Terhubung dengan pengaturan Ngelingan (Arab " + (p.font || 1) + ").";
        else s.textContent = "⏳ Menunggu pengaturan Ngelingan...";
    }

    function cariKitab(id) { return st.all.filter(function (x) { return x.id === id; })[0]; }
    function buku(d) { return d ? window.KITAB[d.nama] : null; }

    // Pemuatan Data Induk
    function muatDataInduk() {
        var s = document.createElement("script");
        s.src = config.sumberData;
        s.onload = function() {
            if (window.DATA_READER) {
                var n = 0;
                window.DATA_READER.forEach(function (g) {
                    g[2].forEach(function (r) {
                        n++;
                        st.all.push({ id: n, grup: g[0], intro: g[1], nama: r[0], ar: r[1], ap: r[2], pl: r[3], arti: r[4], idn: r[5], lv: r[6] });
                    });
                });
                st.all.forEach(function (x) { x.nn = norm(x.nama); x.hay = norm([x.nama, x.pl, x.arti, x.ar, x.ap].join(" ")); });
                view();
            }
        };
        s.onerror = function() {
            document.getElementById("main").innerHTML = '<div class="msg">Gagal memuat data dari ' + config.sumberData + '</div>';
        };
        document.head.appendChild(s);
    }

    // Pemuatan Isi Kitab
    function muatIsi(d) {
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
        s.src = "https://teamkeringat.github.io/KitabKuning/" + namaFile(d.nama);
        document.head.appendChild(s);
    }

    // Render Item
    function itemHtml(x) {
        return '<div class="it">' +
        (x.no != null && x.no !== "" ? '<div class="bn">' + esc(x.no) + "</div>" : "") +
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

    // Render Detail
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
                h += '<div class="dd' + (on ? " on" : "") + '" data-b="' + k + '"><div class="hd"><span class="no">' + (i + 1) +
                '</span><span class="nm">' + esc(r.judul) +
                (r.arab ? '<div class="ar" style="font-size:calc(1.3rem * var(--z,1));margin-top:4px">' + esc(r.arab) + "</div>" : "") +
                '</span><span class="ch">›</span></div><div class="bd">' + isiBab(r) + "</div></div>";
            });
        } else {
            var r1 = bab[+st.bi];
            if (r1) h += '<div class="dd on"><div class="hd"><span class="no">' + (+st.bi + 1) + '</span><span class="nm">' + esc(sb) + " " + (+st.bi + 1) + ". " + esc(r1.judul) +
            (r1.arab ? '<div class="ar" style="font-size:calc(1.3rem * var(--z,1));margin-top:4px">' + esc(r1.arab) + "</div>" : "") +
            '</span></div><div class="bd">' + isiBab(r1) + "</div></div>";
        }
        return h;
    }

    // Render View
    function view() {
        var d = st.sel ? cariKitab(st.sel) : null, b = buku(d), sb = (b && b.sebutan) || "Bab";
        
        // Kiri (Kitab)
        var h = '<select id="k" class="' + (d ? "" : "ph") + '"><option value=""' + (d ? "" : " selected") + ">" + config.labelPilih + "</option>";
        window.DATA_READER.forEach(function (g) {
            h += '<optgroup label="' + esc(g[0]) + '">';
            st.all.forEach(function (x) { if (x.grup === g[0]) h += '<option value="' + x.id + '"' + (x.id === st.sel ? " selected" : "") + ">" + esc(x.nama) + "</option>"; });
            h += "</optgroup>";
        });
        h += '</select>';

        // Kanan (Pembahasan)
        h += '<select id="b" class="' + (d ? "" : "ph") + '">';
        if (!d) h += "Pembahasan";
        else if (!b) h += '<option value="all">' + (st.ld[d.id] === "fail" ? "Belum ada isi" : "Memuat...") + "</option>";
        else {
            h += '<option value="all"' + (st.bi === "all" ? " selected" : "") + ">Semua " + esc(sb) + "</option>";
            (b.bab || []).forEach(function (r, i) { h += '<option value="' + i + '"' + (String(st.bi) === String(i) ? " selected" : "") + ">" + esc(sb) + " " + (i + 1) + " · " + esc(r.judul) + "</option>"; });
        }
        h += '</select>';
        
        document.getElementById("bar-select").innerHTML = h;
        document.getElementById("main").innerHTML = detail();
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
        var q = document.getElementById("q").value, box = document.getElementById("sg");
        if (!q.trim()) { box.className = "sg"; box.innerHTML = ""; return []; }
        var r = saran(q), h = "";
        r.forEach(function (x) { h += '<button class="li" data-id="' + x.id + '">' + esc(x.nama) + '<div class="gp">' + esc(x.pl) + " · " + esc(x.arti) + "</div></button>"; });
        if (!r.length) h = '<div class="msg">Tidak ditemukan.</div>';
        box.innerHTML = h; box.className = "sg on";
        return r;
    }
    function tutupSaran() { document.getElementById("q").value = ""; tampilSaran(); }

    var lastWarn = 0;
    function peringatan() {
        var now = Date.now();
        if (now - lastWarn < 900) return;
        lastWarn = now; st.warn = true;
        var rt = document.getElementById("main"); if (rt) rt.innerHTML = detail();
        alert(config.labelKosong);
    }

    // Event Listener
    document.getElementById("app").addEventListener("input", function (e) { if (e.target.id === "q") tampilSaran(); });
    document.getElementById("app").addEventListener("keydown", function (e) {
        if (e.target.id === "q" && e.key === "Enter") { var r = tampilSaran(); if (r[0]) { tutupSaran(); pilih(r[0].id); } }
        if (e.target.id === "b" && !st.sel) { e.preventDefault(); peringatan(); }
    });
    document.getElementById("app").addEventListener("mousedown", function (e) { if (e.target.id === "b" && !st.sel) { e.preventDefault(); e.target.blur(); peringatan(); } });
    document.getElementById("app").addEventListener("change", function (e) {
        if (e.target.id === "k") pilih(+e.target.value || 0);
        if (e.target.id === "b" && st.sel) { st.bi = e.target.value; view(); }
    });
    document.getElementById("app").addEventListener("click", function (e) {
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

    window.addEventListener("ngpref", status);
    setTimeout(status, 2500);

    status();
    muatDataInduk();
};

/* ==========================================
   FUNGSI 2: DOA EQURAN.ID (Mode 2 Kotak)
   ========================================== */
window.bukaDoaEQuran = function () {
    var API = "https://equran.id/api/doa";
    var st = { all: [], sel: 0 };

    var elQ = document.getElementById("q");
    var elK = document.getElementById("k");
    var elMain = document.getElementById("main");
    var elStat = document.getElementById("stat");

    function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    function status() {
        if (!elStat) return;
        var p = window.NGPREF;
        if (p) elStat.textContent = "✅ Terhubung dengan pengaturan Ngelingan (Arab " + (p.font || 1) + ").";
        else elStat.textContent = "⏳ Menunggu pengaturan Ngelingan...";
    }

    function renderDetail() {
        var d = st.all.filter(function(x) { return String(x.id) === String(st.sel); })[0];
        if (!d) {
            elMain.innerHTML = '<div class="msg">Silakan pilih doa terlebih dahulu dari menu di atas.</div>';
            return;
        }

        var h = '<div class="ic">' +
                '<div class="bh">' + esc(d.nama) + '</div>' +
                '<div class="ar">' + esc(d.ar) + '</div>' +
                (d.tr ? '<div class="lt">' + esc(d.tr) + '</div>' : '') +
                '<div class="tr">' + esc(d.idn) + '</div>' +
                (d.tentang ? '<div class="tn">' + esc(d.tentang) + '</div>' : '') +
                '</div>';
        elMain.innerHTML = h;
    }

    function isiDropdown(dataArray) {
        var h = '<option value="">Pilih Doa</option>';
        dataArray.forEach(function (d) {
            h += '<option value="' + esc(d.id) + '">' + esc(d.nama) + '</option>';
        });
        if(elK) elK.innerHTML = h;
    }

    if (elK) {
        elK.addEventListener("change", function(e) {
            st.sel = e.target.value;
            if(st.sel) elK.classList.remove("ph");
            renderDetail();
        });
    }

    if (elQ) {
        elQ.addEventListener("input", function(e) {
            var q = e.target.value.toLowerCase();
            var filter = st.all.filter(function(d) {
                return (d.nama + " " + d.idn).toLowerCase().indexOf(q) >= 0;
            });
            isiDropdown(filter);
            if (st.sel && !filter.some(function(d){ return String(d.id) === String(st.sel); })) {
                st.sel = 0;
                renderDetail();
            }
        });
    }

    window.addEventListener("ngpref", status);
    setTimeout(status, 2500);

    if(elMain) elMain.innerHTML = '<div class="msg">Memuat daftar doa...</div>';
    
    fetch(API)
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (j) {
            var d = Array.isArray(j) ? j : (j && j.data);
            if (!Array.isArray(d) || !d.length) throw new Error("data kosong");
            
            st.all = d.map(function(o) {
                return {
                    id: o.id,
                    grup: o.grup || "Doa Harian",
                    nama: o.nama || "Tanpa Nama",
                    ar: o.ar || "",
                    tr: o.latin || o.tr || "",
                    idn: o.arti || o.idn || "",
                    tentang: o.tentang || ""
                };
            });
            
            isiDropdown(st.all);
            renderDetail();
        })
        .catch(function (e) {
            if(elMain) elMain.innerHTML = '<div class="msg">Gagal memuat doa (' + esc(e.message) + ').<br>Periksa koneksi internet.</div>';
        });
};
