import { Card } from '../classes/Card';

export function isPlayValid(card: Card, playerHand: Card[], cardsOnTable: Card[]): boolean {
    if (cardsOnTable.length === 0) {
        return true;
    }

    // if player is not first

    const cutWithTrump = !!cardsOnTable.find(x => x.trump && x !== cardsOnTable[0]);
    const playColor = cardsOnTable[0].sign[0];
    const cardsOfSameColor = playerHand.filter(x => x.sign[0] === playColor);

    if (cardsOfSameColor.length > 0) {
        if (card.sign[0] !== playColor) {
            // the player must play the card of the same color as the first card
            return false;
        } else if (cutWithTrump) {
            return true;
        }

        const highest = Math.max.apply(Math, cardsOfSameColor.map(x => x.points));
        return compareWithRelevantArray(card, cardsOnTable.filter(x => x.sign[0] === playColor), highest);
    }

    const trumpCards = playerHand.filter(x => x.trump);

    if (trumpCards.length > 0) {
        if (!card.trump) {
            // player must play trump
            return false;
        } else if (!cutWithTrump) {
            // allow any trump to be played if there is no other trump already played
            return true;
        }

        const highest = Math.max.apply(Math, trumpCards.map(x => x.points));
        return compareWithRelevantArray(card, cardsOnTable.filter(x => x.trump), highest);
    }

    return true;
}

function compareWithRelevantArray(card: Card, array: Card[], highest: number): boolean {
    let maxPoints = array[0].points;
    let maxScalePrio = array[0].scalePriority;
    for (let i = 1; i < array.length; i++) {
        if (array[i].points > maxPoints) {
            maxPoints = array[i].points;
            maxScalePrio = array[i].scalePriority;
        }
    }

    // play is valid if it's more valuable than most valuable card or if the player doesn't have a more valuable card
    return ((card.points > maxPoints || card.points === maxPoints && card.scalePriority > maxScalePrio)
        || card.points <= maxPoints && highest <= maxPoints);
}
