/* ---------- Render isi doa ke #main ---------- */
function renderDoa(nama) {
  var main = document.getElementById("main");
  var selK = document.getElementById("k");
  var data = (window.KONTEN || {})[nama];

  if (!data) {
    main.innerHTML = '<div class="msg">Data tidak ditemukan.</div>';
    return;
  }
  if (selK && selK.value !== nama) selK.value = nama;

  var html = "";
  var babList = data.bab || [];

  babList.forEach(function (bab) {
    html += '<div class="ic">';

    // judul bab
    if (bab.judul) {
      html += '<div class="bh">' + esc(bab.judul) + "</div>";
    }

    // isi ayat / kalimat
    (bab.isi || []).forEach(function (item) {
      if (item.ar) html += '<div class="ar">' + esc(item.ar) + "</div>";
      if (item.lt) html += '<div class="lt">' + esc(item.lt) + "</div>";
      if (item.tr) html += '<div class="tr">' + esc(item.tr) + "</div>";
      if (item.tn) html += '<div class="tn">' + esc(item.tn) + "</div>";
    });

    // penjelasan bab — label "Penjelasan" + isi
    if (bab.penjelasan) {
      html += '<div class="pj">Penjelasan</div>';
      html += '<div class="pg">' + esc(bab.penjelasan) + "</div>";
    }

    html += "</div>";
  });

  main.innerHTML = html || '<div class="msg">(Tidak ada isi doa)</div>';
  window.scrollTo({ top: 0, behavior: "smooth" });
}
