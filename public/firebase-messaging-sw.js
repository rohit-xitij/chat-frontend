importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyD5hTaAi7ilKvcaVLCfDH9q2hGDMfzbFBs",
  authDomain: "push-notification-system-aa1fd.firebaseapp.com",
  projectId: "push-notification-system-aa1fd",
  storageBucket: "push-notification-system-aa1fd.firebasestorage.app",
  messagingSenderId: "971990110282",
  appId: "1:971990110282:web:9a6758b40031f2803d56b3",
  measurementId: "G-TEV70Q8TQV",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: payload.notification?.icon || "/chat-icon.png",
    data: payload.data || {},
    tag: "chat-notification",
    badge: "/badge.png",
    click_action: "/chat",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event);
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url === "/" || client.url.includes("/chat")) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow("/chat");
        }
      }),
  );
});
