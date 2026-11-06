/* File Data Doa - Menarik langsung dari API EQuran.id */
(function() {
    // Tampilkan pesan loading di area utama
    var main = document.getElementById("main");
    if (main) main.innerHTML = '<div class="msg">Memuat daftar doa dari EQuran.id...</div>';

    fetch("https://equran.id/api/doa")
        .then(function(res) {
            if (!res.ok) throw new Error("Gagal koneksi ke API");
            return res.json();
        })
        .then(function(json) {
            // API EQuran.id mengembalikan array langsung di properti 'data'
            var doaList = json.data || json;
            if (!Array.isArray(doaList)) throw new Error("Format data tidak dikenal");

            // Konversi data API ke format window.DATA_READER yang diminta mesin-reader.js
            // Format: [kategori, pengantar, [ [nama, arab, pengarangArab, pengarangLatin, arti, penjelasan, tingkat] ]]
            var grouped = {};
            doaList.forEach(function(d) {
                var grup = d.grup || "Doa Harian";
                if (!grouped[grup]) grouped[grup] = [];
                
                // Data EQuran: nama, arab, latin, arti, tentang (referensi)
                grouped[grup].push([
                    d.nama || d.judul || "Doa",
                    d.ar || d.arab || "",
                    "", // pengarangArab (kosong)
                    d.latin || d.tr || "", // pengarangLatin (diisi latin)
                    d.arti || d.idn || "", // arti
                    d.tentang || d.referensi || "", // penjelasan
                    "P" // tingkat
                ]);
            });

            // Susun ulang menjadi array DATA_READER
            var arr = [];
            for (var k in grouped) {
                arr.push([k, "Kumpulan doa " + k, grouped[k]]);
            }
            
            window.DATA_READER = arr;
            
            // Picu ulang render mesin-reader.js jika sudah siap
            // (Karena mesin-reader.js memanggil muatDataInduk lalu view())
            // Kita panggil ulang view() secara manual jika sudah terdefinisi
            if (window.bukaReader) {
                // Trik: panggil ulang fungsi render internal dengan memicu event
                // Tapi karena kita tidak punya akses langsung ke view(), kita reload saja halamannya
                // Atau lebih baik, mesin-reader.js menunggu DATA_READER siap.
                // Karena script ini dimuat SEBELUM mesin-reader.js selesai inisialisasi,
                // kita bisa langsung set DATA_READER dan biarkan mesin membacanya.
            }
        })
        .catch(function(err) {
            if (main) main.innerHTML = '<div class="msg">Gagal memuat doa: ' + err.message + '<br><br>Pastikan koneksi internet lancar.</div>';
            // Set DATA_READER kosong agar mesin tidak error
            window.DATA_READER = [];
        });
})();

