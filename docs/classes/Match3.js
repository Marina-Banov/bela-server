"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match3 = void 0;
const Team_1 = require("./Team");
const Game3_1 = require("./Game3");
class Match3 {
    constructor() {
        this.team0 = new Team_1.Team('0');
        this.team1 = new Team_1.Team('1');
        this.games = [];
        this.points = [];
        this.total = [0, 0, 0];
    }
    startNewGame(dealer) {
        const g = new Game3_1.Game3(dealer);
        this.games.push(g);
        this.team0.scales.splice(0, this.team0.scales.length);
        this.team1.scales.splice(0, this.team1.scales.length);
        return g;
    }
    updateMatchPoints() {
        const last = this.games[this.games.length - 1].points;
        this.points.push(last);
        this.total[0] += last[0];
        this.total[1] += last[1];
        this.total[2] += last[2];
    }
    endMatch(users) {
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
exports.Match3 = Match3;
//# sourceMappingURL=Match3.js.map