import { Team } from './Team';
import { Game4 } from './Game4';

export class Match4 {
	teamA: Team;
	teamB: Team;
	games: Game4[];
	points: number[][];
	total: number[];

	constructor() {
		this.teamA = new Team('A');
		this.teamB = new Team('B');
		this.games = [];
		this.points = [];
		this.total = [0, 0];
	}

	startNewGame(dealer): Game4 {
		const g = new Game4(dealer);
		this.games.push(g);
		this.teamA.scales.splice(0, this.teamA.scales.length);
		this.teamB.scales.splice(0, this.teamB.scales.length);
		return g;
	}

	updateMatchPoints(): void {
		const last = this.games[this.games.length - 1].points;
		this.points.push(last);
		this.total[0] += last[0];
		this.total[1] += last[1];
	}

	endMatch(users: string[]): string {
		const total = this.points.slice(-1)[0];
		let maxPoints = total[0];
		let maxTeam = 'A';
		if (total[1] > maxPoints) {
			maxPoints = total[1];
			maxTeam = 'B';
		}
		if (maxPoints >= 1001) {
			return (total[1] === maxPoints) ? 'Nerješeno!' : 'Tim ' + maxTeam + ' je pobijedio!';
		}
		return null;
	}
}
