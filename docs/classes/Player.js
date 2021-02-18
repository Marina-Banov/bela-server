"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(id, username, hand) {
        this.id = id;
        this.username = username;
        this.hand = hand;
        this.bela = false;
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
    checkBela(card) {
        if (this.bela && card.trump && (card.sign[1] === 'Q' || card.sign[1] === 'K')) {
            this.bela = false;
            return true;
        }
        return false;
    }
    sortHand() {
        this.hand.sort((a, b) => (a.scalePriority > b.scalePriority) ? 1 : -1);
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map