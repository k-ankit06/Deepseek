// Firebase Configuration for Smart Attendance System
// Replace these values with your Firebase project config

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// TODO: Replace with your Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// VAPID Key for Push Notifications
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "YOUR_VAPID_KEY";

// Initialize Firebase
let app;
let messaging;

try {
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Cloud Messaging (only in browser with notification support)
    if (typeof window !== 'undefined' && 'Notification' in window) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const requestNotificationPermission = async () => {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        // Get FCM token
        if (messaging) {
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });

            console.log('FCM Token:', token);
            return token;
        }

        return null;
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
};

/**
 * Listen for foreground messages
 * @param {Function} callback - Function to call when message is received
 */
export const onForegroundMessage = (callback) => {
    if (messaging) {
        onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            callback(payload);
        });
    }
};

/**
 * Show a notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/icons/icon.svg',
            badge: '/icons/icon.svg',
            vibrate: [100, 50, 100],
            ...options
        });
    }
};

export { app, messaging };
export default app;
