import { Card } from './Card';

export class Player {
	username: string;
	hand: Card[];
	team: string;
	static count: number = 0;

	constructor(username: string, hand: Card[]) {
		this.username = username;
		this.hand = hand;
		this.team = (Player.count % 2) ? 'B' : 'A';
		Player.count++;
	}
}