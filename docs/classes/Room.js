"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const Player_1 = require("./Player");
const Match3_1 = require("./Match3");
const Match4_1 = require("./Match4");
class Room {
    constructor(id, capacity) {
        this.id = id;
        this.capacity = capacity;
        this.users = [];
        this.match = (capacity === 3) ? new Match3_1.Match3() : new Match4_1.Match4();
        this.curGame = this.match.startNewGame(capacity - 1);
        this.curGame.firstToPlay = this.curGame.turnAfterDealer();
    }
    userJoin(username, id, hand) {
        if (this.users.length === this.capacity) {
            return null;
        }
        if (!hand) {
            hand = this.curGame.dealCards();
        }
        const user = new Player_1.Player(id, username, hand);
        this.users.push(user);
        return user;
    }
    getUser(username) {
        return this.users.find(user => user.username === username);
    }
    userLeave(username) {
        const index = this.users.findIndex(user => user.username === username);
        if (index !== -1) {
            return this.users.splice(index, 1)[0];
        }
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map