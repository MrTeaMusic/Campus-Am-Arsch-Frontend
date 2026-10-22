import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { handleApiRequest } from '$lib/server/handleCdApiRequest';

const endpoints = {
	subscribe: 'subscribe_push',
	unsubscribe: 'unsubscribe_push'
};

/** Public VAPID key for pushManager.subscribe */
export async function GET({ cookies }) {
	return handleApiRequest(cookies, 'get_push_key', 'Fehler beim Laden des Push-Schlüssels');
}

export async function POST({ cookies, request }) {
	const token = cookies.get('jwt');
	if (!token) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { action, ...body } = await request.json();
	const endpoint = endpoints[/** @type {keyof typeof endpoints} */ (action)];
	if (!endpoint) {
		return new Response('Unbekannte Aktion', { status: 400 });
	}

	try {
		const response = await fetch(`${env.CD_API_URL}/${endpoint}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		// the API's own messages (invalid input, too many devices) are meant for the user
		if (response.status === 400 || response.status === 404) {
			const { error } = await response.json();
			return new Response(error, { status: response.status });
		}
		if (response.status === 429) {
			return new Response('Zu viele Anfragen', { status: 429 });
		}
		if (!response.ok) {
			throw new Error(`status ${response.status}`);
		}
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error('Error at cd/', endpoint, error);
		return new Response('Fehler bei den Benachrichtigungen', { status: 500 });
	}
}
