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

        // Judul cuma satu (nama doa saja)
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
            // Jika doa yang sedang dipilih hilang dari filter, kosongkan tampilan
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
