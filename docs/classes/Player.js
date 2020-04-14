"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(username, hand) {
        this.username = username;
        this.hand = hand;
        this.team = (Player.count % 2) ? 'B' : 'A';
        this.bela = false;
        Player.count++;
    }
    getOnlyCardSigns() {
        if (this.hand === null) {
            return null;
        }
        const cards = [];
        this.hand.forEach(card => {
            cards.push(card.sign);
        });
        return cards;
    }
    checkBela(sign) {
        if (this.bela) {
            const trump = this.hand.find(x => x.sign === sign).trump;
            if (trump && (sign[1] === 'Q' || sign[1] === 'K')) {
                this.bela = false;
                return true;
            }
        }
        return false;
    }
    sortHand() {
        this.hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);
    }
}
exports.Player = Player;
Player.count = 0;
//# sourceMappingURL=Player.js.map