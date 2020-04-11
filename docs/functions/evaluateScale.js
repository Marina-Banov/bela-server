"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scales_1 = require("../constants/Scales");
function evaluateScale(cards) {
    let scale = null;
    // ako su 4 iste vrste
    if (cards.length === 4 && cards[0][1] !== '7' && cards[0][1] !== '8' && cards.every(x => x.includes(cards[0][1]))) {
        scale = JSON.parse(JSON.stringify(Scales_1.SAMESIES.find(x => x.sign === cards[0][1])));
    }
    // ako su sve u istoj boji
    if (cards.every(x => x.includes(cards[0][0]))) {
        let IN_A_ROW_LARGEST = JSON.parse(JSON.stringify(Scales_1.COUNT_IN_A_ROW_LARGEST));
        for (let i = 0; i < cards.length; i++) {
            const key = '-upto-' + cards[i][1];
            IN_A_ROW_LARGEST[key].value = true;
        }
        let found = false;
        let largest = null;
        let count = 0;
        for (const key of Object.keys(IN_A_ROW_LARGEST)) {
            if (IN_A_ROW_LARGEST[key].value) {
                largest = key;
                count++;
                if (!found)
                    found = true;
            }
            else {
                if (found)
                    break;
            }
        }
        if (count >= 3) {
            scale = JSON.parse(JSON.stringify(Scales_1.IN_A_ROW.find(x => parseInt(x.sign[6], 10) === count)));
            scale.sign = scale.sign + largest;
            scale.priority += IN_A_ROW_LARGEST[largest].priority;
        }
    }
    return scale;
}
exports.evaluateScale = evaluateScale;
//# sourceMappingURL=evaluateScale.js.map