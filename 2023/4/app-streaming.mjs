// Streaming variant capable of handling large input files

import * as fs from 'fs';
import * as readline from 'node:readline/promises';

/* generator function for transformation of async iterable streams */
async function* AsyncIteratorMap(iterator, callbackfn) {
    for await (const element of iterator) {
        yield callbackfn(element);
    }
};

/* reduce function for async iterable streams */
async function AsyncIteratorReduce(iterator, callbackfn, initialValue) {    
    let acc = initialValue;
    for await (const element of iterator) {
        acc = callbackfn(acc, element);
    }
    return acc;
};

// open file for streaming and line retrieval
const file = readline.createInterface({
    input: fs.createReadStream('2023/4/input.txt', 'utf8'),
    crlfDelay: Infinity
});

// transform into cards
const cards = AsyncIteratorMap(file, line => {
    const cardData = line.match(/^Card +(\d+): ([\d ]+) \| ([\d ]+)/);
    const parseNumbers = text => text.split(/ +/).map(num => parseInt(num));
    return {
        id: parseInt(cardData[1]),
        winning: new Set(parseNumbers(cardData[2])),
        own: new Set(parseNumbers(cardData[3]))
    };
});

// add the count of winning numbers
const cardsWithWinnerCnt = AsyncIteratorMap(cards, card => ({
    ...card,
    winnerCnt: [...card.winning].reduce((acc, w) => acc + (card.own.has(w) ? 1 : 0), 0)
}));

// add the score (Part 1) for each card
const cardsWithScores = AsyncIteratorMap(cardsWithWinnerCnt, card =>({
    ...card,
    score: Math.floor(2 ** (card.winnerCnt - 1))
}));

// add the final copies of each card (Part 2)
//   streaming optimized version:
//   this uses a sliding window of pending copies for future cards
const slidingCopyCount = [];
const cardsWithCopyCount = AsyncIteratorMap(cardsWithScores, card => {
    const newCard = {
        ...card,
        copies: 1 + (slidingCopyCount.shift() ?? 0)
    };
    for (let x = 0; x < newCard.winnerCnt; x++) {
        slidingCopyCount[x] = (slidingCopyCount[x] ?? 0) + newCard.copies;
    }
    return newCard;
});

// get result counts for Part 1: score and Part2: cnt
const {score, cnt} = await AsyncIteratorReduce(cardsWithCopyCount, ({score, cnt}, card) => ({
    score: score + card.score,
    cnt: cnt + card.copies
}), {score: 0, cnt: 0});

// print the results
console.log("Part 1:", score);
console.log("Part 2:", cnt);
