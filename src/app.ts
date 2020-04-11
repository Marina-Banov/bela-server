import { Match } from './classes/Match';
import { Game } from './classes/Game';
import { Player } from './classes/Player';
import { Card } from './classes/Card';
import { getPlayerTeam } from './functions/getPlayerTeam'
import { evaluateScale } from './functions/evaluateScale';
import { evaluatePlay } from './functions/evaluatePlay';
import express from 'express';
import * as http from 'http';
import * as io from 'socket.io';

let connections: any[] = [];
let match: Match;
let curGame: Game;
let users: Player[] = [];



const app = express();
app.get('/', (req, res) => res.send('<h1>Hello world</h1>'));

const httpServer = http.createServer(app);
const port = process.env.PORT || 80;
httpServer.listen(port, () => console.log('listening on *:', port));

const socketIo = io.listen(httpServer);
socketIo.on('connection', socket => {

	connect(socket);

	socket.on('newUser', (username: string) => {
		socket.username = username;
		newUser(username);
	});

	socket.on('calledTrump', (trump: string) => calledTrump(trump, socket.username));
	socket.on('calledScale', (cards: string[]) => calledScale(cards, socket.username));
	socket.on('cardPlayed', (card: Card) => cardPlayed(card, socket.username));

	socket.on('disconnect', () => disconnect(socket));
});


function connect(socket: any) {
	if (connections.length === 0) {
		match = new Match();
		curGame = match.startNewGame();
	}
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);
}

function disconnect(socket: any) {
	let i = users.indexOf(users.find(user => user.username === socket.username));
	if (i !== -1) {
		users.splice(i, 1);
	}
	connections.splice(connections.indexOf(socket), 1);
	console.log('Disconnected: %s sockets connected', connections.length);
}

function newUser(username: string) {
	let user = new Player(username, curGame.dealCards());
	socketIo.emit('hand', { username, hand: user.hand });
	users.push(user);

	if (user.team === 'A') {
		match.teamA.users.push(user);
	} else {
		match.teamB.users.push(user);
	}

	if (users.length < 4) {
		socketIo.emit('waiting');
	} else {
		socketIo.emit('updateUsers', users);
		let turn = curGame.turn;
		socketIo.emit('callTrump', { username: users[turn].username, lastCall: false });
	}
}

function calledTrump(trump: string, username: string) {
	if (trump === '') {
		let turn = curGame.nextTurn();
		let lastCall = users[Game.dealer].username === users[turn].username;
		socketIo.emit('callTrump', { username: users[turn].username, lastCall });
	} else {
		curGame.setTrump({ sign: trump, team: getPlayerTeam(users, username) });
		curGame.setTrumpValues(users);
		let turn = curGame.turnAfterDealer();
		socketIo.emit('setTrump', { username, users, trump });
		socketIo.emit('callScale', users[turn].username);
	}
}

function calledScale(cards: string[], username: string) {
	const curPriority = curGame.curScalePriority;

	if (cards.length > 0) {
		const scale = evaluateScale(cards);
		if (scale) {
			let announce = true;
			const s = { sign: scale.sign, points: scale.points, hand: cards, username };
			const team = getPlayerTeam(users, username);

			if (team === 'A') {
				announce = match.teamA.addScale(s, scale.priority, curPriority);
			} else {
				announce = match.teamB.addScale(s, scale.priority, curPriority);
			}

			if (announce) {
				socketIo.emit('announceScale', username + ' zove ' + scale.points + '!');
			}
		}
		socketIo.emit('callScale', users[curGame.turn].username);
	} else {
		socketIo.emit('announceScale', username + ' zove DALJE!');
		if (curGame.turn !== Game.dealer) {
			let turn = curGame.nextTurn();
	    	socketIo.emit('callScale', users[turn].username);
		} else {
			if (curPriority.team === 'A') {
				curGame.addScalePoints(match.teamA);
				socketIo.emit('showScales', match.teamA.getScales());
			} else if (curPriority.team === 'B') {
				curGame.addScalePoints(match.teamB);
				socketIo.emit('showScales', match.teamB.getScales());
			}
			socketIo.emit('gamePoints', curGame.getGamePoints());
			let turn = curGame.turnAfterDealer();
			socketIo.emit('playCard', users[turn].username);
		}
	}
}

function cardPlayed(card: Card, username: string) {
	let user = users.find(x => x.username === username);
	curGame.putCardOnTable(card, user);
	socketIo.emit('acceptCard', { username, card: card.sign });
	socketIo.emit('hand', { username, hand: user.hand });

	if (curGame.nextTurn() === curGame.firstToPlay) {
		const points = evaluatePlay(curGame.cardsOnTable);
		if (user.hand.length === 0) {
			points.value += 10;
		}

		const team = getPlayerTeam(users, points.username);
		if (team === 'A') {
			curGame.pointsA += points.value;
		} else {
			curGame.pointsB += points.value;
		}

		if (user.hand.length !== 0) {
			socketIo.emit('gamePoints', curGame.getGamePoints());
			curGame.firstToPlay = users.indexOf(users.find(x => x.username === points.username));
			curGame.turn = curGame.firstToPlay;
			curGame.cardsOnTable = [];
		} else {
			if (curGame.checkForFail()) {
				socketIo.emit('fail', curGame.trump.team);
			}
			curGame = match.startNewGame();
			for (let u of users) {
				u.hand = curGame.dealCards();
				socketIo.emit('hand', { username: u.username, hand: user.hand });
			}
			socketIo.emit('matchPoints', match.getMatchPoints());
			socketIo.emit('callTrump', { username: users[curGame.turn].username, lastCall: false });
		}
	}
	socketIo.emit('playCard', users[curGame.turn].username);
}