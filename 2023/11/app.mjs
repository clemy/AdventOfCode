import { readFile } from 'fs/promises';

const input = await readFile('2023/11/input.txt', 'utf8');
const galaxies = input.split('\n').reduce((acc, line, y) => [...acc, ...line.split('').reduce((acc2, ch, x) => ch === '#' ? [...acc2, {x, y}] : acc2, [])], []);
const expandUniverse = (universe, direction, factor = 2) => {
    let last = 0;
    let offset = 0;
    universe.forEach(galaxy => {
        offset += Math.max(0, galaxy[direction] - last - 1) * (factor - 1);
        last = galaxy[direction];
        galaxy[direction] += offset;
    });    
};
expandUniverse(galaxies, 'y');
galaxies.sort((a, b) => a.x - b.x);
expandUniverse(galaxies, 'x');

const sum = galaxies.reduce((acc, g1, ix) =>
    acc + galaxies.slice(ix + 1).reduce((acc2, g2) => acc2 + Math.abs(g2.x - g1.x) + Math.abs(g2.y - g1.y), 0), 0);

console.log('Part 1:', sum);

// Part 2:
const galaxies2 = input.split('\n').reduce((acc, line, y) => [...acc, ...line.split('').reduce((acc2, ch, x) => ch === '#' ? [...acc2, {x, y}] : acc2, [])], []);
const factor = 1000000;
expandUniverse(galaxies2, 'y', factor);
galaxies2.sort((a, b) => a.x - b.x);
expandUniverse(galaxies2, 'x', factor);

const sum2 = galaxies2.reduce((acc, g1, ix) =>
    acc + galaxies2.slice(ix + 1).reduce((acc2, g2) => acc2 + Math.abs(g2.x - g1.x) + Math.abs(g2.y - g1.y), 0), 0);

console.log('Part 2', sum2);
