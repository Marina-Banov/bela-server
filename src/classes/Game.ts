import { DECK } from '../constants/Deck';
import { Player } from './Player';
import { Team } from './Team';
import { Card } from './Card';

export class Game {
	static dealer: number;
	turn: number;
	availableCards: number[];
	trump: any;
	curScalePriority: any;
	pointsA: number;
	pointsB: number;
	tookCardsA: boolean;
	tookCardsB: boolean;
	cardsOnTable: any[];
	firstToPlay: number;

	constructor() {
		Game.dealer = (Game.dealer === undefined) ? 0 : (Game.dealer + 1) % 4;
		this.turnAfterDealer();
		this.availableCards = [];
		for (let i = 0; i < 32; i++) {
			this.availableCards.push(i);
		}
		this.trump = {
			sign: '',
			team: ''
		};
		this.curScalePriority = {
			team: '',
			usernames: [],
			value: 100000
		};
		this.pointsA = 0;
		this.pointsB = 0;
		this.tookCardsA = false;
		this.tookCardsB = false;
		this.cardsOnTable = [];
		this.firstToPlay = this.turn;
	}

	turnAfterDealer(): number {
		this.turn = (Game.dealer + 1) % 4;
		return this.turn;
	}

	nextTurn(): number {
		this.turn = (this.turn + 1) % 4;
		return this.turn;
	}

	setTrump(trump: any): void {
		this.trump = trump;
	}

	dealCards(): Card[] {
		if (this.availableCards.length < 8) {
			console.log("Player count maxed");
			return null;
		}

		const hand = [];
		const deck = JSON.parse(JSON.stringify(DECK));

		while (hand.length < 8) {
			const random = Math.floor(Math.random() * this.availableCards.length);
			hand.push(deck[this.availableCards[random]]);
			this.availableCards.splice(random, 1);
		}

		const lastTwo = hand.splice(6,7);
		hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);

		return hand.concat(lastTwo);
	}

	setTrumpValues(users: Player[]): void {
		users.forEach(user => {
			user.hand.forEach(card => {
				if (card.sign[0] === this.trump.sign) {
					card.trump = true;
					if (card.sign[1] === 'J') {
						card.points = 20;
					} else if (card.sign[1] === '9') {
						card.points = 14;
					}
				}
			});
			user.bela = (user.hand.filter(x => x.trump && (x.sign[1] === 'Q' || x.sign[1] === 'K')).length === 2);
			user.sortHand();
		});
	}

	addScalePoints(team: Team): void {
		let p = 0;
		for (const s of team.scales) {
			p += s.points;
		}
		if (team.name === 'A') {
			this.pointsA += p;
		} else {
			this.pointsB += p;
		}
	}

	getGamePoints(): any {
		return { A: this.pointsA, B: this.pointsB };
	}

	putCardOnTable(sign: string, player: Player): void {
		// TODO RESTRICTIONS
		const index = player.hand.indexOf(player.hand.find(x => x.sign === sign));
		const card = player.hand.splice(index, 1)[0];
		this.cardsOnTable.push({ card, username: player.username });
	}

	checkForFail(): boolean {
		const goal = (this.pointsA + this.pointsB) / 2 + 1;
		if (this.trump.team === 'A' && this.pointsA < goal) {
			this.pointsB += this.pointsA;
			this.pointsA = 0;
			return true;
		} else if (this.trump.team === 'B' && this.pointsB < goal) {
			this.pointsA += this.pointsB;
			this.pointsB = 0;
			return true;
		}
		return false;
	}
}
