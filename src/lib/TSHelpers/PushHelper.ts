const SERVICE_WORKER = '/push-sw.js';

export type PushState = 'unsupported' | 'needs-install' | 'blocked' | 'off' | 'on';

function isIos(): boolean {
	return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isInstalled(): boolean {
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

function urlBase64ToBytes(value: string): Uint8Array<ArrayBuffer> {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
	return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function bytesToUrlBase64(buffer: ArrayBuffer | null): string {
	const bytes = new Uint8Array(buffer ?? new ArrayBuffer(0));
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export async function getPushState(): Promise<PushState> {
	// iOS only offers push to apps added to the home screen
	if (isIos() && !isInstalled()) return 'needs-install';
	if (!('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window)) {
		return 'unsupported';
	}
	if (Notification.permission === 'denied') return 'blocked';

	const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER);
	const subscription = await registration?.pushManager.getSubscription();
	return subscription && Notification.permission === 'granted' ? 'on' : 'off';
}

async function post(body: object): Promise<void> {
	const res = await fetch('/api/push', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(await res.text());
}

/** Asks for permission and registers this device. Throws an Error with a user readable message. */
export async function enablePush(): Promise<void> {
	if ((await Notification.requestPermission()) !== 'granted') {
		throw new Error('Benachrichtigungen wurden nicht erlaubt');
	}

	const keyRes = await fetch('/api/push');
	if (!keyRes.ok) throw new Error(await keyRes.text());
	const key = (await keyRes.text()).trim();

	const registration = await navigator.serviceWorker.register(SERVICE_WORKER);
	await navigator.serviceWorker.ready;

	const subscription =
		(await registration.pushManager.getSubscription()) ??
		(await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToBytes(key)
		}));

	await post({
		action: 'subscribe',
		endpoint: subscription.endpoint,
		p256dh: bytesToUrlBase64(subscription.getKey('p256dh')),
		auth: bytesToUrlBase64(subscription.getKey('auth'))
	});
}

export async function disablePush(): Promise<void> {
	const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER);
	const subscription = await registration?.pushManager.getSubscription();
	if (!subscription) return;

	// the device is unsubscribed even if the server does not know it anymore
	await post({ action: 'unsubscribe', endpoint: subscription.endpoint }).catch(() => {});
	await subscription.unsubscribe();
}
