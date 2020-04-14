import { Player } from '../classes/Player';

export function getUsernames(users: Player[]): string[] {
	const usernames = [];
	users.forEach(u => {
		usernames.push(u.username);
	});
	return usernames;
}

export function getTeams(users: Player[]): any {
	const teams = {
		A: [],
		B: []
	};
	users.forEach(u => {
		if (u.team === 'A') {
			teams.A.push(u.username);
		} else {
			teams.B.push(u.username);
		}
	});
	return teams;
}

export function getPlayerTeam(users: Player[], username: string): string {
	return users.find(x => x.username === username).team;
}
