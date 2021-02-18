import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Room } from './classes/Room';
import { Card } from './classes/Card';
import { evaluateScale } from './functions/evaluateScale';
import { isPlayValid } from './functions/isPlayValid';
import { evaluatePlay } from './functions/evaluatePlay';
import { ACTIONS, ClientMessage } from './constants/Actions';


let connections: number = 0;
const rooms: Room[] = [];


const app = express();
app.get('/', (req, res) => res.send('<h1>Hello world</h1>'));

const httpServer = createServer(app);
const port = process.env.PORT || 80;
httpServer.listen(port, () => console.log('listening on *:', port));

const socketIo = new Server(httpServer, {
  cors: {
    origin: ['https://marina-banov.github.io', 'http://localhost:4200'],
    methods: ['GET', 'POST'],
    allowedHeaders: [''],
    credentials: true
  }
});
socketIo.on('connection', socket => {
	console.log('Connected: %s sockets connected', ++connections);

	socket.on('clientMessage', (data: ClientMessage) => {
		if (data.action === ACTIONS.JOIN_ROOM) {
			joinRoom(socket, findRoom(data.roomId, data.roomCapacity), data.username, data.hand);
			return;
		}

		const room = findRoom(socket.gameRoom);
		const username = socket.username;
		switch (data.action) {
			case ACTIONS.CALLED_BELA: 	  calledBela(room, data.card, data.called, username); break;
			case ACTIONS.CALLED_SCALE:    calledScale(room, data.cards, username);			  break;
			case ACTIONS.CALLED_TRUMP:    calledTrump(room, data.trump, username);			  break;
			case ACTIONS.DISCARDED: 	  discarded(room, data.cards, username);			  break;
			case ACTIONS.PLAYED_CARD: 	  playedCard(room, data.card, username);			  break;
			case ACTIONS.REORDER_PLAYERS: reorderPlayers(room, data.usernames);				  break;
		}
	});

	socket.on('disconnect', () => disconnect(socket));
});

function disconnect(socket: any): void {
	if (socket.gameRoom) {
		const room = rooms.find(r => r.id === socket.gameRoom);
		room.userLeave(socket.username);
		console.log(socket.username + ' left the room ' + socket.gameRoom);
		if (room.users.length === 0) {
			rooms.splice(rooms.indexOf(room), 1);
			console.log('Room ' + socket.gameRoom + ' destroyed');
		}
	}
	connections--;
	console.log('Disconnected: %s sockets connected', connections);
}

function findRoom(id: string, capacity?: number): Room {
	const i = rooms.indexOf(rooms.find(r => r.id === id));
	if (i === -1) {
		const r = new Room(id, capacity);
		rooms.push(r);
		return r;
	} else {
		return rooms[i];
	}
}

function joinRoom(socket: any, room: Room, username: string, hand: Card[]): void {
	const user = room.userJoin(username, socket.id, hand);
	if (user) {
		socket.join(room.id);
		socket.username = username;
		socket.gameRoom = room.id;
		if (room.users.length !== room.capacity) {
			const message = 'Čekamo još igrača (' + room.users.length + '/' + room.capacity + ')';
			socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.INFO_WAITING, message });
		} else {
			const message = 'Admin mijenja redoslijed igrača';
			socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.INFO_WAITING, message });
			socketIo.to(room.users[0].id).emit('serverMessage', {
				action: ACTIONS.ARRANGE_USERS,
				users: room.users.map(u => u.username)
			});
		}
		console.log(username + ' joined room ' + room.id);
	} else {
		socket.emit('serverMessage', { action: ACTIONS.NO_ROOM });
		console.log(username + ' couldn\'t join room ' + room.id);
	}
}

function reorderPlayers(room: Room, usernames: string[]): void {
	const newUsersArray = [];
	usernames.forEach(u => newUsersArray.push(room.getUser(u)));
	room.users = newUsersArray;
	socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.UPDATE_USERS, users: usernames });
	room.users.forEach(u => {
		socketIo.to(u.id).emit('serverMessage', { action: ACTIONS.SET_HAND, hand: u.hand, displayAll: false });
	});
	socketIo.to(room.id).emit('serverMessage', {
		action: ACTIONS.CALL_TRUMP,
		username: room.users[room.curGame.turn].username,
		lastCall: false
	});
}

function calledTrump(room: Room, trump: string, username: string): void {
	if (trump === '') {
		// if user hasn't picked trump
		// ask the next user to pick a trump
		const turn = room.curGame.nextTurn();
		socketIo.to(room.id).emit('serverMessage', {
			action: ACTIONS.CALL_TRUMP,
			username: room.users[turn].username,
			lastCall: (room.curGame.dealer === turn)
		});
		// and reveal the hidden cards
		const player = room.getUser(username);
		player.sortHand();
		socketIo.to(player.id).emit('serverMessage', { action: ACTIONS.SET_HAND, hand: player.hand, displayAll: true });
	} else {
		// set trump and update card values for all users
		room.curGame.setTrump(trump, username, room.users);
		// emit the trump
		socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.SET_TRUMP, trump, username });
		// update card values and reveal the hidden cards
		room.users.forEach(p => {
			socketIo.to(p.id).emit('serverMessage', { action: ACTIONS.SET_HAND, hand: p.hand, displayAll: true });
		});
		if (room.capacity === 4) {
			socketIo.to(room.id).emit('serverMessage', {
				action: ACTIONS.CALL_SCALE,
				username: room.users[room.curGame.turnAfterDealer()].username
			});
		}
	}
}

function discarded(room: Room, cards: string[], username: string): void {
	const player = room.getUser(username);
	room.curGame.discardTwoCards(player, cards);
	socketIo.to(player.id).emit('serverMessage', { action: ACTIONS.SET_HAND, hand: player.hand, displayAll: true });
	socketIo.to(room.id).emit('serverMessage', {
		action: ACTIONS.CALL_SCALE,
		username: room.users[room.curGame.turnAfterDealer()].username
	});
}

function calledScale(room: Room, cards: string[], username: string): void {
	const player = room.getUser(username);

	let announcePoints = 0;
	if (cards.length !== 0) {
		const scales = evaluateScale(cards);
		if (!scales) {
			socketIo.to(player.id).emit('serverMessage', { action: ACTIONS.INFO, message: 'REKA SAN NE MOŽE!'});
			socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.CALL_SCALE, username: player.username});
			return;
		}
		const index = room.users.indexOf(player);
		announcePoints = room.curGame.trackScales(scales, username, index, room.match);
	}
	socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.ANNOUNCE_SCALE, username, points: announcePoints });

	if (room.curGame.turn !== room.curGame.dealer) {
		socketIo.to(room.id).emit('serverMessage', {
			action: ACTIONS.CALL_SCALE,
			username: room.users[room.curGame.nextTurn()].username
		});
	} else {
		socketIo.to(room.id).emit('serverMessage', {
			action: ACTIONS.SHOW_SCALES,
			scales: room.curGame.addScalePoints(room.match, room.users)
		});
		socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.GAME_POINTS, gamePoints: room.curGame.points });
		socketIo.to(room.id).emit('serverMessage', {
			action: ACTIONS.PLAY_CARD,
			username: room.users[room.curGame.turnAfterDealer()].username
		});
	}
}

function playedCard(room: Room, c: string, username: string): void {
	const player = room.getUser(username);
	const card = player.hand.find(x => x.sign === c);

	if (!isPlayValid(card, player.hand, room.curGame.cardsOnTable.map(x => x.card))) {
		socketIo.to(player.id).emit('serverMessage', { action: ACTIONS.INFO, message: 'REKA SAN NE MOŽE!' });
		return;
	}

	if (player.checkBela(card)) {
		socketIo.to(player.id).emit('serverMessage', { action: ACTIONS.CALL_BELA, card: c });
		return;
	}

	room.curGame.putCardOnTable(card, player);
	socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.ACCEPT_CARD, username, card: c });
	socketIo.to(player.id).emit('serverMessage', { action: ACTIONS.SET_HAND, hand: player.hand, displayAll: true });

	if (room.curGame.nextTurn() !== room.curGame.firstToPlay) {
		socketIo.to(room.id).emit('serverMessage', {
			action: ACTIONS.PLAY_CARD,
			username: room.users[room.curGame.turn].username
		});
		return;
	}

	const points = evaluatePlay(room.curGame.cardsOnTable);
	const winner = room.users.indexOf(room.getUser(points.username));
	room.curGame.addCardPoints(points.value, player.hand.length === 0, winner);

	if (player.hand.length !== 0) {
		setTimeout(() => {
			socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.GAME_POINTS, gamePoints: room.curGame.points });
			room.curGame.firstToPlay = winner;
			room.curGame.turn = room.curGame.firstToPlay;
			room.curGame.cardsOnTable = [];
			socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.PLAY_CARD, username: points.username });
		}, 2000);
	} else {
		const message = room.curGame.endGame(room.users.map(u => u.username));
		if (message) {
			setTimeout(() => {
				socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.INFO, message });
				// TODO tu se nesto zbuga (s front strane - otvaranje dialoga i to? odabere se null adut, podijele se karte)
			}, 1000);
		}

		setTimeout(() => {
			room.match.updateMatchPoints();
			socketIo.to(room.id).emit('serverMessage', {
				action: ACTIONS.MATCH_POINTS,
				games: room.match.points,
				total: room.match.total
			});
			const matchWinner = room.match.endMatch(room.users.map(u => u.username));
			if (matchWinner) {
				setTimeout(() => {
					socketIo.to(room.id).emit('endMatch', matchWinner);
				}, 1000);
			} else {
				room.curGame = room.match.startNewGame(room.curGame.turnAfterDealer(room.capacity));
				room.curGame.firstToPlay = room.curGame.turnAfterDealer();
				room.users.forEach(u => {
					u.hand = room.curGame.dealCards();
					socketIo.to(u.id).emit('serverMessage', { action: ACTIONS.SET_HAND, hand: u.hand, displayAll: false });
				});
				socketIo.to(room.id).emit('serverMessage', {
					action: ACTIONS.CALL_TRUMP,
					username: room.users[room.curGame.turn].username,
					lastCall: false
				});
			}
		}, 2500);
	}
}

function calledBela(room: Room, c: string, called: boolean, username: string): void {
	if (called) {
		socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.INFO, message: 'BELA!' });
		const index = room.users.indexOf(room.getUser(username));
		room.curGame.addBelaPoints(index);
		socketIo.to(room.id).emit('serverMessage', { action: ACTIONS.GAME_POINTS, gamePoints: room.curGame.points });
	}
	playedCard(room, c, username);
}
