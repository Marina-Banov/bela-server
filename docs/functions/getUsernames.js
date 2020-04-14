"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getUsernames(users) {
    let usernames = [];
    users.forEach(u => {
        usernames.push(u.username);
    });
    return usernames;
}
exports.getUsernames = getUsernames;
//# sourceMappingURL=getUsernames.js.map
