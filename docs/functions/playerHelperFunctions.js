"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getUsernames(users) {
    const usernames = [];
    users.forEach(u => {
        usernames.push(u.username);
    });
    return usernames;
}
exports.getUsernames = getUsernames;
function getTeams(users) {
    const teams = {
        A: [],
        B: []
    };
    users.forEach(u => {
        if (u.team === 'A') {
            teams.A.push(u.username);
        }
        else {
            teams.B.push(u.username);
        }
    });
    return teams;
}
exports.getTeams = getTeams;
function getPlayerTeam(users, username) {
    return users.find(x => x.username === username).team;
}
exports.getPlayerTeam = getPlayerTeam;
//# sourceMappingURL=playerHelperFunctions.js.map