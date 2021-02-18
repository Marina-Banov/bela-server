import { Scale } from './Scale';

export class Team {
	name: string;
	scales: any[];

	constructor(name: string) {
		this.name = name;
		this.scales = [];
	}

	addScale(scales: Scale[], curPriority: any, username: string): number {
		const minPriority = Math.min.apply(Math, scales.map(x => x.priority));
		if (minPriority < curPriority.value) {
			curPriority.team = this.name;
			curPriority.value = minPriority;
		}
		scales.forEach(s => this.scales.push({ sign: s.sign, points: s.points, hand: s.cardSymbols, username }));
		return Math.max.apply(Math, scales.map(x => x.points));
	}

	getScales(): any[] {
		const hands = [];
		for (const s of this.scales) {
			hands.push({ hand: s.hand, username: s.username });
		}
		return hands;
	}
}
