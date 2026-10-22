export const components: string[] = [
	'BasicInfoTile',
	'GradesTile',
	'CalendarTile',
	'MensaTile',
	'ExamStatusTile'
];

export const tileNames: Map<string, string> = new Map([
	['BasicInfoTile', 'Deine Infos'],
	['GradesTile', 'Noten'],
	['CalendarTile', 'Kalender'],
	['MensaTile', 'Mensa'],
	['ExamStatusTile', 'Prüfungen']
]);

export function validateComponentOrder(order: string[]): boolean {
	if (
		order.length == components.length &&
		components.every((e) => {
			return order.includes(e);
		})
	) {
		return true;
	} else {
		return false;
	}
}
