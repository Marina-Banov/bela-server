import { Scale } from '../classes/Scale';

export const SAMESIES: Scale[] = [
	new Scale('J', 200,  1),
	new Scale('9', 150,  2),
	new Scale('A', 100, 50),
	new Scale('K', 100, 51),
	new Scale('Q', 100, 52),
	new Scale('X', 100, 53)
];

export const IN_A_ROW: Scale[] = [
	new Scale('count-8', 1001,   0),
	new Scale('count-7',  100,  10),
	new Scale('count-6',  100,  20),
	new Scale('count-5',  100, 100),
	new Scale('count-4',   50, 200),
	new Scale('count-3',   20, 500)
];

export const COUNT_IN_A_ROW_LARGEST: any = {
	'-upto-7': { value: false, priority: 5 },
	'-upto-8': { value: false, priority: 5 },
	'-upto-9': { value: false, priority: 5 },
	'-upto-X': { value: false, priority: 4 },
	'-upto-J': { value: false, priority: 3 },
	'-upto-Q': { value: false, priority: 2 },
	'-upto-K': { value: false, priority: 1 },
	'-upto-A': { value: false, priority: 0 }
};
