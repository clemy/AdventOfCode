import { readFile } from 'fs/promises';

const input = await readFile('2023/3/input.txt', 'utf8');
const data = input.split('\n');

const isMachinePart = (linenr, start, end) =>
    [-1, 0, 1].some((offset) => 
        (linenr + offset >= 0 && linenr + offset < data.length) &&
        data[linenr + offset].substring(start - 1, end + 2).match(/[^\d.]/) !== null
    );

const sum = data.reduce((accOuter, line, linenr) =>
    accOuter + [...line.matchAll(/\d+/g)].reduce((acc, match) =>
        acc + (isMachinePart(linenr, match.index, match.index + match[0].length - 1) ? parseInt(match[0]) : 0)
    , 0)
, 0);

console.log(sum);

// Part 2
const stars = {};

const searchStars = (linenr, start, end, value) => {
    [-1, 0, 1].forEach((offset) => {
        if ((linenr + offset < 0 || linenr + offset >= data.length))
            return;
        const sstart = Math.max(0, start - 1);
        const foundStars = data[linenr + offset].substring(sstart, end + 2).matchAll(/\*/g);
        for (const star of foundStars) {
            const prevStar = stars[`${linenr + offset},${star.index + sstart}`] ?? { count: 0, value: 1 };
            stars[`${linenr + offset},${star.index + sstart}`] = { count: prevStar.count + 1, value: prevStar.value * value };
        }
    });
};

data.forEach((line, linenr) => {
    const found = line.matchAll(/\d+/g);
    for (const match of found) {
        searchStars(linenr, match.index, match.index + match[0].length - 1, parseInt(match[0]));
    }
});

const gearRatioSum = Object.values(stars).reduce((acc, star) => acc + (star.count > 1 ? star.value : 0), 0);
console.log(gearRatioSum);
