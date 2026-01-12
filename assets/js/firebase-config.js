// Firebase Configuration
// 환경 변수에서 Firebase 설정을 가져옵니다
// 브라우저 환경에서는 import.meta.env를 사용합니다 (Vite)
// 또는 직접 환경 변수를 읽어올 수 있습니다

// 환경 변수에서 Firebase 설정 가져오기
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvJYiARiK-hZAN01xovL28H3OoVaezEfw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thelune-f3e41.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thelune-f3e41",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thelune-f3e41.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "633942854938",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:633942854938:web:d16f719d15fc919d1f70a3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2Y8R7TJCGD"
};

// Firebase 초기화 (ES6 모듈 방식)
export { firebaseConfig };

// CommonJS 방식도 지원 (필요한 경우)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig };
}





