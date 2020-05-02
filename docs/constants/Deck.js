"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Card_1 = require("../classes/Card");
exports.DECK = {
    H7: new Card_1.Card('H7', 0, 0),
    H8: new Card_1.Card('H8', 0, 1),
    H9: new Card_1.Card('H9', 0, 2),
    HX: new Card_1.Card('HX', 10, 3),
    HJ: new Card_1.Card('HJ', 2, 4),
    HQ: new Card_1.Card('HQ', 3, 5),
    HK: new Card_1.Card('HK', 4, 6),
    HA: new Card_1.Card('HA', 11, 7),
    C7: new Card_1.Card('C7', 0, 8),
    C8: new Card_1.Card('C8', 0, 9),
    C9: new Card_1.Card('C9', 0, 10),
    CX: new Card_1.Card('CX', 10, 11),
    CJ: new Card_1.Card('CJ', 2, 12),
    CQ: new Card_1.Card('CQ', 3, 13),
    CK: new Card_1.Card('CK', 4, 14),
    CA: new Card_1.Card('CA', 11, 15),
    S7: new Card_1.Card('S7', 0, 16),
    S8: new Card_1.Card('S8', 0, 17),
    S9: new Card_1.Card('S9', 0, 18),
    SX: new Card_1.Card('SX', 10, 19),
    SJ: new Card_1.Card('SJ', 2, 20),
    SQ: new Card_1.Card('SQ', 3, 21),
    SK: new Card_1.Card('SK', 4, 22),
    SA: new Card_1.Card('SA', 11, 23),
    D7: new Card_1.Card('D7', 0, 24),
    D8: new Card_1.Card('D8', 0, 25),
    D9: new Card_1.Card('D9', 0, 26),
    DX: new Card_1.Card('DX', 10, 27),
    DJ: new Card_1.Card('DJ', 2, 28),
    DQ: new Card_1.Card('DQ', 3, 29),
    DK: new Card_1.Card('DK', 4, 30),
    DA: new Card_1.Card('DA', 11, 31)
};
exports.DECK_SIGNS = [
    'H7', 'H8', 'H9', 'HX', 'HJ', 'HQ', 'HK', 'HA',
    'C7', 'C8', 'C9', 'CX', 'CJ', 'CQ', 'CK', 'CA',
    'S7', 'S8', 'S9', 'SX', 'SJ', 'SQ', 'SK', 'SA',
    'D7', 'D8', 'D9', 'DX', 'DJ', 'DQ', 'DK', 'DA'
];
//# sourceMappingURL=Deck.js.map