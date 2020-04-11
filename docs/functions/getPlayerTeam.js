"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPlayerTeam(users, username) {
    return users.find(x => x.username === username).team;
}
exports.getPlayerTeam = getPlayerTeam;
//# sourceMappingURL=getPlayerTeam.js.map