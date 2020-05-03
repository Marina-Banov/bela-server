"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Team {
    constructor(name) {
        this.name = name;
        this.users = [];
        this.scales = [];
    }
    addScale(scales, curPriority, username) {
        const minPriority = Math.min.apply(Math, scales.map(x => x.priority));
        if (minPriority < curPriority.value) {
            curPriority.team = this.name;
            curPriority.value = minPriority;
        }
        scales.forEach(s => this.scales.push({ sign: s.sign, points: s.points, hand: s.cardSymbols, username }));
        return Math.max.apply(Math, scales.map(x => x.points));
    }
    getScales() {
        const hands = [];
        for (const s of this.scales) {
            hands.push({ hand: s.hand, username: s.username });
        }
        return hands;
    }
}
exports.Team = Team;
//# sourceMappingURL=Team.js.map