import { Card } from './Card';

export class Player {
	username: string;
	hand: Card[];
	team: string;
	bela: boolean;
	static count: number = 0;

	constructor(username: string, hand: Card[]) {
		this.username = username;
		this.hand = hand;
		this.team = (Player.count % 2) ? 'B' : 'A';
		this.bela = false;
		Player.count++;
	}

	getOnlyCardSigns(): string[] {
		if (this.hand === null) {
			return null;
		}
		const cards = [];
		this.hand.forEach(card => {
			cards.push(card.sign);
		});
		return cards;
	}

	checkBela(sign: string): boolean {
		if (this.bela) {
			const trump = this.hand.find(x => x.sign === sign).trump;
			if (trump && (sign[1] === 'Q' || sign[1] === 'K')) {
				this.bela = false;
				return true;
			}
		}
		return false;
	}

	sortHand() {
		this.hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);
	}
}
