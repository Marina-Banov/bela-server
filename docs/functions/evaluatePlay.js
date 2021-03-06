"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function evaluatePlay(cardsOnTable) {
    let value = 0;
    cardsOnTable.forEach(x => value += x.card.points);
    let strongest = cardsOnTable[0];
    const playColor = strongest.card.sign[0];
    for (let i = 1; i < 4; i++) {
        if (strongest.card.trump && !cardsOnTable[i].card.trump) {
            continue;
        }
        if (!strongest.card.trump && cardsOnTable[i].card.trump) {
            strongest = cardsOnTable[i];
        }
        if (strongest.card.trump && cardsOnTable[i].card.trump) {
            strongest = pickStronger(strongest, cardsOnTable[i]);
        }
        if (!strongest.card.trump && !cardsOnTable[i].card.trump) {
            if (cardsOnTable[i].card.sign[0] !== playColor) {
                continue;
            }
            strongest = pickStronger(strongest, cardsOnTable[i]);
        }
    }
    return { value, username: strongest.username };
}
exports.evaluatePlay = evaluatePlay;
function pickStronger(a, b) {
    if (a.card.points > b.card.points) {
        return a;
    }
    if (a.card.points < b.card.points) {
        return b;
    }
    else {
        return (a.card.sign[1] > b.card.sign[1]) ? a : b;
    }
}
//# sourceMappingURL=evaluatePlay.js.map