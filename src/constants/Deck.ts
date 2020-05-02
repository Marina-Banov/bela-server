import { Card } from '../classes/Card';

export const DECK = {
	H7: new Card('H7', 0, 0),
	H8: new Card('H8', 0, 1),
	H9: new Card('H9', 0, 2),
	HX: new Card('HX', 10, 3),
	HJ: new Card('HJ', 2, 4),
	HQ: new Card('HQ', 3, 5),
	HK: new Card('HK', 4, 6),
	HA: new Card('HA', 11, 7),
	C7: new Card('C7', 0, 8),
	C8: new Card('C8', 0, 9),
	C9: new Card('C9', 0, 10),
	CX: new Card('CX', 10, 11),
	CJ: new Card('CJ', 2, 12),
	CQ: new Card('CQ', 3, 13),
	CK: new Card('CK', 4, 14),
	CA: new Card('CA', 11, 15),
	S7: new Card('S7', 0, 16),
	S8: new Card('S8', 0, 17),
	S9: new Card('S9', 0, 18),
	SX: new Card('SX', 10, 19),
	SJ: new Card('SJ', 2, 20),
	SQ: new Card('SQ', 3, 21),
	SK: new Card('SK', 4, 22),
	SA: new Card('SA', 11, 23),
	D7: new Card('D7', 0, 24),
	D8: new Card('D8', 0, 25),
	D9: new Card('D9', 0, 26),
	DX: new Card('DX', 10, 27),
	DJ: new Card('DJ', 2, 28),
	DQ: new Card('DQ', 3, 29),
	DK: new Card('DK', 4, 30),
	DA: new Card('DA', 11, 31)
};

export const DECK_SIGNS: string[] = [
	'H7', 'H8', 'H9', 'HX', 'HJ', 'HQ', 'HK', 'HA',
	'C7', 'C8', 'C9', 'CX', 'CJ', 'CQ', 'CK', 'CA',
	'S7', 'S8', 'S9', 'SX', 'SJ', 'SQ', 'SK', 'SA',
	'D7', 'D8', 'D9', 'DX', 'DJ', 'DQ', 'DK', 'DA'
];
