import { readFile } from 'fs/promises';

const input = await readFile('2023/15/input.txt', 'utf8');
const steps = input.split(',');

const hash = step => step.split('').reduce((acc, char) => ((acc + char.charCodeAt(0)) * 17) % 256, 0);

const sum1 = steps.reduce((acc, step) => acc + hash(step), 0);
console.log('Part 1:', sum1);

// Part 2

const boxes = [... new Array(256)].map(() => new Map());
const updateBox = command => {
    const [, label, cmd, focal] = command.match(/^([a-z]+)([=-])(\d?)$/);
    const h = hash(label);
    switch (cmd) {
        case '=':
            boxes[h].set(label, parseInt(focal));
            break;

        case '-':
            boxes[h].delete(label);
            break;
    }
};
steps.forEach(updateBox);

const sum2 = boxes.reduce((acc, box, boxnr) =>
    acc + [...box.values()].reduce((acc2, focal, lensnr) =>
        acc2 + (boxnr + 1) * (lensnr + 1) * focal,
    0),
0);

console.log('Part 2:', sum2);
