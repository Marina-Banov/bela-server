"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Deck_1 = require("../constants/Deck");
class Game {
    constructor() {
        Game.dealer = (Game.dealer === undefined) ? 0 : (Game.dealer + 1) % 4;
        this.turnAfterDealer();
        this.availableCards = JSON.parse(JSON.stringify(Deck_1.DECK_SIGNS));
        this.trump = {
            sign: '',
            team: ''
        };
        this.curScalePriority = {
            team: '',
            value: 100000
        };
        this.pointsA = 0;
        this.pointsB = 0;
        this.tookCardsA = false;
        this.tookCardsB = false;
        this.cardsOnTable = [];
        this.firstToPlay = this.turn;
    }
    turnAfterDealer() {
        this.turn = (Game.dealer + 1) % 4;
        return this.turn;
    }
    nextTurn() {
        this.turn = (this.turn + 1) % 4;
        return this.turn;
    }
    setTrump(trump) {
        this.trump = trump;
    }
    dealCards() {
        if (this.availableCards.length < 8) {
            console.log("Player count maxed");
            return null;
        }
        const hand = [];
        const deck = JSON.parse(JSON.stringify(Deck_1.DECK));
        while (hand.length < 8) {
            const random = Math.floor(Math.random() * this.availableCards.length);
            hand.push(deck[this.availableCards[random]]);
            this.availableCards.splice(random, 1);
        }
        const lastTwo = hand.splice(6, 7);
        hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);
        return hand.concat(lastTwo);
    }
    setTrumpValues(users) {
        users.forEach(user => {
            user.hand.forEach(card => {
                if (card.sign[0] === this.trump.sign) {
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
    addScalePoints(team) {
        let p = 0;
        for (const s of team.scales) {
            p += s.points;
        }
        if (team.name === 'A') {
            this.pointsA += p;
        }
        else {
            this.pointsB += p;
        }
    }
    getGamePoints() {
        return { A: this.pointsA, B: this.pointsB };
    }
    isPlayValid(sign, player) {
        if (this.cardsOnTable.length === 0) {
            return true;
        }
        // if player is not first
        const cardsOnTable = this.cardsOnTable.map(x => x.card);
        const card = player.hand.find(x => x.sign === sign);
        const cutWithTrump = !!cardsOnTable.find(x => x.trump && x !== cardsOnTable[0]);
        const playColor = this.cardsOnTable[0].card.sign[0];
        const cardsOfSameColor = player.hand.filter(x => x.sign[0] === playColor);
        if (cardsOfSameColor.length > 0) {
            if (sign[0] !== playColor) {
                // the player must play the card of the same color as the first card
                return false;
            }
            else if (cutWithTrump) {
                return true;
            }
            const highest = Math.max.apply(Math, cardsOfSameColor.map(x => x.points));
            return this.compareWithRelevantArray(card, cardsOnTable.filter(x => x.sign[0] === playColor), highest);
        }
        const trumpCards = player.hand.filter(x => x.trump);
        if (trumpCards.length > 0) {
            if (!card.trump) {
                // player must play trump
                return false;
            }
            else if (!cutWithTrump) {
                // allow any trump to be played if there is no other trump already played
                return true;
            }
            const highest = Math.max.apply(Math, trumpCards.map(x => x.points));
            return this.compareWithRelevantArray(card, cardsOnTable.filter(x => x.trump), highest);
        }
        return true;
    }
    compareWithRelevantArray(card, array, highest) {
        let maxPoints = array[0].points;
        let maxScalePrio = array[0].scalePriority;
        for (let i = 1; i < array.length; i++) {
            if (array[i].points > maxPoints) {
                maxPoints = array[i].points;
                maxScalePrio = array[i].scalePriority;
            }
        }
        // play is valid if it's more valuable than most valuable card or if the player doesn't have a more valuable card
        return ((card.points > maxPoints || card.points === maxPoints && card.scalePriority > maxScalePrio)
            || card.points <= maxPoints && highest <= maxPoints);
    }
    putCardOnTable(sign, player) {
        const index = player.hand.indexOf(player.hand.find(x => x.sign === sign));
        const card = player.hand.splice(index, 1)[0];
        this.cardsOnTable.push({ card, username: player.username });
    }
    checkForFail() {
        const goal = (this.pointsA + this.pointsB) / 2 + 1;
        if (this.trump.team === 'A' && this.pointsA < goal) {
            this.pointsB += this.pointsA;
            this.pointsA = 0;
            return true;
        }
        else if (this.trump.team === 'B' && this.pointsB < goal) {
            this.pointsA += this.pointsB;
            this.pointsB = 0;
            return true;
        }
        return false;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map