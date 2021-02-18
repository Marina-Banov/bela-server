"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game3 = void 0;
const Game_1 = require("./Game");
const Deck_1 = require("../constants/Deck");
class Game3 extends Game_1.Game {
    constructor(dealer) {
        super(dealer);
        this.points = [0, 0, 0];
        this.tookCards = [false, false, false];
        this.hiddenPoints = 0;
    }
    turnAfterDealer() {
        return super.turnAfterDealer(3);
    }
    nextTurn() {
        return super.nextTurn(3);
    }
    dealCards() {
        return super.dealCards(10, 4);
    }
    addTwoCards(player) {
        const deck = JSON.parse(JSON.stringify(Deck_1.DECK));
        player.hand.push(deck[this.availableCards[0]]);
        player.hand.push(deck[this.availableCards[1]]);
        this.availableCards.splice(0, 2);
    }
    discardTwoCards(player, cards) {
        for (let i = 0; i < 2; i++) {
            const alterHand = player.hand.map(c => c.sign);
            const c1 = alterHand.indexOf(cards[i]);
            this.hiddenPoints += player.hand.splice(c1, 1)[0].points;
        }
    }
    setTrump(trumpSign, trumpUser, users) {
        const user = users.find(u => u.username === trumpUser);
        this.addTwoCards(user);
        trumpUser = users.indexOf(user).toString(10);
        super.setTrump(trumpSign, trumpUser, users);
    }
    trackScales(scales, username, index, match) {
        if (index.toString(10) === this.trumpUser) {
            return match.team0.addScale(scales, this.curScalePriority, username);
        }
        else {
            return match.team1.addScale(scales, this.curScalePriority, username);
        }
    }
    addScalePoints(match, users) {
        const team = (this.curScalePriority.team === '0') ? match.team0 : match.team1;
        team.scales.forEach(s => {
            const user = users.find(u => u.username === s.username);
            this.points[users.indexOf(user)] += s.points;
        });
        return team.getScales();
    }
    addCardPoints(points, lastMove, playerIndex) {
        const lose1 = (playerIndex + 1) % 3;
        const lose2 = (playerIndex + 2) % 3;
        if (lastMove) {
            points += 10;
            if (this.tookCards.filter(x => false).length === 2) {
                points += 90;
                this.points[playerIndex] += this.points[lose1] + this.points[lose2];
                this.points[lose1] = 0;
                this.points[lose2] = 0;
            }
        }
        this.points[playerIndex] += points;
        this.tookCards[playerIndex] = true;
    }
    endGame(users) {
        const trumpIndex = parseInt(this.trumpUser, 10);
        const lose1 = (trumpIndex + 1) % 3;
        const lose2 = (trumpIndex + 2) % 3;
        this.points[trumpIndex] += this.hiddenPoints;
        const goal = (this.points[0] + this.points[1] + this.points[2]) / 2 + 1;
        if (this.points[trumpIndex] < goal) {
            const max = (this.points[lose1] > this.points[lose2]) ? lose1 : lose2;
            this.points[max] += this.points[trumpIndex];
            this.points[trumpIndex] = 0;
            return 'Igrač ' + users[trumpIndex] + ' je pao!';
        }
        return null;
    }
}
exports.Game3 = Game3;
//# sourceMappingURL=Game3.js.map