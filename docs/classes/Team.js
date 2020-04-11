"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Team {
    constructor(name) {
        this.name = name;
        this.users = [];
        this.priority = 1000;
        this.scales = [];
    }
    addScale(scale, priority, curPriority) {
        if (this.scales.find(x => x.sign === scale.sign)) {
            return false;
        }
        if (priority < curPriority.value) {
            curPriority.team = this.name;
            curPriority.value = priority;
        }
        this.scales.push(scale);
        if (priority < this.priority) {
            // TODO DODATI NAPOMENU NA FRONTENDU DA SE PRVO ZOVE NAJVEĆE ZVANJE
            // PAMETNI LJUDI BI FIXALI TAJ BUG ALI JA CU GA IMPLEMENTIRATI
            this.priority = priority;
            return true;
        }
        if (!curPriority.usernames.find(x => x === scale.username)) {
            curPriority.usernames.push(scale.username);
            return true;
        }
        return false;
    }
    getScales() {
        let hands = [];
        for (const s of this.scales) {
            hands.push({ hand: s.hand, username: s.username });
        }
        return hands;
    }
}
exports.Team = Team;
//# sourceMappingURL=Team.js.map