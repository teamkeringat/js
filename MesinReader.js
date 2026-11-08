window.bukaReader = function(config) {
    config = config || {};
    var elCari = document.getElementById("C");
    if (elCari) elCari.placeholder = config.placeholderCari || "Cari...";

    var st = { all: [], sel: 0, ob: {}, q: "" };
    window.KONTEN = window.KONTEN || {};

    function esc(t) {
        return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
        });
    }

    function muatData() {
        if (typeof window.DATA_READER === "undefined") {
            document.getElementById("H").innerHTML =
                '<div class="msg">File DaftarData.js gagal dimuat / variabel DATA_READER tidak ada.</div>';
            return;
        }
        var n = 0;
        window.DATA_READER.forEach(function (grup) {
            (grup[2] || []).forEach(function (item) {
                n++;
                st.all.push({
                    id: n,
                    nama: item[0],
                    penyusun: item[1] || "",
                    sumber: item[2] || "",
                    file: item[3]
                });
            });
        });
        renderDropdown();
        renderHalaman();
    }

    function renderDropdown() {
        var elK = document.getElementById("NF");
        if (!elK) return;
        var q = st.q.toLowerCase();
        var hk = '<option value="">' + esc(config.labelPilih || "— Pilih —") + '</option>';
        st.all.forEach(function (x) {
            if (q && x.nama.toLowerCase().indexOf(q) === -1) return;
            hk += '<option value="' + x.id + '"' +
                  (x.id === st.sel ? " selected" : "") + '>' +
                  esc(x.nama) + '</option>';
        });
        elK.innerHTML = hk;
    }

    function panggilFile(item) {
        if (!item) { renderHalaman(); return; }
        if (window.KONTEN[item.nama]) { renderHalaman(); return; }

        document.getElementById("H").innerHTML = '<div class="msg">Memuat isi...</div>';

        var script = document.createElement("script");
        script.src = (window.DATA_BASE || "") + item.file + ".js";

        script.onload = function () {
            script.remove();
            if (window.KONTEN[item.nama]) renderHalaman();
            else document.getElementById("H").innerHTML =
                '<div class="msg">File <b>' + esc(item.file) + '.js</b> dimuat, tapi key KONTEN tidak cocok.<br>' +
                'Pastikan di dalam file ada: <code>window.KONTEN["' + esc(item.nama) + '"] = { ... }</code></div>';
        };
        script.onerror = function () {
            script.remove();
            document.getElementById("H").innerHTML =
                '<div class="msg">Gagal memanggil <b>' + esc(item.file) + '.js</b>.<br>' +
                'Cek <code>window.DATA_BASE</code> — saat ini: <code>' +
                esc(window.DATA_BASE || "(kosong)") + '</code></div>';
        };
        document.head.appendChild(script);
    }

    function renderHalaman() {
        var divH = document.getElementById("H");
        if (!divH) return;

        if (!st.sel) {
            divH.innerHTML = '<div class="msg">' + esc(config.labelKosong || "Silakan pilih dari dropdown di atas.") + '</div>';
            return;
        }

        var item = st.all.filter(function (x) { return x.id === st.sel; })[0];
        if (!item) { divH.innerHTML = '<div class="msg">Item tidak ditemukan.</div>'; return; }

        var konten = window.KONTEN[item.nama];

        var html = '<div class="ic">';
        html += '<div class="bh">' + esc(item.nama) + '</div>';
        if (item.penyusun || item.sumber) {
            html += '<div class="tn" style="text-align:center">' +
                    esc(item.penyusun) + (item.penyusun && item.sumber ? ' · ' : '') +
                    esc(item.sumber) + '</div>';
        }
        html += '</div>';

        if (konten && konten.bab) {
            konten.bab.forEach(function (bab, i) {
                var key = item.id + ":" + i;
                var isOpen = st.ob[key] !== false;
                html += '<div class="dd' + (isOpen ? " on" : "") + '" data-b="' + key + '">';
                html += '<div class="hd"><span class="nm">' + esc(bab.judul) + '</span><span class="ch">›</span></div>';
                html += '<div class="bd">';
                if (bab.isi) bab.isi.forEach(function (baris) {
                    if (baris.ar) html += '<div class="ar">' + esc(baris.ar) + '</div>';
                    if (baris.tr) html += '<div class="tr">' + esc(baris.tr) + '</div>';
                });
                if (bab.penjelasan) html += '<div class="pj"><b>Penjelasan:</b><br>' + esc(bab.penjelasan) + '</div>';
                html += '</div></div>';
            });
        } else {
            html += '<div class="msg">Isi doa kosong atau format tidak sesuai.</div>';
        }
        divH.innerHTML = html;
    }

    var elNF = document.getElementById("NF");
    if (elNF) elNF.addEventListener("change", function (e) {
        st.sel = parseInt(e.target.value, 10) || 0;
        if (st.sel) panggilFile(st.all.filter(function(x){ return x.id === st.sel; })[0]);
        else renderHalaman();
    });

    if (elCari) elCari.addEventListener("input", function (e) {
        st.q = e.target.value || "";
        renderDropdown();
    });

    var elH = document.getElementById("H");
    if (elH) elH.addEventListener("click", function (e) {
        var hd = e.target.closest(".hd");
        if (!hd) return;
        var dd = hd.parentNode;
        var key = dd.getAttribute("data-b");
        var isOpen = st.ob[key] === false;
        st.ob[key] = isOpen;
        dd.classList.toggle("on", isOpen);
    });

    muatData();
};
