"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scale_1 = require("../classes/Scale");
const Scales_1 = require("../constants/Scales");
const Deck_1 = require("../constants/Deck");
function evaluateScale(cards) {
    // working with scalePriority (numbers ranging from 0 to 31) is easier than working with strings
    const cardsIndices = [];
    cards.forEach(x => cardsIndices.push(Deck_1.DECK.find(y => y.sign === x).scalePriority));
    const scalesInternal = [];
    const inARow = Array(4).fill(0);
    for (let t = 0; t < 8; t++) {
        let curTypeColors = 0;
        for (let c = 0; c < 4; c++) {
            if (cardsIndices.find(x => x === c * 8 + t)) {
                inARow[c]++;
                curTypeColors++;
                if (t === 7 && inARow[c] >= 3) {
                    scalesInternal.push({ count: inARow[c], top: t, color: c });
                }
            }
            else {
                if (inARow[c] >= 3) {
                    scalesInternal.push({ count: inARow[c], top: t - 1, color: c });
                }
                inARow[c] = 0;
            }
        }
        if (curTypeColors === 4) {
            scalesInternal.push({ count: null, top: t, color: null });
        }
    }
    // raise warning for scales 4*7 and 4*8
    if (scalesInternal.find(x => x.color === null && x.top <= 1)) {
        return null;
    }
    // defining if the user called a card that isn't a part of any of the scales - should raise a warning
    for (const i of cardsIndices) {
        let cardInRange = false;
        const cardColor = Math.floor(i / 8);
        const cardType = i % 8;
        for (const s of scalesInternal) {
            if (s.color === null) {
                if (cardType === s.top) {
                    cardInRange = true;
                    break;
                }
            }
            else {
                const firstCard = s.top - s.count + 1;
                if (cardColor === s.color && cardType >= firstCard && cardType <= s.top) {
                    cardInRange = true;
                    break;
                }
            }
        }
        if (!cardInRange) {
            return null;
        }
    }
    const scales = [];
    const IN_A_ROW_LARGEST = JSON.parse(JSON.stringify(Scales_1.COUNT_IN_A_ROW_LARGEST));
    const DECK_SIGNS = Deck_1.DECK.map(x => x.sign);
    for (const s of scalesInternal) {
        if (s.color === null) {
            const c = JSON.parse(JSON.stringify(Scales_1.SAMESIES.find(x => x.sign === DECK_SIGNS[s.top][1])));
            const curScale = new Scale_1.Scale(c.sign, c.points, c.priority);
            curScale.defineCards(cards.filter(x => x.includes(DECK_SIGNS[s.top][1])));
            scales.push(curScale);
        }
        else {
            const c = JSON.parse(JSON.stringify(Scales_1.IN_A_ROW[8 - s.count]));
            const curScale = new Scale_1.Scale(DECK_SIGNS[s.color * 8][0] + '-count-' + s.count + '-upto-' + DECK_SIGNS[s.top][1], c.points, c.priority + IN_A_ROW_LARGEST[s.top].priority);
            const last = s.color * 8 + s.top + 1;
            curScale.defineCards(DECK_SIGNS.slice(last - s.count, last));
            scales.push(curScale);
        }
    }
    return scales;
}
exports.evaluateScale = evaluateScale;
//# sourceMappingURL=evaluateScale.js.map