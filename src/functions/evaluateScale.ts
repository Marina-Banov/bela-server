import { Scale } from '../classes/Scale';
import { SAMESIES, IN_A_ROW, COUNT_IN_A_ROW_LARGEST } from '../constants/Scales';
import { DECK, DECK_SIGNS } from '../constants/Deck';

export function evaluateScale(cards: string[]): Scale {
	let scale = null;

	// ako su 4 iste vrste
	if (cards.length === 4 && cards[0][1] !== '7' && cards[0][1] !== '8' && cards.every( x => x.includes(cards[0][1]) )) {
		scale = JSON.parse(JSON.stringify(SAMESIES.find(x => x.sign === cards[0][1])));
	}

	// ako su sve u istoj boji
	if (cards.every( x => x.includes(cards[0][0]) )) {
		const IN_A_ROW_LARGEST = JSON.parse(JSON.stringify(COUNT_IN_A_ROW_LARGEST));

		cards.forEach(c => {
			const key = '-upto-' + c[1];
			IN_A_ROW_LARGEST[key].value = true;
		});

		let found = false;
		let largest = null;
		let count = 0;
		for (const key of Object.keys(IN_A_ROW_LARGEST)) {
			if (IN_A_ROW_LARGEST[key].value) {
				largest = key;
				count++;

				if (!found)
					found = true;
			} else {
				if (found)
					break;
			}
		}

		if (count >= 3) {
			scale = JSON.parse(JSON.stringify(IN_A_ROW.find(x => parseInt(x.sign[6], 10) === count)));
			scale.sign = cards[0][0] + '-' + scale.sign + largest;
			scale.priority += IN_A_ROW_LARGEST[largest].priority;
		}
	}
	return scale;
}

export function evaluateScale2(cards: number[]): Scale[] {
	const scales = [];

	// ako su 4 iste vrste
	const colorTypeMap = [...Array(4)].map(e => Array(8).fill(false));

	cards.forEach(x => {
		const cardType = x & 7;
		const cardColor = x >> 3 & 3;
		colorTypeMap[cardColor][cardType] = true;
	});

	const inARow = Array(4).fill(0);

	const IN_A_ROW_LARGEST = JSON.parse(JSON.stringify(COUNT_IN_A_ROW_LARGEST));
	// check for scales up to A
	const scalesInternal = [];
	for (let t = 0; t < 8; t++) {
		let curTypeColors = 0;
		for (let c = 0; c < 4; c++) {
			if (colorTypeMap[c][t]) {
				inARow[c]++;
				curTypeColors++;
			} else {
				if (inARow[c] >= 3) {
					const curScale = JSON.parse(JSON.stringify(IN_A_ROW[6 - inARow[c] + 2]));
					curScale.sign = DECK_SIGNS[c << 3][0] + '-' + curScale.sign + IN_A_ROW_LARGEST[t-1].sign;
					curScale.priority += IN_A_ROW_LARGEST[t].priority;
					scales.push(curScale);
					scalesInternal.push({ count: inARow[c], top: t - 1, color: c});
				}
				inARow[c] = 0;
			}
		}
		if (curTypeColors === 4) {
			const curScale = JSON.parse(JSON.stringify(SAMESIES.find(x => x.sign === DECK_SIGNS[t][1])));
			scales.push(curScale);
			scalesInternal.push({ count: 420, top: t, color: 0});
		}
	}

	// loop above wont take care of scales that include A so it needs to be fixed by this for
	for (let c = 0; c < 4; c++) {
		if (inARow[c] >= 3) {
			const curScale = JSON.parse(JSON.stringify(IN_A_ROW[6 - inARow[c] + 2]));
			curScale.sign = DECK_SIGNS[c << 3][0] + '-' + curScale.sign + '-upto-A';
			curScale.priority += IN_A_ROW_LARGEST[7].priority;
			scales.push(curScale);
			scalesInternal.push({ count: inARow[c], top: 7, color: c});
		}
	}

	for (let c = 0; c < cards.length; c++)
	{
		let cardInRange = false;
		for (let i = 0; i < scalesInternal.length; i++)
		{
			const cardType = cards[c] & 7;
			const cardColor = cards[c] >> 3 & 3;
			if (scalesInternal[i].count > 8)
			{
				if (cardType === scalesInternal[i].top)
				{
					cardInRange = true;
					break;
				}
			}
			else
			{
				const firstCard = scalesInternal[i].top - scalesInternal[i].count + 1;
				if (cardColor == scalesInternal[i].color && cardType >= firstCard && cardType <= scalesInternal[i].top)
				{
					cardInRange = true;
					break;
				}
			}
		}
		if (!cardInRange)
			return null;
	}

	return scales;
}
