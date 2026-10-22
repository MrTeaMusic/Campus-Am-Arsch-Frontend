// Service Worker nur für Push-Benachrichtigungen (Erinnerungen des gemeinsamen Kalenders)

self.addEventListener('push', (event) => {
	/** @type {{ title?: string, body?: string, url?: string }} */
	let data;
	try {
		data = event.data ? event.data.json() : {};
	} catch {
		data = { body: event.data ? event.data.text() : '' };
	}
	event.waitUntil(
		self.registration.showNotification(data.title || 'Campus-Am-Arsch', {
			body: data.body || '',
			icon: '/android-chrome-192x192.png?v=2',
			data: { url: data.url || '/dashboard' }
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = (event.notification.data && event.notification.data.url) || '/dashboard';
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
			for (const client of clients) {
				if ('focus' in client) return client.focus();
			}
			return self.clients.openWindow(url);
		})
	);
});
