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
		this.cardsOnTable = [];
		this.firstToPlay = this.turn;
	}

	turnAfterDealer() {
		this.turn = (Game.dealer + 1) % 4;
		return this.turn;
	}

	nextTurn() {
		this.turn = (this.turn + 1) % 4;
		return this.turn;
	}

	setTrump(trump: any) {
		this.trump = trump;
	}

	dealCards() {
		if (this.availableCards.length < 8) {
			console.log("Player count maxed");
			return null;
		}

		let hand = [];
		let deck = JSON.parse(JSON.stringify(DECK));

		while (hand.length < 8) {
			let random = Math.floor(Math.random() * this.availableCards.length);
			hand.push(deck[this.availableCards[random]]);
			this.availableCards.splice(random, 1);
		}

		const lastTwo = hand.splice(6,7);
		hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);
		
		return hand.concat(lastTwo);
	}

	setTrumpValues(users: Player[]) {
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
			user.hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);
		});
	}

	addScalePoints(team: Team) {
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

	getGamePoints() {
		return { A: this.pointsA, B: this.pointsB };
	}

	putCardOnTable(card: Card, player: Player) {
		// TODO RESTRICTIONS	
		const index = player.hand.indexOf(player.hand.find(x => x.sign === card.sign));
		player.hand.splice(index, 1);
		this.cardsOnTable.push({ card, username: player.username });
	}

	checkForFail() {
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