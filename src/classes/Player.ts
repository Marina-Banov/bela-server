import { Card } from './Card';

export class Player {
	id: string;
	username: string;
	hand: Card[];
	bela: boolean;

	constructor(id: string, username: string, hand: Card[]) {
		this.id = id;
		this.username = username;
		this.hand = hand;
		this.bela = false;
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

	checkBela(card: Card): boolean {
		if (this.bela && card.trump && (card.sign[1] === 'Q' || card.sign[1] === 'K')) {
			this.bela = false;
			return true;
		}
		return false;
	}

	sortHand(): void {
		this.hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);
	}
}
