import { browser } from '$app/environment';

import { getDateAsUrlParam } from '$lib/TSHelpers/DateHelper';
import type { MealGroup, SubMeal, openmensaMeal } from '$lib/types';

/**
 * The Studentenwerk Leipzig site currently serves a stale (September) menu for every date, so
 * the Leipzig canteens are loaded from their OpenMensa counterpart (same data, kept up to date).
 * Studentenwerk canteen id -> OpenMensa canteen id
 */
const OPENMENSA_ID_FOR_STUWE_ID: Record<number, number> = {
	106: 63, // Mensa am Park
	111: 68, // Mensa Peterssteinweg
	115: 65, // Mensa am Elsterbecken
	118: 64, // Mensa Academica
	140: 69, // Mensa Schönauer Straße
	153: 70, // Cafeteria Dittrichring
	162: 67, // Mensa am Medizincampus
	170: 66 // Mensa An den Tierkliniken
};

export async function fetchMeals(date: Date, canteenId: number): Promise<MealGroup[] | undefined> {
	if (browser) {
		const openMensaId = OPENMENSA_ID_FOR_STUWE_ID[canteenId];
		if (openMensaId !== undefined) {
			try {
				return await fetchOpenMeals(date, openMensaId);
			} catch {
				// OpenMensa unreachable: fall back to the Studentenwerk data below
			}
		}

		const date_str = getDateAsUrlParam(date);
		const res = await fetch(`/api/mensa/canteens/${canteenId}/days/${date_str}`);

		if (!res.ok) {
			throw new Error(await res.text());
		} else {
			return res.json();
		}
	}
}

export async function fetchOpenMeals(
	date: Date,
	canteenId: number
): Promise<MealGroup[] | undefined> {
	if (browser) {
		const date_str = getDateAsUrlParam(date);
		const res = await fetch(
			`https://openmensa.org/api/v2/canteens/${canteenId}/days/${date_str}/meals`
		);

		if (!res.ok) {
			if (res.status === 404) {
				return [];
			} else {
				throw new Error(await res.text());
			}
		} else {
			const meals: openmensaMeal[] = await res.json();
			return openMensaMealsToMealGroups(meals);
		}
	}
}

function openMensaMealsToMealGroups(openMeals: openmensaMeal[]): MealGroup[] {
	const mealMap: Map<string, SubMeal[]> = new Map();

	for (const openMeal of openMeals) {
		const priceStr = openMealToPrice(openMeal.prices);
		if (mealMap.has(openMeal.category)) {
			mealMap.get(openMeal.category)!.push({
				name: openMeal.name,
				additional_ingredients: openMeal.notes,
				price: priceStr
			});
		} else {
			mealMap.set(openMeal.category, [
				{
					name: openMeal.name,
					additional_ingredients: openMeal.notes,
					price: priceStr
				}
			]);
		}
	}

	return Array.from(mealMap).map(([key, value]) => {
		return {
			meal_type: key,
			sub_meals: value
		};
	});
}

function openMealToPrice(prices: {
	students: number;
	employees: number;
	pupils: number;
	others: number;
}): string {
	let priceStr = '';
	for (const price of Object.entries(prices)) {
		if (price[1]) {
			priceStr += `${price[1].toFixed(2).replace('.', ',')} € / `;
		}
	}

	return priceStr.slice(0, -3);
}
