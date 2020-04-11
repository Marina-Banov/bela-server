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
        let lastGame = this.games[this.games.length - 1];
        let totalA = lastGame.pointsA;
        let totalB = lastGame.pointsB;
        let games = [];
        games.push({ A: totalA, B: totalB });
        for (let i = 0; i < this.games.length - 1; i++) {
            totalA += this.games[i].pointsA;
            totalB += this.games[i].pointsB;
            games.push({ A: this.games[i].pointsA, B: this.games[i].pointsB });
        }
        return { games, total: { A: totalA, B: totalB } };
    }
}
exports.Match = Match;
//# sourceMappingURL=Match.js.map