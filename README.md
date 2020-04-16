# Bela server

[![Deploy on Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## socket.io events emitted by the server

- hand  
data: { username: string, hand: string[], display8: boolean }  
description: data.hand is the set of 8 card codes assigned to player with data.username. data.display8 indicates whether frontend should display all 8 cards. Emitted at the beginning of every game and after trump is set.

- updateUsernames  
data: { usernames: string[], teams: { A: string[], B: string[] } }  
description: Emitted once all the players have joined the game room.

- callTrump  
data: { username: string, lastCall: boolean }  
description: data.username indicates the player whose turn it is to call the trump. If data.lastCall is true, the player shouldn't return empty string.

- setTrump  
data: { trump: string, username: string }  
description: data.username and data.trump indicate which player set the trump. Emitted as soon as any of the players sets the trump.

- callScale  
data: string  
description: data is the username of player whose turn it is to call a scale.

- announceScale  
data: { username: string, points: number, bela: boolean }  
description: data.username and data.points indicates which username announced which scale. data.bela indicates whether it's a bela scale.

- showScales  
data: [{ hand: string[], username: string }]  
description: data is the set of accepted scales that belong to the team with highest scale priority.

- callBela  
data: { username: string, card: string }
description: emitted if the player with data.username has the possibility of calling the bela scale.

- gamePoints  
data: { A: number, B: number }  
description: data.A is the number of points team 'A' scored during the current game, data.B is the number of points team 'B' scored during the current game.

- matchPoints  
data: { games: [{ A: number, B: number }], total: { A: number, B: number }}  
description: the first element of data.games is the result of the most recent game played.

- playCard  
data: string  
description: data is the username of player whose turn it is to play a card.

- cardNotAllowed  
data: string  
description: data is the username of player who chose an illegal card move.

- acceptCard  
data: { username: string, card: string }  
description: data.username and data.card indicate which player played the card.

- fail  
data: string  
description: data is the name of team that failed to score the minimum number of points needed.

- endMatch  
data: string  
description: data is the name of the team that won the match.

- killMatch  
data: string  
description: data is the username of the player that refused to join the second match and therefore all players should be kicked out of the game room.
