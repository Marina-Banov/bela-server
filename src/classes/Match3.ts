import { Team } from './Team';
import { Game3 } from './Game3';

export class Match3 {
    team0: Team;
    team1: Team;
    games: Game3[];
    points: number[][];
    total: number[];

    constructor() {
        this.team0 = new Team('0');
        this.team1 = new Team('1');
        this.games = [];
        this.points = [];
        this.total = [0, 0, 0];
    }

    startNewGame(dealer): Game3 {
        const g = new Game3(dealer);
        this.games.push(g);
        this.team0.scales.splice(0, this.team0.scales.length);
        this.team1.scales.splice(0, this.team1.scales.length);
        return g;
    }

    updateMatchPoints(): void {
        const last = this.games[this.games.length - 1].points;
        this.points.push(last);
        this.total[0] += last[0];
        this.total[1] += last[1];
        this.total[2] += last[2];
    }

    endMatch(users: string[]): string {
        const total = this.points.slice(-1)[0];
        const max = { points: total[0], username: users[0] };
        if (total[1] >= max.points) {
            max.points = total[1];
            max.username = users[1];
        }
        if (total[2] >= max.points) {
            max.points = total[2];
            max.username = users[2];
        }
        if (max.points >= 701) {
            return 'Igrač ' + max.username + ' je pobijedio!';
        }
        return null;
    }
}
