// firebase-config.js
// SIMPAN FILE INI DI GITHUB (Bukan di Blogspot) agar API Key tidak terlihat

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 1. GANTI DENGAN API KEY FIREBASE BOSS
// (Buka Firebase Console > Project Settings > General > Your Apps)
// ==========================================
const firebaseConfig = {
  apiKey: "ISI_API_KEY_BOSS_DISINI",
  authDomain: "team-keringat.firebaseapp.com",
  projectId: "team-keringat",
  storageBucket: "team-keringat.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================================
// FUNGSI AUTENTIKASI
// ==========================================
window.fbLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Ambil data role dari database users
    const docRef = doc(db, "users", userCredential.user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.role === 'pending') {
        await signOut(auth);
        throw new Error("Akun Anda belum disetujui Admin.");
      }
      return { uid: userCredential.user.uid, ...userData };
    } else {
      throw new Error("Data user tidak ditemukan di database.");
    }
  } catch (error) {
    throw error;
  }
};

window.fbDaftar = async (email, password, nama, hp) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Simpan data ke koleksi users dengan status pending
    await addDoc(collection(db, "users"), {
      uid: userCredential.user.uid,
      nama: nama,
      email: email,
      noHp: hp,
      role: "pending", // Menunggu persetujuan
      avatar: `https://ui-avatars.com/api/?name=${nama}&background=random`,
      createdAt: serverTimestamp()
    });
    await signOut(auth); // Logout otomatis setelah daftar
    return true;
  } catch (error) {
    throw error;
  }
};

window.fbLogout = async () => {
  await signOut(auth);
};

// Cek status login saat halaman dimuat
window.fbCekLogin = (callback) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        callback({ uid: user.uid, ...docSnap.data() });
      }
    } else {
      callback(null);
    }
  });
};

// ==========================================
// FUNGSI CRUD DATA (Bisa dipanggil dari HTML Blogspot)
// ==========================================

// Ambil semua data dari koleksi
window.fbGetData = async (koleksi) => {
  const querySnapshot = await getDocs(collection(db, koleksi));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
};

// Tambah data
window.fbTambah = async (koleksi, dataBaru) => {
  await addDoc(collection(db, koleksi), { ...dataBaru, createdAt: serverTimestamp() });
};

// Edit data
window.fbEdit = async (koleksi, id, dataBaru) => {
  const docRef = doc(db, koleksi, id);
  await updateDoc(docRef, { ...dataBaru, updatedAt: serverTimestamp() });
};

// Hapus data
window.fbHapus = async (koleksi, id) => {
  await deleteDoc(doc(db, koleksi, id));
};

// Khusus ganti role user (Approved / jadi Admin)
window.fbSetRole = async (uid, roleBaru) => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { role: roleBaru });
};

// Khusus Absensi
window.fbAbsen = async (userData, status, alasan) => {
  await addDoc(collection(db, "absensi"), {
    userId: userData.uid,
    nama: userData.nama,
    status: status,
    alasan: alasan,
    waktu: new Date().toLocaleString('id-ID'),
    createdAt: serverTimestamp()
  });
};

