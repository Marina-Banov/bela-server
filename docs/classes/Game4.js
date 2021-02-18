"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game4 = void 0;
const Game_1 = require("./Game");
class Game4 extends Game_1.Game {
    constructor(dealer) {
        super(dealer);
        this.points = [0, 0];
        this.tookCards = [false, false];
    }
    turnAfterDealer() {
        return super.turnAfterDealer(4);
    }
    nextTurn() {
        return super.nextTurn(4);
    }
    dealCards() {
        return super.dealCards(8, 2);
    }
    setTrump(trumpSign, trumpUser, users) {
        const user = users.find(u => u.username === trumpUser);
        trumpUser = (users.indexOf(user) % 2) ? 'B' : 'A';
        super.setTrump(trumpSign, trumpUser, users);
    }
    trackScales(scales, username, index, match) {
        if (index % 2) {
            return match.teamB.addScale(scales, this.curScalePriority, username);
        }
        else {
            return match.teamA.addScale(scales, this.curScalePriority, username);
        }
    }
    addScalePoints(match, users) {
        const team = (this.curScalePriority.team === 'A') ? match.teamA : match.teamB;
        let p = 0;
        for (const s of team.scales) {
            p += s.points;
        }
        if (team.name === 'A') {
            this.points[0] += p;
        }
        else {
            this.points[1] += p;
        }
        return team.getScales();
    }
    addBelaPoints(index) {
        super.addBelaPoints(index % 2);
    }
    addCardPoints(points, lastMove, playerIndex) {
        const winTeam = playerIndex % 2;
        const loseTeam = (playerIndex + 1) % 2;
        if (lastMove) {
            points += 10;
            if (!this.tookCards[loseTeam]) {
                points += 90;
                this.points[winTeam] += this.points[loseTeam];
                this.points[loseTeam] = 0;
            }
        }
        this.points[winTeam] += points;
        this.tookCards[winTeam] = true;
    }
    endGame(users) {
        const trumpTeam = (this.trumpUser === 'A') ? 0 : 1;
        const lose = (trumpTeam + 1) % 2;
        const goal = (this.points[0] + this.points[1]) / 2 + 1;
        if (this.points[trumpTeam] < goal) {
            this.points[lose] += this.points[trumpTeam];
            this.points[trumpTeam] = 0;
            return 'Tim ' + this.trumpUser + ' je pao!';
        }
        return null;
    }
}
exports.Game4 = Game4;
//# sourceMappingURL=Game4.js.map