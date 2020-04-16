import { Match } from './classes/Match';
import { Game } from './classes/Game';
import { Player } from './classes/Player';
import { getUsernames, getTeams, getPlayerTeam } from './functions/playerHelperFunctions';
import { evaluateScale } from './functions/evaluateScale';
import { evaluatePlay } from './functions/evaluatePlay';
import express from 'express';
import * as http from 'http';
import * as io from 'socket.io';

const connections: any[] = [];
let match: Match;
let curGame: Game;
const users: Player[] = [];



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
	socket.on('cardPlayed', (card: string) => {
		if (users.find(x => x.username === socket.username).checkBela(card)) {
			socketIo.emit('callBela', { username: socket.username, card });
		} else {
			cardPlayed(card, socket.username);
		}
	});
	socket.on('calledBela', (bela: any) => {
		if (bela.called) {
			calledBela(socket.username);
		}
		cardPlayed(bela.card, socket.username);
	});

	socket.on('userLeaves', (username: string) => userLeaves(username));
	socket.on('killedMatch', (username: string) => socketIo.emit('killMatch', username));
	socket.on('disconnect', () => disconnect(socket));
});


function connect(socket: any): void {
	if (connections.length === 0) {
		match = new Match();
		curGame = match.startNewGame();
	}
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);
}

function disconnect(socket: any): void {
	const i = users.indexOf(users.find(user => user.username === socket.username));
	if (i !== -1) {
		users.splice(i, 1);
	}
	connections.splice(connections.indexOf(socket), 1);
	console.log('Disconnected: %s sockets connected', connections.length);
}

function newUser(username: string): void {
	const user = new Player(username, curGame.dealCards());
	socketIo.emit('hand', { username, hand: user.getOnlyCardSigns(), display8: false });
	users.push(user);

	if (user.team === 'A') {
		match.teamA.users.push(user);
	} else {
		match.teamB.users.push(user);
	}

	if (users.length === 4) {
		socketIo.emit('updateUsers', { usernames: getUsernames(users), teams: getTeams(users) });
		setTimeout(() => {
			socketIo.emit('callTrump', { username: users[curGame.turn].username, lastCall: false });
		}, 2000);
	}
}

function calledTrump(trump: string, username: string): void {
	if (trump === '') {
		const turn = curGame.nextTurn();
		const lastCall = users[Game.dealer].username === users[turn].username;
		socketIo.emit('callTrump', { username: users[turn].username, lastCall });
		const player = users.find(x => x.username === username);
		player.sortHand();
		socketIo.emit('hand', { username: player.username, hand: player.getOnlyCardSigns(), display8: true });
	} else {
		curGame.setTrump({ sign: trump, team: getPlayerTeam(users, username) });
		curGame.setTrumpValues(users);
		socketIo.emit('setTrump', { trump, username });
		users.forEach(player => {
			socketIo.emit('hand', { username: player.username, hand: player.getOnlyCardSigns(), display8: true });
		});
		const turn = curGame.turnAfterDealer();
		socketIo.emit('callScale', users[turn].username);
	}
}

function calledScale(cards: string[], username: string): void {
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
				socketIo.emit('announceScale', { username, points: scale.points, bela: false });
			}
		}
		socketIo.emit('callScale', users[curGame.turn].username);
	} else {
		socketIo.emit('announceScale', { username, points: 0, bela: false });
		if (curGame.turn !== Game.dealer) {
			const turn = curGame.nextTurn();
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
			const turn = curGame.turnAfterDealer();
			socketIo.emit('playCard', users[turn].username);
		}
	}
}

function cardPlayed(card: string, username: string): void {
	const user = users.find(x => x.username === username);

	//TODO: add checks for accepting and denying card
	var isPlayValid = curGame.putCardOnTable(card, user);

	socketIo.emit('acceptCard', { username, card });
	socketIo.emit('hand', { username, hand: user.getOnlyCardSigns(), display8: true });

	if (curGame.nextTurn() === curGame.firstToPlay) {
		const points = evaluatePlay(curGame.cardsOnTable);
		if (user.hand.length === 0) {
			points.value += 10;
			if (!curGame.tookCardsA || !curGame.tookCardsB) {
				points.value += 90;
			}
		}

		const team = getPlayerTeam(users, points.username);
		if (team === 'A') {
			curGame.pointsA += points.value;
			curGame.tookCardsA = true;
		} else {
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
		} else {
			if (curGame.checkForFail()) {
				socketIo.emit('fail', curGame.trump.team);
			}
			setTimeout(() => {
				curGame = match.startNewGame();
				const matchPoints =  match.getMatchPoints();
				socketIo.emit('matchPoints', matchPoints);
				const winnerTeam = match.endMatch(matchPoints.total);
				if (winnerTeam) {
					setTimeout(() => {
						socketIo.emit('endMatch', winnerTeam);
					}, 1000);
				} else {
					users.forEach(u => {
						u.hand = curGame.dealCards();
						socketIo.emit('hand', { username: u.username, hand: u.getOnlyCardSigns(), display8: false });
					});
					socketIo.emit('callTrump', { username: users[curGame.turn].username, lastCall: false });
				}
			}, 2000);
		}
	} else {
		socketIo.emit('playCard', users[curGame.turn].username);
	}
}

function calledBela(username: string): void {
	socketIo.emit('announceScale', { username, points: 20, bela: true });
	const team = getPlayerTeam(users, username);
	if (team === 'A') {
		curGame.pointsA += 20;
	} else {
		curGame.pointsB += 20;
	}
	socketIo.emit('gamePoints', curGame.getGamePoints());
}

function userLeaves(username: string) {
	const i = users.indexOf(users.find(user => user.username === username));
	if (i !== -1) {
		users.splice(i, 1);
	}
	if (users.length === 0) {
		match = new Match();
		curGame = match.startNewGame();
	}
}
