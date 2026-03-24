import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD5hTaAi7ilKvcaVLCfDH9q2hGDMfzbFBs",
  authDomain: "push-notification-system-aa1fd.firebaseapp.com",
  projectId: "push-notification-system-aa1fd",
  storageBucket: "push-notification-system-aa1fd.firebasestorage.app",
  messagingSenderId: "971990110282",
  appId: "1:971990110282:web:9a6758b40031f2803d56b3",
  measurementId: "G-TEV70Q8TQV",
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
export default app;
