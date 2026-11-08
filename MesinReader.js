window.bukaReader = function(config) {
    var elCari = document.getElementById("C");
    if (elCari) elCari.placeholder = config.placeholderCari || "Cari...";
    
    var st = { all: [], sel: 0 };
    window.KONTEN = window.KONTEN || {};

    // Fungsi pengaman teks
    function esc(t) { return String(t || "").replace(/[&<>"]/g, function (c) { return { "&": "&", "<": "<", ">": ">", '"': '"' }[c]; }); }

    // 1. Muat Data Induk
    function muatData() {
        if (!window.DATA_READER) {
            document.getElementById("H").innerHTML = '<div class="msg">File Daftar-Data.js tidak ditemukan.</div>';
            return;
        }
        
        var n = 0;
        window.DATA_READER.forEach(function (grup) {
            grup[2].forEach(function (item) {
                n++;
                // item[0]=Judul, item[1]=Penyusun, item[2]=Sumber, item[3]=Nama File
                st.all.push({ 
                    id: n, 
                    nama: item[0], 
                    penyusun: item[1], 
                    sumber: item[2], 
                    file: item[3] // <--- LANGSUNG AMBIL NAMA FILE
                });
            });
        });
        
        renderDropdown();
        renderHalaman();
    }

    // 2. Render Dropdown Pilihan
    function renderDropdown() {
        var elK = document.getElementById("NF");
        if (!elK) return;
        var hk = '<option value="">' + config.labelPilih + '</option>';
        st.all.forEach(function (x) {
            hk += '<option value="' + x.id + '"' + (x.id === st.sel ? " selected" : "") + '>' + esc(x.nama) + '</option>';
        });
        elK.innerHTML = hk;
    }

    // 3. Panggil File Doa Sesuai Nama File
    function panggilFile(item) {
        if (window.KONTEN[item.nama]) { renderHalaman(); return; }
        
        document.getElementById("H").innerHTML = '<div class="msg">Memuat isi...</div>';
        
        var script = document.createElement("script");
        script.src = (window.DATA_BASE || "") + item.file + ".js";
        
        script.onload = function() {
            if (window.KONTEN[item.nama]) {
                renderHalaman();
            } else {
                document.getElementById("H").innerHTML = '<div class="msg">File ' + item.file + '.js berhasil dimuat, tapi kunci KONTEN tidak cocok. Pastikan di dalam file tertulis: window.KONTEN["' + item.nama + '"]</div>';
            }
        };
        
        script.onerror = function() {
            document.getElementById("H").innerHTML = '<div class="msg">Gagal memanggil file: <b>' + item.file + '.js</b>. Pastikan nama file fisiknya sama persis.</div>';
        };
        
        document.head.appendChild(script);
    }

    // 4. Render Tampilan Isi Doa
    function renderHalaman() {
        var divH = document.getElementById("H");
        if (!divH) return;

        if (!st.sel) {
            divH.innerHTML = '<div class="msg">' + config.labelKosong + '</div>';
            return;
        }

        var item = st.all.filter(function(x){ return x.id === st.sel; })[0];
        var konten = window.KONTEN[item.nama];
        
        var html = '';
        
        // Kotak Judul (Center)
        html += '<div class="ic">';
        html += '<div class="bh">' + esc(item.nama) + '</div>';
        if (item.penyusun) html += '<div class="tn" style="text-align:center">' + esc(item.penyusun) + ' · ' + esc(item.sumber) + '</div>';
        html += '</div>';

        // Render Isi Doa
        if (konten && konten.bab) {
            konten.bab.forEach(function(bab) {
                html += '<div class="dd on">';
                html += '<div class="hd"><span class="nm">' + esc(bab.judul) + '</span></div>';
                html += '<div class="bd">';
                
                // Render Arab & Arti berpasangan
                if (bab.isi) {
                    bab.isi.forEach(function(baris) {
                        if (baris.ar) html += '<div class="ar">' + esc(baris.ar) + '</div>';
                        if (baris.tr) html += '<div class="tr">' + esc(baris.tr) + '</div>';
                    });
                }
                
                // Render Penjelasan
                if (bab.penjelasan) {
                    html += '<div class="pj" style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">';
                    html += '<b>Penjelasan:</b><br>' + esc(bab.penjelasan);
                    html += '</div>';
                }
                
                html += '</div></div>';
            });
        } else {
            html += '<div class="msg">Isi doa kosong atau format tidak sesuai.</div>';
        }

        divH.innerHTML = html;
    }

    // 5. Event Listener
    document.getElementById("NF").addEventListener("change", function(e) {
        st.sel = parseInt(e.target.value) || 0;
        if (st.sel) {
            var item = st.all.filter(function(x){ return x.id === st.sel; })[0];
            panggilFile(item);
        } else {
            renderHalaman();
        }
    });

    // Mulai
    muatData();
};
