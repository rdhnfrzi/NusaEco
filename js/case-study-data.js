/* NUSA ECO — data acuan studi kasus standar Bank Sampah Sekolah Adiwiyata.
   Angka berikut berasal dari materi acuan yang diberikan pengguna; bukan data live sekolah. */
(function(){
  window.NUSA_DATA = Object.freeze({
    period: "per bulan",
    totalKg: 170,
    categories: [
      { key: "organik", label: "Organik", kg: 85, note: "100% diolah menjadi kompos" },
      { key: "kertas", label: "Kertas", kg: 45, note: "Dipilah dan disalurkan untuk daur ulang" },
      { key: "plastik", label: "Plastik", kg: 30, note: "Didaur ulang, dimanfaatkan sebagai kerajinan/ecobrick sesuai jenis" },
      { key: "logam-kaca", label: "Logam & Kaca", kg: 10, note: "Dipilah dan disalurkan ke pengelola daur ulang" }
    ],
    students: 450,
    activeMembers: 380,
    participationPct: 84.4,
    managedPct: 77.5,
    residuePct: 22.5,
    managedRange: [75, 80],
    residueRange: [20, 25],
    sourceLabel: "Model studi kasus standar dan acuan rata-rata implementasi program Sekolah Adiwiyata (Bank Sampah Sekolah)"
  });
})();
