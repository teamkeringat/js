/* ============================================================
   DAFTAR DOA (Dari API EQuran.id)
   Lokasi: https://teamkeringat.github.io/js/Daftar-Doa.js
   ============================================================ */

// Fungsi ini akan dipanggil oleh mesin-reader untuk mengisi data doa
window.muatDataDoa = function(callback) {
    fetch("https://equran.id/api/doa")
        .then(function(res) {
            if (!res.ok) throw new Error("Gagal koneksi ke API");
            return res.json();
        })
        .then(function(json) {
            var doaList = json.data || json;
            if (!Array.isArray(doaList)) throw new Error("Format data tidak dikenal");

            // Konversi ke format DATA_READER
            var grouped = {};
            doaList.forEach(function(d) {
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
            
            // Simpan ke window.DATA_READER
            window.DATA_READER = arr;
            
            // Panggil callback jika mesin siap
            if (callback) callback(arr);
        })
        .catch(function(err) {
            console.error("Gagal memuat doa:", err);
            if (callback) callback([]); // Kirim array kosong jika gagal
        });
};
