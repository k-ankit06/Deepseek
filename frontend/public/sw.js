// Service Worker for Smart Attendance System
// Enables offline functionality

const CACHE_NAME = 'smart-attendance-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Cache failed:', error);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip API requests - let them go to network
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/ai')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    // Return cached response for API failures
                    return new Response(
                        JSON.stringify({
                            success: false,
                            offline: true,
                            message: 'You are offline. Data will sync when connected.'
                        }),
                        {
                            headers: { 'Content-Type': 'application/json' },
                            status: 503
                        }
                    );
                })
        );
        return;
    }

    // For navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Return cached page or offline page
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            return caches.match(OFFLINE_URL);
                        });
                })
        );
        return;
    }

    // For other assets (JS, CSS, images)
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    fetch(request)
                        .then((response) => {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, response);
                            });
                        })
                        .catch(() => { });

                    return cachedResponse;
                }

                // Not in cache - fetch from network
                return fetch(request)
                    .then((response) => {
                        // Cache the new response
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline fallback for images
                        if (request.destination === 'image') {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle">Offline</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

// Background sync for offline attendance
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);

    if (event.tag === 'sync-attendance') {
        event.waitUntil(syncOfflineAttendance());
    }
});

// Sync offline attendance data
async function syncOfflineAttendance() {
    try {
        // Get offline data from IndexedDB
        const offlineData = await getOfflineData();

        if (offlineData.length === 0) {
            console.log('[SW] No offline data to sync');
            return;
        }

        console.log('[SW] Syncing', offlineData.length, 'offline records');

        // Send each record to server
        for (const record of offlineData) {
            try {
                const response = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record)
                });

                if (response.ok) {
                    await deleteOfflineRecord(record.id);
                    console.log('[SW] Synced record:', record.id);
                }
            } catch (error) {
                console.error('[SW] Failed to sync record:', record.id, error);
            }
        }

        // Notify user
        self.registration.showNotification('Attendance Synced', {
            body: `${offlineData.length} offline attendance records synced successfully!`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png'
        });

    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// IndexedDB helpers
function getOfflineData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AttendanceDB', 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('offlineAttendance', 'readonly');
            const store = tx.objectStore('offlineAttendance');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineAttendance')) {
                db.createObjectStore('offlineAttendance', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function deleteOfflineRecord(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AttendanceDB', 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('offlineAttendance', 'readwrite');
            const store = tx.objectStore('offlineAttendance');
            const deleteRequest = store.delete(id);

            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

// Push notification handler
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};

    const options = {
        body: data.body || 'New notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Smart Attendance', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // Focus existing window or open new one
                for (const client of clientList) {
                    if (client.url === event.notification.data && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data);
                }
            })
    );
});

console.log('[SW] Service Worker loaded');
