// Classical approach loading the whole file in memory

import { readFile } from 'fs/promises';

const input = await readFile('2023/4/input.txt', 'utf8');
const data = input.split('\n');

const cards = data.map(line => {
    const cardData = line.match(/^Card +(\d+): ([\d ]+) \| ([\d ]+)/);
    const parseNumbers = text => text.split(/ +/).map(num => parseInt(num));
    return {
        id: parseInt(cardData[1]),
        winning: new Set(parseNumbers(cardData[2])),
        own: new Set(parseNumbers(cardData[3])),
        copies: 1,
    };
});

const cardsWithWinnerCnt = cards.map(card => ({...card, winnerCnt: [...card.winning].reduce((acc, w) => acc + (card.own.has(w) ? 1 : 0), 0)}));
const scores = cardsWithWinnerCnt.map(({winnerCnt}) => Math.floor(2 ** (winnerCnt - 1)));
const scoreSum = scores.reduce((acc, s) => acc + s, 0);
console.log(scoreSum);

// Part 2

for (const card of cardsWithWinnerCnt)
{
    cardsWithWinnerCnt.slice(card.id, card.id + card.winnerCnt).forEach(dupCard => dupCard.copies += card.copies);
}

const copiesSum = cardsWithWinnerCnt.reduce((acc, c) => acc + c.copies, 0);
console.log(copiesSum);
