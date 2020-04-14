"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPlayers(users) {
    let players = [];
    users.forEach(u => {
        players.push({ username: u.username, team: u.team });
    });
    return players;
}
exports.getPlayers = getPlayers;
//# sourceMappingURL=getPlayers.js.map
