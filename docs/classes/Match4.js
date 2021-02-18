"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match4 = void 0;
const Team_1 = require("./Team");
const Game4_1 = require("./Game4");
class Match4 {
    constructor() {
        this.teamA = new Team_1.Team('A');
        this.teamB = new Team_1.Team('B');
        this.games = [];
        this.points = [];
        this.total = [0, 0];
    }
    startNewGame(dealer) {
        const g = new Game4_1.Game4(dealer);
        this.games.push(g);
        this.teamA.scales.splice(0, this.teamA.scales.length);
        this.teamB.scales.splice(0, this.teamB.scales.length);
        return g;
    }
    updateMatchPoints() {
        const last = this.games[this.games.length - 1].points;
        this.points.push(last);
        this.total[0] += last[0];
        this.total[1] += last[1];
    }
    endMatch(users) {
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
exports.Match4 = Match4;
//# sourceMappingURL=Match4.js.map