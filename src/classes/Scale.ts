export class Scale {
	sign: string;
	points: number;
	priority: number;
	cardSymbols: string[];

	constructor(sign: string, points: number, priority: number) {
		this.sign = sign;
		this.points = points;
		this.priority = priority;
	}

	defineCards(cardSymbols: string[]) {
		this.cardSymbols = cardSymbols;
	}
}
