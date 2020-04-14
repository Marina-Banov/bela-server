export class Scale {
	sign: string;
	points: number;
	priority: number;

	constructor(sign: string, points: number, priority: number) {
		this.sign = sign;
		this.points = points;
		this.priority = priority;
	}
}
