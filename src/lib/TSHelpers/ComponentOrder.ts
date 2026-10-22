export const components: string[] = [
	'BasicInfoTile',
	'GradesTile',
	'CalendarTile',
	'MensaTile',
	'ExamStatusTile',
	'SlotMachineTile'
];

export const tileNames: Map<string, string> = new Map([
	['BasicInfoTile', 'Deine Infos'],
	['GradesTile', 'Noten'],
	['CalendarTile', 'Kalender'],
	['MensaTile', 'Mensa'],
	['ExamStatusTile', 'Prüfungen'],
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
