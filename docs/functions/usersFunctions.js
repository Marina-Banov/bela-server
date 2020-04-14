"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPlayerTeam(users, username) {
    return users.find(x => x.username === username).team;
}
exports.getPlayerTeam = getPlayerTeam;
function getUsernames(users) {
    let usernames = [];
    users.forEach(u => {
        usernames.push(u.username);
    });
    return usernames;
}
exports.getUsernames = getUsernames;
//# sourceMappingURL=usersFunctions.js.map
