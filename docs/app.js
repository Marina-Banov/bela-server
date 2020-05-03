"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Match_1 = require("./classes/Match");
const Game_1 = require("./classes/Game");
const Player_1 = require("./classes/Player");
const playerHelperFunctions_1 = require("./functions/playerHelperFunctions");
const evaluateScale_1 = require("./functions/evaluateScale");
const evaluatePlay_1 = require("./functions/evaluatePlay");
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const io = __importStar(require("socket.io"));
const connections = [];
let match;
let curGame;
const users = [];
const app = express_1.default();
app.get('/', (req, res) => res.send('<h1>Hello world</h1>'));
const httpServer = http.createServer(app);
const port = process.env.PORT || 80;
httpServer.listen(port, () => console.log('listening on *:', port));
const socketIo = io.listen(httpServer);
socketIo.on('connection', socket => {
    connect(socket);
    socket.on('newUser', (username) => {
        socket.username = username;
        newUser(username);
    });
    socket.on('calledTrump', (trump) => calledTrump(trump, socket.username));
    socket.on('calledScale', (cards) => calledScale(cards, socket.username));
    socket.on('cardPlayed', (card) => {
        if (users.find(x => x.username === socket.username).checkBela(card)) {
            socketIo.emit('callBela', { username: socket.username, card });
        }
        else {
            cardPlayed(card, socket.username);
        }
    });
    socket.on('calledBela', (bela) => {
        if (bela.called) {
            calledBela(socket.username);
        }
        cardPlayed(bela.card, socket.username);
    });
    socket.on('userLeaves', (username) => userLeaves(username));
    socket.on('killedMatch', (username) => socketIo.emit('killMatch', username));
    socket.on('disconnect', () => disconnect(socket));
});
function connect(socket) {
    if (connections.length === 0) {
        match = new Match_1.Match();
        curGame = match.startNewGame();
    }
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);
}
function disconnect(socket) {
    const i = users.indexOf(users.find(user => user.username === socket.username));
    if (i !== -1) {
        users.splice(i, 1);
    }
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
}
function newUser(username) {
    const user = new Player_1.Player(username, curGame.dealCards());
    socketIo.emit('hand', { username, hand: user.getOnlyCardSigns(), display8: false });
    users.push(user);
    if (user.team === 'A') {
        match.teamA.users.push(user);
    }
    else {
        match.teamB.users.push(user);
    }
    if (users.length === 4) {
        socketIo.emit('updateUsers', { usernames: playerHelperFunctions_1.getUsernames(users), teams: playerHelperFunctions_1.getTeams(users) });
        setTimeout(() => {
            socketIo.emit('callTrump', { username: users[curGame.turn].username, lastCall: false });
        }, 2000);
    }
    else {
        socketIo.emit('updateUsers', { usernames: playerHelperFunctions_1.getUsernames(users), teams: null });
    }
}
function calledTrump(trump, username) {
    if (trump === '') {
        const turn = curGame.nextTurn();
        const lastCall = users[Game_1.Game.dealer].username === users[turn].username;
        socketIo.emit('callTrump', { username: users[turn].username, lastCall });
        const player = users.find(x => x.username === username);
        player.sortHand();
        socketIo.emit('hand', { username: player.username, hand: player.getOnlyCardSigns(), display8: true });
    }
    else {
        curGame.setTrump({ sign: trump, team: playerHelperFunctions_1.getPlayerTeam(users, username) });
        curGame.setTrumpValues(users);
        socketIo.emit('setTrump', { trump, username });
        users.forEach(player => {
            socketIo.emit('hand', { username: player.username, hand: player.getOnlyCardSigns(), display8: true });
        });
        const turn = curGame.turnAfterDealer();
        socketIo.emit('callScale', users[turn].username);
    }
}
function calledScale(cards, username) {
    let announcePoints = 0;
    if (cards.length !== 0) {
        const scales = evaluateScale_1.evaluateScale(cards);
        if (!scales) {
            socketIo.emit('cardNotAllowed', username);
            socketIo.emit('callScale', username);
            return;
        }
        announcePoints = (playerHelperFunctions_1.getPlayerTeam(users, username) === 'A') ? match.teamA.addScale(scales, curGame.curScalePriority, username)
            : match.teamB.addScale(scales, curGame.curScalePriority, username);
    }
    socketIo.emit('announceScale', { username, points: announcePoints, bela: false });
    if (curGame.turn !== Game_1.Game.dealer) {
        socketIo.emit('callScale', users[curGame.nextTurn()].username);
    }
    else {
        if (curGame.curScalePriority.team === 'A') {
            curGame.addScalePoints(match.teamA);
            socketIo.emit('showScales', match.teamA.getScales());
        }
        else if (curGame.curScalePriority.team === 'B') {
            curGame.addScalePoints(match.teamB);
            socketIo.emit('showScales', match.teamB.getScales());
        }
        socketIo.emit('gamePoints', curGame.getGamePoints());
        socketIo.emit('playCard', users[curGame.turnAfterDealer()].username);
    }
}
function cardPlayed(card, username) {
    const user = users.find(x => x.username === username);
    if (!curGame.isPlayValid(card, user)) {
        socketIo.emit('cardNotAllowed', username);
        return;
    }
    curGame.putCardOnTable(card, user);
    socketIo.emit('acceptCard', { username, card });
    socketIo.emit('hand', { username, hand: user.getOnlyCardSigns(), display8: true });
    if (curGame.nextTurn() === curGame.firstToPlay) {
        const points = evaluatePlay_1.evaluatePlay(curGame.cardsOnTable);
        if (user.hand.length === 0) {
            points.value += 10;
            if (!curGame.tookCardsA || !curGame.tookCardsB) {
                points.value += 90;
            }
            if (curGame.pointsA && !curGame.tookCardsA) {
                curGame.pointsB += curGame.pointsA;
                curGame.pointsA = 0;
            }
            else if (curGame.pointsB && !curGame.tookCardsB) {
                curGame.pointsA += curGame.pointsB;
                curGame.pointsB = 0;
            }
        }
        const team = playerHelperFunctions_1.getPlayerTeam(users, points.username);
        if (team === 'A') {
            curGame.pointsA += points.value;
            curGame.tookCardsA = true;
        }
        else {
            curGame.pointsB += points.value;
            curGame.tookCardsB = true;
        }
        if (user.hand.length !== 0) {
            setTimeout(() => {
                socketIo.emit('gamePoints', curGame.getGamePoints());
                curGame.firstToPlay = users.indexOf(users.find(x => x.username === points.username));
                curGame.turn = curGame.firstToPlay;
                curGame.cardsOnTable = [];
                socketIo.emit('playCard', users[curGame.turn].username);
            }, 2000);
        }
        else {
            if (curGame.checkForFail()) {
                socketIo.emit('fail', curGame.trump.team);
            }
            setTimeout(() => {
                curGame = match.startNewGame();
                const matchPoints = match.getMatchPoints();
                socketIo.emit('matchPoints', matchPoints);
                const winnerTeam = match.endMatch(matchPoints.total);
                if (winnerTeam) {
                    setTimeout(() => {
                        socketIo.emit('endMatch', winnerTeam);
                    }, 1000);
                }
                else {
                    users.forEach(u => {
                        u.hand = curGame.dealCards();
                        socketIo.emit('hand', { username: u.username, hand: u.getOnlyCardSigns(), display8: false });
                    });
                    socketIo.emit('callTrump', { username: users[curGame.turn].username, lastCall: false });
                }
            }, 2000);
        }
    }
    else {
        socketIo.emit('playCard', users[curGame.turn].username);
    }
}
function calledBela(username) {
    socketIo.emit('announceScale', { username, points: 20, bela: true });
    const team = playerHelperFunctions_1.getPlayerTeam(users, username);
    if (team === 'A') {
        curGame.pointsA += 20;
    }
    else {
        curGame.pointsB += 20;
    }
    socketIo.emit('gamePoints', curGame.getGamePoints());
}
function userLeaves(username) {
    const i = users.indexOf(users.find(user => user.username === username));
    if (i !== -1) {
        users.splice(i, 1);
    }
    if (users.length === 0) {
        match = new Match_1.Match();
        curGame = match.startNewGame();
    }
}
//# sourceMappingURL=app.js.map