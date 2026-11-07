/* ============================================================
   MESIN READER UNIVERSAL (MesinReader.js) - ID BARU
   ============================================================ */
window.bukaReader = function(config) {
    var elJudul = document.getElementById("app-judul");
    if (elJudul) elJudul.textContent = config.judul || "Reader";
    
    var elQ = document.getElementById("C"); // Cari
    if (elQ) elQ.placeholder = config.placeholderCari || "Cari...";
    
    var st = { all: [], sel: 0, bi: "all", ob: {}, ld: {} };
    var LV = { P: "Pemula", M: "Menengah", L: "Lanjut" };
    window.KONTEN = window.KONTEN || {};

    function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&", "<": "<", ">": ">", '"': '"' }[c]; }); }
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

    function cariItem(id) { return st.all.filter(function (x) { return x.id === id; })[0]; }
    function konten(d) { return d ? window.KONTEN[d.nama] : null; }

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
            var m = document.getElementById("H"); // Halaman
            if(m) m.innerHTML = '<div class="msg">Gagal memuat data dari ' + config.sumberData + '</div>';
        };
        document.head.appendChild(s);
    }

    function muatIsi(d) {
        if (window.KONTEN[d.nama]) { st.ld[d.id] = "ok"; return; }
        if (st.ld[d.id] === "load") return;
        st.ld[d.id] = "load";
        var s = document.createElement("script"), done = false, t;
        function fin(ok) {
            if (done) return; done = true; clearTimeout(t);
            st.ld[d.id] = (ok && window.KONTEN[d.nama]) ? "ok" : "fail";
            if (s.parentNode) s.parentNode.removeChild(s);
            if (st.sel === d.id) view();
        }
        t = setTimeout(function () { fin(false); }, 20000);
        s.onload = function () { fin(true); };
        s.onerror = function () { fin(false); };
        s.async = true;
        s.src = (window.DATA_BASE || "") + namaFile(d.nama);
        document.head.appendChild(s);
    }

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
        var d = st.sel ? cariItem(st.sel) : null;
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
        var b = konten(d), sb;
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
                h += '<div class="dd' + (on ? " on" : "") + '" data-b="' + k + '"><div class="hd"><span class="nm">' + esc(r.judul) +
                (r.arab ? '<div class="ar" style="font-size:calc(1.3rem * var(--z,1));margin-top:4px">' + esc(r.arab) + "</div>" : "") +
                '</span><span class="ch">›</span></div><div class="bd">' + isiBab(r) + "</div></div>";
            });
        } else {
            var r1 = bab[+st.bi];
            if (r1) {
                h += '<div class="dd on"><div class="hd"><span class="nm">' + esc(sb) + " " + (+st.bi + 1) + ". " + esc(r1.judul) +
                (r1.arab ? '<div class="ar" style="font-size:calc(1.3rem * var(--z,1));margin-top:4px">' + esc(r1.arab) + "</div>" : "") +
                '</span></div><div class="bd">' + isiBab(r1) + "</div></div>";
            }
        }
        return h;
    }

    function view() {
        var d = st.sel ? cariItem(st.sel) : null, b = konten(d), sb = (b && b.sebutan) || "Bab";
        var elK = document.getElementById("NF"); // Nama File
        var elB = document.getElementById("P");  // Pembahasan
        
        if (elK) {
            var hk = '<option value=""' + (d ? "" : " selected") + ">" + config.labelPilih + "</option>";
            if(window.DATA_READER) {
                window.DATA_READER.forEach(function (g) {
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
        
        var main = document.getElementById("H"); // Halaman
        if (main) main.innerHTML = detail();
    }

    function pilih(id) {
        st.sel = id; st.bi = "all"; st.warn = false;
        if (id) muatIsi(cariItem(id));
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
        var el = document.getElementById("C");
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
    function tutupSaran() { var el = document.getElementById("C"); if(el) el.value = ""; tampilSaran(); }

    var lastWarn = 0;
    function peringatan() {
        var now = Date.now();
        if (now - lastWarn < 900) return;
        lastWarn = now; st.warn = true;
        var rt = document.getElementById("H"); if (rt) rt.innerHTML = detail();
        alert(config.labelKosong);
    }

    var elApp = document.getElementById("app");
    if(elApp && !elApp.dataset.bound) {
        elApp.dataset.bound = "1";
        elApp.addEventListener("input", function (e) { if (e.target.id === "C") tampilSaran(); });
        elApp.addEventListener("keydown", function (e) {
            if (e.target.id === "C" && e.key === "Enter") { var r = tampilSaran(); if (r[0]) { tutupSaran(); pilih(r[0].id); } }
            if (e.target.id === "P" && !st.sel) { e.preventDefault(); peringatan(); }
        });
        elApp.addEventListener("mousedown", function (e) { if (e.target.id === "P" && !st.sel) { e.preventDefault(); e.target.blur(); peringatan(); } });
        elApp.addEventListener("change", function (e) {
            if (e.target.id === "NF") pilih(+e.target.value || 0);
            if (e.target.id === "P" && st.sel) { st.bi = e.target.value; view(); }
        });
        elApp.addEventListener("click", function (e) {
            var t = e.target;
            var li = t.closest && t.closest(".li[data-id]");
            if (li) { var id = +li.getAttribute("data-id"); tutupSaran(); pilih(id); return; }
            if (t.getAttribute && t.getAttribute("data-retry")) { e.preventDefault(); var d = cariItem(st.sel); if (d) { st.ld[d.id] = ""; muatIsi(d); view(); } return; }
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
    var elB = document.getElementById("P");
    if(elB && !elB.innerHTML.trim()) elB.innerHTML = '<option value="all">Pembahasan</option>';
    muatDataInduk();
};


