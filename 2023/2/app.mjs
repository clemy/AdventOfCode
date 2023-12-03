import { readFile } from 'fs/promises';
import peggy from 'peggy';

const parserSrc = await readFile('2023/2/parser.pegjs', 'utf8');
const parser = peggy.generate(parserSrc);
const input = await readFile('2023/2/input.txt', 'utf8');
const games = parser.parse(input);
const filtered = games.filter(game => game.maxDraw.red <= 12 && game.maxDraw.green <= 13 && game.maxDraw.blue <= 14);
const sumid = filtered.map(game => game.nr).reduce((a, b) => a + b);
console.log(sumid);

// Part 2
const mins = games.map(game => game.maxDraw.red * game.maxDraw.green * game.maxDraw.blue);
console.log(mins.reduce((a, b) => a + b));
