import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { handleApiRequest } from '$lib/server/handleCdApiRequest';

const endpoints = {
	add: 'add_shared_event',
	update: 'update_shared_event',
	delete: 'delete_shared_event'
};

export async function GET({ cookies, url }) {
	const from = url.searchParams.get('from') ?? '';
	return handleApiRequest(
		cookies,
		`get_shared_events?from=${encodeURIComponent(from)}`,
		'Fehler beim Laden des gemeinsamen Kalenders'
	);
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

		// the API's own messages (invalid input, not your entry) are meant for the user
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
		return new Response(response.status === 204 ? null : await response.text(), {
			status: response.status
		});
	} catch (error) {
		console.error('Error at cd/', endpoint, error);
		return new Response('Fehler beim gemeinsamen Kalender', { status: 500 });
	}
}
