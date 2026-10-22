export const components: string[] = [
	'BasicInfoTile',
	'GradesTile',
	'CalendarTile',
	'SharedCalendarTile',
	'MensaTile',
	'ExamStatusTile',
	'BoardTile',
	'SlotMachineTile'
];

export const tileNames: Map<string, string> = new Map([
	['BasicInfoTile', 'Deine Infos'],
	['GradesTile', 'Noten'],
	['CalendarTile', 'Kalender'],
	['SharedCalendarTile', 'Gemeinsamer Kalender'],
	['MensaTile', 'Mensa'],
	['ExamStatusTile', 'Prüfungen'],
	['BoardTile', 'Schwarzes Brett'],
	['SlotMachineTile', 'Uni oder nicht?']
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
