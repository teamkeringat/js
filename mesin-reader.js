/* ============================================================
   FUNGSI KHUSUS: DOA EQURAN.ID (Mode Dropdown Mandiri)
   ============================================================ */
window.bukaDoaEQuran = function () {
    var API = "https://equran.id/api/doa";
    var st = { all: [], sel: 0 };

    // Ambil Elemen UI
    var elQ = document.getElementById("q");
    var elK = document.getElementById("k"); // Dropdown Kiri (Nama Doa)
    var elB = document.getElementById("b"); // Dropdown Kanan (Pembahasan)
    var elMain = document.getElementById("main");
    var elStat = document.getElementById("stat");

    function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    function status() {
        if (!elStat) return;
        var p = window.NGPREF;
        if (p) elStat.textContent = "✅ Terhubung dengan pengaturan Ngelingan (Arab " + (p.font || 1) + ").";
        else elStat.textContent = "⏳ Menunggu pengaturan Ngelingan...";
    }

    // Render isi doa di area bawah (Main)
    function renderDetail() {
        var d = st.all.filter(function(x) { return String(x.id) === String(st.sel); })[0];
        if (!d) {
            elMain.innerHTML = '<div class="msg">Silakan pilih doa terlebih dahulu dari menu di atas.</div>';
            return;
        }

        var h = '<div class="ic">' +
                '<div class="bh">' + esc(d.nama) + ' — ' + esc(d.grup) + '</div>' +
                '<div class="ar">' + esc(d.ar) + '</div>' +
                (d.tr ? '<div class="lt">' + esc(d.tr) + '</div>' : '') +
                '<div class="tr">' + esc(d.idn) + '</div>' +
                (d.tentang ? '<div class="tn">' + esc(d.tentang) + '</div>' : '') +
                '</div>';
        elMain.innerHTML = h;
    }

    // Isi opsi ke dalam dropdown kiri
    function isiDropdown(dataArray) {
        var h = '<option value="">Pilih Doa</option>';
        dataArray.forEach(function (d) {
            h += '<option value="' + esc(d.id) + '">' + esc(d.nama) + '</option>';
        });
        if(elK) elK.innerHTML = h;
        
        // Dropdown kanan hanya statis
        if(elB) elB.innerHTML = '<option>Pembahasan</option>';
    }

    // Event Listener saat dropdown KIRI diubah
    if (elK) {
        elK.addEventListener("change", function(e) {
            st.sel = e.target.value;
            if(st.sel) elK.classList.remove("ph");
            renderDetail();
        });
    }

    // Event Listener saat mengetik di kotak pencarian
    if (elQ) {
        elQ.addEventListener("input", function(e) {
            var q = e.target.value.toLowerCase();
            var filter = st.all.filter(function(d) {
                return (d.nama + " " + d.idn).toLowerCase().indexOf(q) >= 0;
            });

            var h = '<option value="">' + (filter.length ? "Pilih Doa" : "Tidak ditemukan") + '</option>';
            filter.forEach(function (d) {
                h += '<option value="' + esc(d.id) + '">' + esc(d.nama) + '</option>';
            });
            if(elK) elK.innerHTML = h;
        });
    }

    // Mulai Proses
    window.addEventListener("ngpref", status);
    setTimeout(status, 2500);

    if(elMain) elMain.innerHTML = '<div class="msg">Memuat daftar doa...</div>';
    
    fetch(API)
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (j) {
            var d = Array.isArray(j) ? j : (j && j.data);
            if (!Array.isArray(d) || !d.length) throw new Error("data kosong");
            
            // Normalisasi data dari EQuran.id
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
            renderDetail(); // Menampilkan pesan "Silakan pilih doa"
        })
        .catch(function (e) {
            if(elMain) elMain.innerHTML = '<div class="msg">Gagal memuat doa (' + esc(e.message) + ').<br>Periksa koneksi internet.</div>';
        });
};
