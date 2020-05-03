import { Player } from './Player';
import { Scale } from './Scale';

export class Team {
	name: string;
	users: Player[];
	scales: any[];

	constructor(name: string) {
		this.name = name;
		this.users = [];
		this.scales = [];
	}

	/*addScale(scale: any, priority: number, curPriority: any): boolean {
		if (this.scales.find(x => x.sign === scale.sign)) {
			return false;
		}
		if (priority < curPriority.value) {
			curPriority.team = this.name;
			curPriority.value = priority;
		}

		this.scales.push(scale);
		if (priority < this.priority) {
			// DODATI NAPOMENU NA FRONTENDU DA SE PRVO ZOVE NAJVEĆE ZVANJE
			// PAMETNI LJUDI BI FIXALI TAJ BUG ALI JA CU GA IMPLEMENTIRATI
			this.priority = priority;
			return true;
		}
		if (!curPriority.usernames.find(x => x === scale.username)) {
			curPriority.usernames.push(scale.username);
			return true;
		}
		return false;
	}*/

	addScale2(scales: Scale[], curPriority: any, username: string) {
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
