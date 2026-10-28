import { handleApiRequest } from '$lib/server/handleCdApiRequest';

export async function GET({ cookies, url }) {
	const id = url.searchParams.get('id') ?? '';
	const response = await handleApiRequest(
		cookies,
		`get_student_document?id=${encodeURIComponent(id)}`,
		'Fehler beim Abruf des Dokuments'
	);
	if (!response.ok) {
		return response;
	}

	// pass only the PDF and its file name on, not the backend's transport headers
	return new Response(response.body, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition':
				response.headers.get('Content-Disposition') ?? 'attachment; filename="Dokument.pdf"',
			'Cache-Control': 'no-store'
		}
	});
}
