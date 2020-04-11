import { Player } from '../classes/Player';

export function getPlayerTeam(users: Player[], username: string) {
	return users.find(x => x.username === username).team;
}