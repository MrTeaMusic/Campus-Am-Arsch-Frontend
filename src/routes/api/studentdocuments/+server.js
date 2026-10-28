import { handleApiRequest } from '$lib/server/handleCdApiRequest';

export async function GET({ cookies }) {
	return handleApiRequest(
		cookies,
		'get_student_documents',
		'Fehler beim Laden der Studentendokumente'
	);
}
