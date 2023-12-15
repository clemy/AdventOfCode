import { readFile } from 'fs/promises';

const input = await readFile('2023/15/input.txt', 'utf8');
const steps = input.split(',');

const hash = step => step.split('').reduce((acc, char) => ((acc + char.charCodeAt(0)) * 17) % 256, 0);

const sum = steps.reduce((acc, step) => acc + hash(step), 0);
console.log('Part 1:', sum);