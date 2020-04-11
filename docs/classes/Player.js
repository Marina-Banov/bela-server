"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(username, hand) {
        this.username = username;
        this.hand = hand;
        this.team = (Player.count % 2) ? 'B' : 'A';
        Player.count++;
    }
}
exports.Player = Player;
Player.count = 0;
//# sourceMappingURL=Player.js.map