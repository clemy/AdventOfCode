import { readFile } from 'fs/promises';

const input = await readFile('2023/9/input.txt', 'utf8');
const lines = input.split('\n');
const allValues = lines.map(line => line.split(' ').map(v => parseInt(v)));

const calcNext = values => {
    let factor = -1;
    return values.reduce((acc, v, ix) => {
        factor = -1 * factor * (values.length - ix) / (ix + 1); // Pascal's triangle
        return acc + factor * v;
    }, 0);
};

// Reverse iteration
const result = allValues.reduce((acc, values) => acc + calcNext(values.slice().reverse()), 0);
console.log('Part 1:', result);

// Part 2

// Forward iteration
const result2 = allValues.reduce((acc, values) => acc + calcNext(values), 0);
console.log('Part 2:', result2);