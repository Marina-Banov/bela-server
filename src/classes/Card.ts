export class Card {
	sign: string;
	points: number;
	scalePriority: number;
	trump: boolean;

	constructor(symbol: string, points: number, priority: number) {
		this.sign = symbol;
		this.points = points;
		this.scalePriority = priority;
		this.trump = false;
	}
}