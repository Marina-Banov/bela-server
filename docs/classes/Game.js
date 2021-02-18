"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Deck_1 = require("../constants/Deck");
class Game {
    constructor(dealer) {
        this.dealer = dealer;
        this.availableCards = [...Array(32).keys()];
        this.trumpSign = '';
        this.trumpUser = '';
        this.curScalePriority = {
            team: '',
            value: 100000
        };
        this.cardsOnTable = [];
    }
    turnAfterDealer(capacity) {
        this.turn = (this.dealer + 1) % capacity;
        return this.turn;
    }
    nextTurn(capacity) {
        this.turn = (this.turn + 1) % capacity;
        return this.turn;
    }
    setTrump(trumpSign, trumpUser, users) {
        this.trumpSign = trumpSign;
        this.trumpUser = trumpUser;
        users.forEach(user => {
            user.hand.forEach(card => {
                if (card.sign[0] === this.trumpSign) {
                    card.trump = true;
                    if (card.sign[1] === 'J') {
                        card.points = 20;
                    }
                    else if (card.sign[1] === '9') {
                        card.points = 14;
                    }
                }
            });
            user.bela = (user.hand.filter(x => x.trump && (x.sign[1] === 'Q' || x.sign[1] === 'K')).length === 2);
            user.sortHand();
        });
    }
    dealCards(totalCards, hiddenCards) {
        const hand = [];
        const deck = JSON.parse(JSON.stringify(Deck_1.DECK));
        while (hand.length < totalCards) {
            const random = Math.floor(Math.random() * this.availableCards.length);
            hand.push(deck[this.availableCards[random]]);
            this.availableCards.splice(random, 1);
        }
        const last = hand.splice(totalCards - hiddenCards, hiddenCards);
        hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);
        return hand.concat(last);
    }
    putCardOnTable(card, player) {
        const index = player.hand.indexOf(card);
        player.hand.splice(index, 1);
        this.cardsOnTable.push({ card, username: player.username });
    }
    addBelaPoints(index) {
        this.points[index] += 20;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map