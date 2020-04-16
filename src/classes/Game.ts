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
		//if player is not first
		if (this.cardsOnTable.length > 0)
		{
			const firstCard = this.cardsOnTable[0];
			const cardIdx = player.hand.indexOf(player.hand.find(x => x.sign === sign));
			var cutWithTrump = false;

			//establish if there was a cut with a trump
			for (let i = 1; !firstCard.trump && i < this.cardsOnTable.length; i++)
				if (this.cardsOnTable[i])
				{
					cutWithTrump = true;
					break;				
				}
			
			const cardsOfSameColor = player.hand.find(x => x.sign[0] === firstCard.sign[0]);
			const card = player.hand[cardIdx];
			//if player has card(s) of same color
			if (cardsOfSameColor.length > 0)
			{
				//the player must play the card of the same color as the first card
				if (card.sign[0] !== firstCard.sign[0])
					return false;

				if (!cutWithTrump)
				{
					//put the highest value card first
					cardsOfSameColor.sort((l, r) => (l.points > r.points) ? 1 : (l.points == r.points && l.scalePriority > r.scalePriority) ? 1 : -1);

					let maxPoints = this.cardsOnTable[0].points;
					let maxScalePrio = this.cardsOnTable[0].scalePriority;
					//find the card with the highest value
					for (let i = 1; i < this.cardsOnTable.length; i++)
					{
						if (this.cardsOnTable[i].points > maxPoints)
						{
							maxPoints = this.cardsOnTable[i].points;
							maxScalePrio = this.cardsOnTable[i].scalePriority;
						}
					}

					//allow playing of card only if its more valuable than most valuable card of if the player doesnt have a more valuable card
					if ((card.points > maxPoints || card.points == maxPoints && card.scalePriority > maxScalePrio)
						|| card.points < maxPoints && cardsOfSameColor[0].points <= maxPoints)
						goto playAllowed;
					return false;
				}

				//if there was a cut allow any card to be played
				goto playAllowed;
			}
			else
			{
				const trumpCards = player.hand.find(x => x.trump);
				//if player has trump card(s)
				if (trumpCards.length > 0)
				{
					//player must play trump
					if (!card.trump)
						return false;

					if (cutWithTrump)
					{
						trumpCards.sort((l, r) => (l.points > r.points) ? 1 : (l.points == r.points && l.scalePriority > r.scalePriority) ? 1 : -1);
						
						const trumpsOnTable = this.cardsOnTable.find(x => x.trump);
						trumpsOnTable.sort((l, r) => (l.points > r.points) ? 1 : (l.points == r.points && l.scalePriority > r.scalePriority) ? 1 : -1);
						const biggestTrump = trumpsOnTable[0];

						//allow playing of card only if its more valuable than most valuable trump of if the player doesnt have a more valuable trump
						if ((card.points > biggestTrump.points || card.points == biggestTrump.points && card.scalePriority > biggestTrump.scalePriority)
							|| card.points < biggestTrump.points && trumpCards[0].points <= biggestTrump.points)
							goto playAllowed;
						return false:
					}

					//allow any trump to be played if there is no other trump already played
					goto playAllowed;
				}
				
				//allow any card to play if player doesnt have a matching color nor a trump
				goto playAllowed;
			}
			
		}

	playAllowed:
		//allow any card to be played if player is playing first
		this.cardsOnTable.push({ card, username: player.username });
		const card = player.hand.splice(cardIdx, 1)[0];
		return true;
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
