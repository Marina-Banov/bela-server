# Bela server

[![Deploy on Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## socket.io events emitted BY the server

- hand  
data: { username: string, hand: Card[] }  
description: data.hand is the set of 8 cards assigned to player with data.username. Emitted as soon as the player joins the game room.

- waiting  
data: none  
description: Emitted while waiting for more players.

- updateUsers  
data: Player[]  
description: Emitted once all the players have joined the game room.

- callTrump  
data: { username: string, lastCall: boolean }  
description: data.username indicates the player whose turn it is to call the trump. If data.lastCall is true, the player shouldn't return empty string.

- setTrump  
data: { username: string, users: Player[], trump: string }  
description: data.username and data.trump indicate which player set the trump. data.users contains the updated card values for all the players. Emitted as soon as any of the players sets the trump.

- callScale  
data: string  
description: data is the username of player whose turn it is to call a scale.

- announceScale  
data: string  
description: data is a message to be displayed on the frontend containing username and scale points the player announced.

- showScales  
data: [{ hand: string[], username: string }]  
description:

- matchPoints  
data: { games: [{ A: number, B: number }], total: { A: number, B: number }}  
description: the first element of data.games is the result of the most recent game played.

- gamePoints  
data: { A: number, B: number }  
description: