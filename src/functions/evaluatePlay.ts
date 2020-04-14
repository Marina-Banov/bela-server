export function evaluatePlay(cardsOnTable: any[]): any {
	let value = 0;
	cardsOnTable.forEach(x => value += x.card.points);

	let strongest = cardsOnTable[0];
	const playColor = strongest.card.sign[0];
	for (let i = 1; i < 4; i++) {
		const card = cardsOnTable[i].card;

		if (strongest.card.trump && !card.trump) {
			continue;
		}

		if (!strongest.card.trump && card.trump) {
			strongest = cardsOnTable[i];
		}

		if (strongest.card.trump && card.trump) {
			if (strongest.card.points > card.points) {
				continue;
			}
			if (strongest.card.points < card.points) {
				strongest = cardsOnTable[i];
			} else {
				strongest = (strongest.card.sign[1] > card.sign[1]) ? strongest : cardsOnTable[i];
			}
		}

		if (!strongest.card.trump && !card.trump) {
			if (card.sign[0] !== playColor) {
				continue;
			}
			if (strongest.card.points > card.points) {
				continue;
			}
			if (strongest.card.points < card.points) {
				strongest = cardsOnTable[i];
			} else {
				strongest = (strongest.card.sign[1] > card.sign[1]) ? strongest : cardsOnTable[i];
			}
		}
	}

	return { value, username: strongest.username };
}
