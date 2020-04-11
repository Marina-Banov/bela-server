"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scale_1 = require("../classes/Scale");
exports.SAMESIES = [
    new Scale_1.Scale('J', 200, 1),
    new Scale_1.Scale('9', 150, 2),
    new Scale_1.Scale('A', 100, 50),
    new Scale_1.Scale('K', 100, 51),
    new Scale_1.Scale('Q', 100, 52),
    new Scale_1.Scale('X', 100, 53)
];
exports.IN_A_ROW = [
    new Scale_1.Scale('count-8', 1001, 0),
    new Scale_1.Scale('count-7', 100, 10),
    new Scale_1.Scale('count-6', 100, 20),
    new Scale_1.Scale('count-5', 100, 100),
    new Scale_1.Scale('count-4', 50, 200),
    new Scale_1.Scale('count-3', 20, 500)
];
exports.COUNT_IN_A_ROW_LARGEST = {
    '-upto-7': { value: false, priority: 5 },
    '-upto-8': { value: false, priority: 5 },
    '-upto-9': { value: false, priority: 5 },
    '-upto-X': { value: false, priority: 4 },
    '-upto-J': { value: false, priority: 3 },
    '-upto-Q': { value: false, priority: 2 },
    '-upto-K': { value: false, priority: 1 },
    '-upto-A': { value: false, priority: 0 }
};
//# sourceMappingURL=Scales.js.map