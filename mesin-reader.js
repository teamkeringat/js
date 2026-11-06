/* ============================================================
   FUNGSI KHUSUS: DOA EQURAN.ID (Versi Rapi)
   ============================================================ */
window.bukaDoaEQuran = function () {
    var API = "https://equran.id/api/doa";
    var app = document.getElementById("app");
    var st = { all: [], q: "" };

    // Elemen UI
    var elQ = document.getElementById("q");
    var elK = document.getElementById("k"); // Dropdown Kiri (Kategori)
    var elB = document.getElementById("b"); // Dropdown Kanan (Pembahasan)
    var elMain = document.getElementById("main");
    var elStat = document.getElementById("stat");

    // Fungsi Bantuan
    function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    function status() {
        if (!elStat) return;
        var p = window.NGPREF;
        if (p) elStat.textContent = "✅ Terhubung dengan pengaturan Ngelingan (Arab " + (p.font || 1) + ").";
        else elStat.textContent = "⏳ Menunggu pengaturan Ngelingan...";
    }

    // Render Daftar Doa (Masuk ke div #main)
    function renderList() {
        var q = st.q.toLowerCase();
        var list = st.all.filter(function (d) {
            return !q || (d.nama + " " + d.idn + " " + d.tr).toLowerCase().indexOf(q) >= 0;
        });

        var h = "";
        if (!list.length) {
            h = '<div class="msg">Doa tidak ditemukan.</div>';
        } else {
            list.forEach(function (d) {
                h += '<div class="dd" data-id="' + esc(d.id) + '">' +
                     '<div class="hd"><span class="no">' + esc(d.id) + '</span>' +
                     '<div class="nm">' + esc(d.nama) + '</div>' +
                     '<span class="ch">›</span></div>' +
                     '<div class="bd">' +
                     '<div class="ar">' + esc(d.ar) + '</div>' +
                     (d.tr ? '<div class="lt">' + esc(d.tr) + '</div>' : '') +
                     '<div class="tr">' + esc(d.idn) + '</div>' +
                     (d.tentang ? '<div class="tn">' + esc(d.tentang) + '</div>' : '') +
                     '</div></div>';
            });
        }
        elMain.innerHTML = h;
    }

    // Isi Dropdown Kiri (Kategori)
    function isiDropdown() {
        var grups = [];
        st.all.forEach(function (d) { if (d.grup && grups.indexOf(d.grup) < 0) grups.push(d.grup); });
        
        var h = '<option value="">Semua Kategori</option>';
        grups.forEach(function (g) { h += '<option value="' + esc(g) + '">' + esc(g) + '</option>'; });
        if(elK) elK.innerHTML = h;

        if(elB) elB.innerHTML = '<option>Pembahasan</option>'; // Dropdown kanan statis
    }

    // Event: Pencarian
    if (elQ) {
        elQ.addEventListener("input", function (e) {
            st.q = e.target.value;
            renderList();
        });
    }

    // Event: Buka/Tutup Accordion
    if (elMain) {
        elMain.addEventListener("click", function (e) {
            var hd = e.target.closest && e.target.closest(".hd");
            if (hd) {
                var box = hd.parentNode;
                box.classList.toggle("on");
            }
        });
    }

    window.addEventListener("ngpref", status);
    setTimeout(status, 2500);

    // Tarik Data
    elMain.innerHTML = '<div class="msg">Memuat doa...</div>';
    fetch(API)
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (j) {
            var d = Array.isArray(j) ? j : (j && j.data);
            if (!Array.isArray(d) || !d.length) throw new Error("data kosong");
            
            // Normalisasi data
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
            
            isiDropdown();
            renderList();
        })
        .catch(function (e) {
            elMain.innerHTML = '<div class="msg">Gagal memuat doa (' + esc(e.message) + ').<br>Periksa koneksi internet.</div>';
        });
};
