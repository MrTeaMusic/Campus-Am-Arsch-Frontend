import { handleApiRequest } from '$lib/server/handleCdApiRequest';

export async function GET({ cookies }) {
	return handleApiRequest(cookies, 'get_examreg_status', 'Fehler bei der Anmeldestatus-Anfrage');
}
