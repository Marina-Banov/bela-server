import { Player } from './Player';
import { Match3 } from './Match3';
import { Match4 } from './Match4';
import { Card } from './Card';

export class Room {
    id: string;
    capacity: number;
    users: Player[];
    match: any;
    curGame: any;

    constructor(id: string, capacity: number) {
        this.id = id;
        this.capacity = capacity;
        this.users = [];
        this.match = (capacity === 3) ? new Match3() : new Match4();
        this.curGame = this.match.startNewGame(capacity-1);
        this.curGame.firstToPlay = this.curGame.turnAfterDealer();
    }

    userJoin(username: string, id: string, hand: Card[]): Player {
        if (this.users.length === this.capacity) {
            return null;
        }
        if (!hand) {
            hand = this.curGame.dealCards()
        }
        const user = new Player(id, username, hand);
        this.users.push(user);
        return user;
    }

    getUser(username: string): Player {
        return this.users.find(user => user.username === username);
    }

    userLeave(username: string): Player {
        const index = this.users.findIndex(user => user.username === username);

        if (index !== -1) {
            return this.users.splice(index, 1)[0];
        }
    }
}
