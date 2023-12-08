import { readFile } from 'fs/promises';

const input = await readFile('2023/8/input.txt', 'utf8');
const lines = input.split('\n');

const instructions = lines[0].split('');

const map = Object.fromEntries(lines.slice(2).map((line) => {
    const matches = line.match(/(\w{3}) = \((\w{3}), (\w{3})\)/);
    return [matches[1],{left: matches[2], right: matches[3]}];
}));

const findStepCount = (pos, end) => {
    let ix = 0;
    let count = 0;
    while (!pos.match(end)) {
        pos = instructions[ix] === 'L' ? map[pos].left : map[pos].right;
        ix = (ix + 1) % instructions.length;
        count++;
    }
    return count;
};

console.log('Part 1:', findStepCount('AAA', 'ZZZ'));

// Part 2

let startArray = Object.keys(map).filter(key => key[2] === 'A');
const steps = startArray.map(pos => findStepCount(pos, /\w{2}Z/));

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const lcm = (a, b) => a * b / gcd(a, b);

const totalSteps = steps.reduce(lcm);

console.log('Part 2:', totalSteps);
