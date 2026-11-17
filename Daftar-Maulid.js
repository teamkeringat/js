/* 
  KATALOG KITAB MAULID
  Format Data: [kategori, pengantar, [ [nama, judulArab, pengarangArab, pengarangLatin, artiJudul, penjelasan, tingkat P/M/L], ... ]]
*/
var DATA = [
  ["Maulid & Shalawat", "Kumpulan bacaan maulid dan pujian kepada Nabi Muhammad SAW.", [
    ["Simtudduror", "سِمْطُ الدُّرَرِ", "علي الحبشي", "Habib Ali bin Muhammad Al-Habsyi", "Untaian mutiara", "Maulid yang dibaca di banyak majelis, sastra yang indah.", "P"],
    ["Barjanji", "عِقْدُ الْجَوْهَرِ", "جعفر البرزنجي", "Ja'far al-Barzanji", "Untaian permata", "Syair dan kisah kelahiran Nabi yang sering dibaca.", "P"],
    ["Dibai", "مَوْلِدُ الدِّيبَعِيِّ", "عبد الرحمن الديبعي", "Abdurrahman ad-Diba'i", "Maulid Diba'i", "Bacaan maulid Nabi yang banyak dibaca di majelis.", "P"],
    ["QosidahBurdah", "قَصِيدَةُ الْبُرْدَةِ", "شرف الدين البوصيري", "Imam Al-Bushiri", "Qasidah Burdah", "Syair pujian kepada Nabi yang terkenal.", "P"]
  ]]
];

// =====================================================================
// PEMETAAN NAMA FILE KUSTOM
// =====================================================================
// Memastikan Mesin-Reader memanggil file yang persis sama dengan nama di atas
var FILE = {
  "Simtudduror": "Simtudduror.js",
  "Barjanji": "Barjanji.js",
  "Dibai": "Dibai.js",
  "QosidahBurdah": "QosidahBurdah.js"
};
