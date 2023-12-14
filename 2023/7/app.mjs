import { readFile } from 'fs/promises';

const input = await readFile('2023/7/input.txt', 'utf8');
const lines = input.split('\n');

const calcStatistic = cards => cards.reduce((acc, card) => ({...acc, [card]: (acc[card] ?? 0) + 1}), {});
// Types: 50..Five, 40..Four, 31..Full House, 30..Three, 21..Two Pairs, 20..One Pair, 10..One
const calcType = statistic => {
    const stat2 = calcStatistic(Object.values(statistic));
    if (stat2[5]) return 50;
    if (stat2[4]) return 40;
    if (stat2[3] && stat2[2]) return 31;
    if (stat2[3]) return 30;
    if (stat2[2]>= 2) return 21;
    if (stat2[2]) return 20;
    return 10;
};
const calcType2 = statistic => {
    const j = statistic.J ?? 0;
    const stat2 = calcStatistic(Object.values({...statistic, J: 0}));
    if (stat2[5 - j]) return 50;
    if (stat2[4 - j]) return 40;
    if ((j == 1 && stat2[2] >= 2) || stat2[3] && stat2[2]) return 31;
    if (stat2[3 - j]) return 30;
    if ((j == 1 && stat2[1] && stat2[2]) || stat2[2] >= 2) return 21;
    if (stat2[2 - j]) return 20;
    return 10;
};

const hands = lines.map(line => {

    const [cards, bid] = line.split(' ');
    const cardArray = cards.split('');
    const statistic = calcStatistic(cardArray);
    return {
        cards: cardArray,
        bid: parseInt(bid),
        type: calcType(statistic),
        type2: calcType2(statistic)
    };
});

const scoreMap = Object.fromEntries(['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'].reverse().map((v, ix) => [v, ix]));
const compareHands = (a, b) => {
    let diff = a.type - b.type;
    for (let ix = 0; diff === 0 && ix < a.cards.length; ix++)
        diff = scoreMap[a.cards[ix]] - scoreMap[b.cards[ix]];
    return diff;
};

hands.sort(compareHands);

const total = hands.reduce((acc, hand, ix) => acc + hand.bid * (ix + 1), 0);

console.log('Part 1:', total);

// Part 2

const scoreMap2 = Object.fromEntries(['A', 'K', 'Q', 'T', '9', '8', '7', '6', '5', '4', '3', '2', 'J'].reverse().map((v, ix) => [v, ix]));
const compareHands2 = (a, b) => {
    let diff = a.type2 - b.type2;
    for (let ix = 0; diff === 0 && ix < a.cards.length; ix++)
        diff = scoreMap2[a.cards[ix]] - scoreMap2[b.cards[ix]];
    return diff;
};

hands.sort(compareHands2);

const total2 = hands.reduce((acc, hand, ix) => acc + hand.bid * (ix + 1), 0);

console.log('Part 2:', total2);
