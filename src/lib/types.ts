import type { SvelteDate } from 'svelte/reactivity';

export type ToastPayload = {
	text: string;
	class: ToastPayloadClass;
};
export enum ToastPayloadClass {
	success,
	warn,
	error
}

export type MensaSelectorEvent = {
	date: SvelteDate;
	canteenId: number;
};

// export function getToastSettings(payload: ToastPayload): ToastSettings {
// 	let bg: string;
// 	switch (payload.class) {
// 		case ToastPayloadClass.success:
// 			bg = 'variant-filled-success';
// 			break;
// 		case ToastPayloadClass.warn:
// 			bg = 'variant-filled-warning';
// 			break;
// 		case ToastPayloadClass.error:
// 			bg = 'variant-filled-error';
// 			break;
// 	}
// 	if (payload.class == ToastPayloadClass.error) {
// 		const t: ToastSettings = {
// 			message: payload.text,
// 			background: bg,
// 			autohide: false
// 		};

// 		return t;
// 	} else {
// 		const t: ToastSettings = {
// 			message: payload.text,
// 			background: bg,
// 			timeout: 10000
// 		};

// 		return t;
// 	}
// }

export interface EventUnix {
	start: number;
	end: number;
	title: string;
	room: string;
	sroom: string;
	instructor: string;
	textColor: string;
	description: string;
	remarks: string;
	color: string;
}

export interface Event {
	start: Date;
	end: Date;
	title: string;
	textColor: string;
	room: string;
	instructor: string;
	remarks: string;
	color: string;
	extendedProps: {
		room: string;
		sroom: string;
		instructor: string;
		description: string;
		remarks: string;
	};
}

//////// API response types
export type BasicUserData = {
	first_name: string;
	last_name: string;
	seminar_group: string;
	seminar_name: string;
	user: string;
};

export type ExamStats = {
	total: number;
	successful: number;
	unsuccessful: number;
	unassessed: number;
	booked: number;
	finished: number;
	ronmodus: number;
};

export type Canteen = {
	id: number;
	name: string;
};

export type MealGroup = {
	meal_type: string;
	sub_meals: SubMeal[];
};

export type SubMeal = {
	name: string;
	additional_ingredients: string[];
	price: string;
	allergens?: string;
	variations?: MealVariations[];
};

type MealVariations = {
	name: string;
	allergens_and_add: string;
};

export type openmensaMeal = {
	id: number;
	name: string;
	category: string;
	prices: openPrices;
	notes: string[];
};

type openPrices = {
	students: number;
	employees: number;
	pupils: number;
	others: number;
};

export type CampusDualGrade = {
	name: string;
	grade: string;
	total_passed?: boolean;
	credit_points: number;
	akad_period: string;
	subgrades: CampusDualSubGrade[];
};

export type CampusDualSubGrade = {
	name: string;
	grade: string;
	passed?: boolean;
	beurteilung: string;
	bekanntgabe: string;
	wiederholung?: string;
	akad_period: string;
};

/** Ob die Prüfungsanmeldung gerade möglich ist (Campus-API: /get_examreg_status) */
export type ExamRegStatus = {
	open: boolean;
	periods: {
		peryr: string;
		perid: string;
		current: boolean;
		offers: number;
		booked: number;
	}[];
};

/** Eintrag im gemeinsamen Kalender (Campus-API: /get_shared_events), Zeiten als `YYYY-MM-DDTHH:MM` */
export type SharedEvent = {
	id: number;
	title: string;
	description: string;
	start: string;
	end: string;
	author: string;
	mine: boolean;
};
