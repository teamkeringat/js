
/* ============================================================
   DAFTAR DOA (Dari API EQuran.id)
   Lokasi: https://teamkeringat.github.io/js/Daftar-Doa.js
   ============================================================ */

window.muatDataDoa = function (callback) {
    // Tampilkan pesan loading di area utama (jika elemennya ada)
    var main = document.getElementById("main");
    if (main) main.innerHTML = '<div class="msg">Memuat daftar doa dari EQuran.id...</div>';

    fetch("https://equran.id/api/doa")
        .then(function (res) {
            if (!res.ok) throw new Error("Gagal koneksi ke API");
            return res.json();
        })
        .then(function (json) {
            var doaList = json.data || json;
            if (!Array.isArray(doaList)) throw new Error("Format data tidak dikenal");

            // Konversi data EQuran.id ke format window.DATA_READER
            // Format: [kategori, pengantar, [ [nama, arab, pengarangArab, pengarangLatin, arti, penjelasan, tingkat] ]]
            var grouped = {};
            doaList.forEach(function (d) {
                var grup = d.grup || "Doa Harian";
                if (!grouped[grup]) grouped[grup] = [];
                
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

            var arr = [];
            for (var k in grouped) {
                arr.push([k, "Kumpulan doa " + k, grouped[k]]);
            }
            
            // Simpan ke variabel global agar dibaca mesin
            window.DATA_READER = arr;
            
            // Jalankan callback jika mesin siap
            if (typeof callback === "function") {
                callback(arr);
            }
        })
        .catch(function (err) {
            console.error("Gagal memuat doa:", err);
            if (main) main.innerHTML = '<div class="msg">Gagal memuat doa dari EQuran.id.<br>Periksa koneksi internet Anda.</div>';
            
            // Kirim array kosong ke callback agar mesin tidak error
            if (typeof callback === "function") {
                callback([]);
            }
        });
};
