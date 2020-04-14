"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Team_1 = require("./Team");
const Game_1 = require("./Game");
class Match {
    constructor() {
        this.teamA = new Team_1.Team('A');
        this.teamB = new Team_1.Team('B');
        this.games = [];
    }
    startNewGame() {
        const g = new Game_1.Game();
        this.games.push(g);
        return g;
    }
    getMatchPoints() {
        const lastGame = this.games[this.games.length - 1];
        let totalA = lastGame.pointsA;
        let totalB = lastGame.pointsB;
        const games = [];
        games.push({ A: totalA, B: totalB });
        for (let i = 0; i < this.games.length - 1; i++) {
            totalA += this.games[i].pointsA;
            totalB += this.games[i].pointsB;
            games.push({ A: this.games[i].pointsA, B: this.games[i].pointsB });
        }
        return { games, total: { A: totalA, B: totalB } };
    }
    endMatch(totalPoints) {
        let winnerTeam = null;
        if (totalPoints.A >= 1001 && totalPoints.B >= 1001) {
            winnerTeam = (totalPoints.A > totalPoints.B) ? 'A' : 'B';
        }
        else if (totalPoints.A >= 1001) {
            winnerTeam = 'A';
        }
        else if (totalPoints.B >= 1001) {
            winnerTeam = 'B';
        }
        return winnerTeam;
    }
}
exports.Match = Match;
//# sourceMappingURL=Match.js.map