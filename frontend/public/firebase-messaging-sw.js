// Firebase Cloud Messaging Service Worker
// This handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker with actual config
firebase.initializeApp({
    apiKey: "AIzaSyAcW7h3xkr-UXqAnhCfuOGROjZiLj3537U",
    authDomain: "smart-attendance-system-68e4d.firebaseapp.com",
    projectId: "smart-attendance-system-68e4d",
    storageBucket: "smart-attendance-system-68e4d.firebasestorage.app",
    messagingSenderId: "320520197852",
    appId: "1:320520197852:web:6786f3775cd78cd5e94619"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Smart Attendance';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        vibrate: [100, 50, 100],
        data: payload.data || {},
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        tag: payload.data?.tag || 'attendance-notification',
        renotify: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[FCM SW] Notification clicked:', event);

    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};

    if (action === 'dismiss') {
        return;
    }

    // Default action - open the app
    const urlToOpen = data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window open
                for (let client of windowClients) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        if (data.url) {
                            client.navigate(data.url);
                        }
                        return;
                    }
                }
                // If not, open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

console.log('[FCM SW] Firebase Messaging Service Worker loaded');
