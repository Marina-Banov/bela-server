"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const Room_1 = require("./classes/Room");
const evaluateScale_1 = require("./functions/evaluateScale");
const isPlayValid_1 = require("./functions/isPlayValid");
const evaluatePlay_1 = require("./functions/evaluatePlay");
const Actions_1 = require("./constants/Actions");
let connections = 0;
const rooms = [];
const app = express_1.default();
app.get('/', (req, res) => res.send('<h1>Hello world</h1>'));
const httpServer = http_1.createServer(app);
const port = process.env.PORT || 80;
httpServer.listen(port, () => console.log('listening on *:', port));
const socketIo = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ['https://marina-banov.github.io', 'http://localhost:4200'],
        methods: ['GET', 'POST'],
        allowedHeaders: [''],
        credentials: true
    }
});
socketIo.on('connection', socket => {
    logger(`Connected: ${++connections} sockets connected`);
    socket.on('clientMessage', (data) => {
        if (data.action === Actions_1.ACTIONS.JOIN_ROOM) {
            logger(`User ${data.username} trying to join room...`, data.roomId);
            joinRoom(socket, findRoom(data.roomId, data.roomCapacity), data.username, data.hand);
            return;
        }
        const room = findRoom(socket.gameRoom);
        const username = socket.username;
        switch (data.action) {
            case Actions_1.ACTIONS.CALLED_BELA:
                calledBela(room, data.card, data.called, username);
                break;
            case Actions_1.ACTIONS.CALLED_SCALE:
                calledScale(room, data.cards, username);
                break;
            case Actions_1.ACTIONS.CALLED_TRUMP:
                calledTrump(room, data.trump, username);
                break;
            case Actions_1.ACTIONS.DISCARDED:
                discarded(room, data.cards, username);
                break;
            case Actions_1.ACTIONS.PLAYED_CARD:
                playedCard(room, data.card, username);
                break;
            case Actions_1.ACTIONS.REORDER_PLAYERS:
                reorderPlayers(room, data.usernames);
                break;
        }
    });
    socket.on('disconnect', () => disconnect(socket));
});
function disconnect(socket) {
    if (socket.gameRoom) {
        const room = rooms.find(r => r.id === socket.gameRoom);
        room.userLeave(socket.username);
        logger(`User ${socket.username} left the room.`, socket.gameRoom);
        if (room.users.length === 0) {
            rooms.splice(rooms.indexOf(room), 1);
            logger('Room destroyed', socket.gameRoom);
        }
    }
    connections--;
    logger(`Disconnected: ${connections} sockets connected`);
}
function findRoom(id, capacity) {
    const i = rooms.indexOf(rooms.find(r => r.id === id));
    if (i === -1) {
        logger(`Room not found. Creating room with capacity ${capacity}.`, id);
        const r = new Room_1.Room(id, capacity);
        rooms.push(r);
        return r;
    }
    else {
        return rooms[i];
    }
}
function joinRoom(socket, room, username, hand) {
    const user = room.userJoin(username, socket.id, hand);
    if (user) {
        socket.join(room.id);
        socket.username = username;
        socket.gameRoom = room.id;
        logger(`User ${username} joined room.`, room.id);
        if (room.users.length !== room.capacity) {
            const message = 'Čekamo još igrača (' + room.users.length + '/' + room.capacity + ')';
            socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.INFO_WAITING, message });
        }
        else {
            const message = 'Admin mijenja redoslijed igrača';
            socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.INFO_WAITING, message });
            socketIo.to(room.users[0].id).emit('serverMessage', {
                action: Actions_1.ACTIONS.ARRANGE_USERS,
                users: room.users.map(u => u.username)
            });
            logger(`Waiting for ${room.users[0].username} to arrange other users...`, room.id);
        }
    }
    else {
        socket.emit('serverMessage', { action: Actions_1.ACTIONS.NO_ROOM });
        logger(`User ${username} couldn't join the room.`, room.id);
    }
}
function reorderPlayers(room, usernames) {
    logger('Reordering players...', room.id);
    const newUsersArray = [];
    usernames.forEach(u => newUsersArray.push(room.getUser(u)));
    room.users = newUsersArray;
    socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.UPDATE_USERS, users: usernames });
    room.users.forEach(u => {
        socketIo.to(u.id).emit('serverMessage', { action: Actions_1.ACTIONS.SET_HAND, hand: u.hand, displayAll: false });
    });
    socketIo.to(room.id).emit('serverMessage', {
        action: Actions_1.ACTIONS.CALL_TRUMP,
        username: room.users[room.curGame.turn].username,
        lastCall: false
    });
    logger(`Waiting for ${room.users[room.curGame.turn].username} to pick a trump...`, room.id);
}
function calledTrump(room, trump, username) {
    if (trump === '') {
        // if user hasn't picked trump
        // ask the next user to pick a trump
        const turn = room.curGame.nextTurn();
        socketIo.to(room.id).emit('serverMessage', {
            action: Actions_1.ACTIONS.CALL_TRUMP,
            username: room.users[turn].username,
            lastCall: (room.curGame.dealer === turn)
        });
        logger(`Waiting for ${room.users[room.curGame.turn].username} to pick a trump...`, room.id);
        // and reveal the hidden cards
        const player = room.getUser(username);
        player.sortHand();
        socketIo.to(player.id).emit('serverMessage', { action: Actions_1.ACTIONS.SET_HAND, hand: player.hand, displayAll: true });
    }
    else {
        logger(`Setting trump (${trump})...`, room.id);
        // set trump and update card values for all users
        room.curGame.setTrump(trump, username, room.users);
        // emit the trump
        socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.SET_TRUMP, trump, username });
        // update card values and reveal the hidden cards
        room.users.forEach(p => {
            socketIo.to(p.id).emit('serverMessage', { action: Actions_1.ACTIONS.SET_HAND, hand: p.hand, displayAll: true });
        });
        if (room.capacity === 4) {
            socketIo.to(room.id).emit('serverMessage', {
                action: Actions_1.ACTIONS.CALL_SCALE,
                username: room.users[room.curGame.turnAfterDealer()].username
            });
            logger(`Waiting for ${room.users[room.curGame.turn].username} to call scale...`, room.id);
        }
        else {
            logger(`Waiting for ${username} to discard 2 cards...`, room.id);
        }
    }
}
function discarded(room, cards, username) {
    const player = room.getUser(username);
    room.curGame.discardTwoCards(player, cards);
    socketIo.to(player.id).emit('serverMessage', { action: Actions_1.ACTIONS.SET_HAND, hand: player.hand, displayAll: true });
    socketIo.to(room.id).emit('serverMessage', {
        action: Actions_1.ACTIONS.CALL_SCALE,
        username: room.users[room.curGame.turnAfterDealer()].username
    });
    logger(`Waiting for ${room.users[room.curGame.turn].username} to call scale...`, room.id);
}
function calledScale(room, cards, username) {
    const player = room.getUser(username);
    let announcePoints = 0;
    if (cards.length !== 0) {
        const scales = evaluateScale_1.evaluateScale(cards);
        if (!scales) {
            logger(`User ${username} called an invalid scale.`, room.id);
            socketIo.to(player.id).emit('serverMessage', { action: Actions_1.ACTIONS.INFO, message: 'REKA SAN NE MOŽE!' });
            socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.CALL_SCALE, username: player.username });
            logger(`Waiting for ${username} to call scale...`, room.id);
            return;
        }
        const index = room.users.indexOf(player);
        announcePoints = room.curGame.trackScales(scales, username, index, room.match);
        scales.forEach(s => {
            logger(`User ${username} has a scale ${s.sign} (+${s.points} points).`, room.id);
        });
    }
    else {
        logger(`User ${username} doesn't have a scale.`, room.id);
    }
    socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.ANNOUNCE_SCALE, username, points: announcePoints });
    if (room.curGame.turn !== room.curGame.dealer) {
        socketIo.to(room.id).emit('serverMessage', {
            action: Actions_1.ACTIONS.CALL_SCALE,
            username: room.users[room.curGame.nextTurn()].username
        });
        logger(`Waiting for ${room.users[room.curGame.turn].username} to call scale...`, room.id);
    }
    else {
        socketIo.to(room.id).emit('serverMessage', {
            action: Actions_1.ACTIONS.SHOW_SCALES,
            scales: room.curGame.addScalePoints(room.match, room.users)
        });
        socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.GAME_POINTS, gamePoints: room.curGame.points });
        logger(`Game points: ${room.curGame.points}`, room.id);
        socketIo.to(room.id).emit('serverMessage', {
            action: Actions_1.ACTIONS.PLAY_CARD,
            username: room.users[room.curGame.turnAfterDealer()].username
        });
        logger(`Waiting for ${room.users[room.curGame.turn].username} to play a card...`, room.id);
    }
}
function playedCard(room, c, username) {
    const player = room.getUser(username);
    const card = player.hand.find(x => x.sign === c);
    if (!isPlayValid_1.isPlayValid(card, player.hand, room.curGame.cardsOnTable.map(x => x.card))) {
        logger(`User ${username} played an invalid card (${c}).`, room.id);
        socketIo.to(player.id).emit('serverMessage', { action: Actions_1.ACTIONS.INFO, message: 'REKA SAN NE MOŽE!' });
        return;
    }
    if (player.checkBela(card)) {
        logger(`Waiting for ${username} to call bela...`, room.id);
        socketIo.to(player.id).emit('serverMessage', { action: Actions_1.ACTIONS.CALL_BELA, card: c });
        return;
    }
    logger(`User ${username} played ${c}.`, room.id);
    room.curGame.putCardOnTable(card, player);
    socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.ACCEPT_CARD, username, card: c });
    socketIo.to(player.id).emit('serverMessage', { action: Actions_1.ACTIONS.SET_HAND, hand: player.hand, displayAll: true });
    if (room.curGame.nextTurn() !== room.curGame.firstToPlay) {
        socketIo.to(room.id).emit('serverMessage', {
            action: Actions_1.ACTIONS.PLAY_CARD,
            username: room.users[room.curGame.turn].username
        });
        logger(`Waiting for ${room.users[room.curGame.turn].username} to play a card...`, room.id);
        return;
    }
    const points = evaluatePlay_1.evaluatePlay(room.curGame.cardsOnTable);
    const winner = room.users.indexOf(room.getUser(points.username));
    logger(`User ${points.username} won the round (+${points.value} points).`, room.id);
    room.curGame.addCardPoints(points.value, player.hand.length === 0, winner);
    logger(`Game points: ${room.curGame.points}`, room.id);
    if (player.hand.length !== 0) {
        setTimeout(() => {
            socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.GAME_POINTS, gamePoints: room.curGame.points });
            room.curGame.firstToPlay = winner;
            room.curGame.turn = room.curGame.firstToPlay;
            room.curGame.cardsOnTable = [];
            socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.PLAY_CARD, username: points.username });
            logger(`Waiting for ${room.users[room.curGame.turn].username} to play a card...`, room.id);
        }, 2000);
    }
    else {
        const message = room.curGame.endGame(room.users.map(u => u.username));
        if (message) {
            logger(message);
            setTimeout(() => {
                socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.INFO, message });
                // TODO tu se nesto zbuga (s front strane - otvaranje dialoga i to? odabere se null adut, podijele se karte)
            }, 1000);
        }
        setTimeout(() => {
            room.match.updateMatchPoints();
            socketIo.to(room.id).emit('serverMessage', {
                action: Actions_1.ACTIONS.MATCH_POINTS,
                games: room.match.points,
                total: room.match.total
            });
            logger(`Match points: ${room.match.total}`, room.id);
            const matchWinner = room.match.endMatch(room.users.map(u => u.username));
            if (matchWinner) {
                logger(matchWinner, room.id);
                setTimeout(() => {
                    socketIo.to(room.id).emit('endMatch', matchWinner);
                }, 1000);
            }
            else {
                logger('Starting new game...', room.id);
                room.curGame = room.match.startNewGame(room.curGame.turnAfterDealer(room.capacity));
                room.curGame.firstToPlay = room.curGame.turnAfterDealer();
                room.users.forEach(u => {
                    u.hand = room.curGame.dealCards();
                    socketIo.to(u.id).emit('serverMessage', { action: Actions_1.ACTIONS.SET_HAND, hand: u.hand, displayAll: false });
                });
                socketIo.to(room.id).emit('serverMessage', {
                    action: Actions_1.ACTIONS.CALL_TRUMP,
                    username: room.users[room.curGame.turn].username,
                    lastCall: false
                });
                logger(`Waiting for ${room.users[room.curGame.turn].username} to pick a trump...`, room.id);
            }
        }, 2500);
    }
}
function calledBela(room, c, called, username) {
    // TODO bela je clearala stol!?
    if (called) {
        logger(`User ${username} called bela (+20 points).`, room.id);
        socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.INFO, message: 'BELA!' });
        const index = room.users.indexOf(room.getUser(username));
        room.curGame.addBelaPoints(index);
        socketIo.to(room.id).emit('serverMessage', { action: Actions_1.ACTIONS.GAME_POINTS, gamePoints: room.curGame.points });
    }
    else {
        logger(`User ${username} didn't call bela.`, room.id);
    }
    playedCard(room, c, username);
}
function logger(msg, room) {
    console.log(`[${new Date().toLocaleString('hr')}][${room}] - ${msg}`);
}
//# sourceMappingURL=app.js.map