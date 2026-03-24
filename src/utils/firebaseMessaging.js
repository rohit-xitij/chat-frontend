import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebaseConfig";
import api from "../api/api";

export const registerServiceWorker = async () => {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        if (r.scriptURL.includes("firebase-messaging-sw.js")) {
          await r.unregister();
        }
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      registration.update();
      return registration;
    }
  } catch (error) {
    console.warn("[FCM] Service Worker registration failed:", error.message);
  }
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      try {
        const token = await getToken(messaging, {
          vapidKey:
            "BN7R5qCDTIe_2cnxExrmj8-FRO9fK91GZw7_ashjbDR-o1w-Ti-O0HiE0UT7Bxq6DQv2jzMgmZ1my6wgqeJ5doc",
        });

        if (token) {
          try {
            await api.post("/users/register-fcm", { token });
            return token;
          } catch (apiError) {
            console.error(
              "[FCM] Failed to register token to server:",
              apiError.message,
            );
            return token;
          }
        } else {
          console.warn("[FCM] No registration token available");
        }
      } catch (tokenError) {
        console.error(
          "[FCM] Failed to get FCM token. Error code:",
          tokenError.code,
        );
      }
    } else {
      console.warn("[FCM] Notification permission not granted:", permission);
    }
  } catch (error) {
    console.error("[FCM] Unexpected error:", error.message);
  }
};

export const setupForegroundMessageHandler = (callback) => {
  onMessage(messaging, (payload) => {
    if (callback) {
      callback(payload);
    }

    if (Notification.permission === "granted") {
      new Notification(payload.notification?.title || "New Message", {
        body: payload.notification?.body,
        icon: payload.notification?.icon,
      });
    }
  });
};

export const removeNotificationToken = async (token) => {
  try {
    if (token) {
      await api.post("/users/remove-fcm", { token });
    }
  } catch (error) {
    console.warn("[FCM] Error removing FCM token:", error.message);
  }
};
