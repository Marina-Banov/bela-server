export enum ACTIONS {
  ACCEPT_CARD = 'ACCEPT_CARD',
  ANNOUNCE_SCALE = 'ANNOUNCE_SCALE',
  ARRANGE_USERS = 'ARRANGE_USERS',
  CALL_BELA = 'CALL_BELA',
  CALLED_BELA = 'CALLED_BELA',
  CALL_SCALE = 'CALL_SCALE',
  CALLED_SCALE = 'CALLED_SCALE',
  CALL_TRUMP = 'CALL_TRUMP',
  CALLED_TRUMP = 'CALLED_TRUMP',
  DISCARDED = 'DISCARDED',
  GAME_POINTS = 'GAME_POINTS',
  INFO = 'INFO',
  INFO_WAITING = 'INFO_WAITING',
  JOIN_ROOM = 'JOIN_ROOM',
  KILLED_MATCH = 'KILLED_MATCH',
  MATCH_POINTS = 'MATCH_POINTS',
  NO_ROOM = 'NO_ROOM',
  PLAY_CARD = 'PLAY_CARD',
  PLAYED_CARD = 'PLAYED_CARD',
  REORDER_PLAYERS = 'REORDER_PLAYERS',
  SET_HAND = 'SET_HAND',
  SET_TRUMP = 'SET_TRUMP',
  SHOW_SCALES = 'SHOW_SCALES',
  UPDATE_USERS = 'UPDATE_USERS'
}

export class ClientMessage {
  action: ACTIONS;
  username: string;
  usernames: string[];
  roomId: string;
  roomCapacity: number;
  hand: any;
  trump: string;
  cards: string[];
  card: string;
  called: boolean;
}
