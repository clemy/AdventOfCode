import { readFile } from 'fs/promises';

const input = await readFile('2023/18/input.txt', 'utf8');

const getOffset = dir => {
    switch (dir) {
        case 'U':
            return { x: 0, y: -1 };
        case 'D':
            return { x: 0, y: 1 };
        case 'L':
            return { x: -1, y: 0 };
        case 'R':
            return { x: 1, y: 0 };
    }
};

const getFilledArea = commands => {
    let pos = { x: 0, y: 0 };
    let circumference = 0;
    const corners = [];
    commands.forEach((cmd, ix) => {
        const offset = getOffset(cmd.dir);
        pos.x += offset.x * cmd.steps;
        pos.y += offset.y * cmd.steps;
        circumference += cmd.steps;
        corners.push({ ...pos }); // push copy
    });

    // https://en.wikipedia.org/wiki/Shoelace_formula
    const area = Math.abs(corners.reduce((acc, { x, y }, ix) =>
        acc + x * corners[(ix + 1) % corners.length].y - y * corners[(ix + 1) % corners.length].x, 0) / 2);

    // https://en.wikipedia.org/wiki/Pick%27s_theorem
    const interiorPoints = area - circumference / 2 + 1;

    return circumference + interiorPoints;
};

const commands1 = input.split('\n').map(line => {
    const matches = line.match(/^([UDLR]) (\d+) \(#([\da-f]{6})\)$/);
    return { dir: matches[1], steps: parseInt(matches[2]) };
});

console.log('Part 1:', getFilledArea(commands1));

// Part 2

const commands2 = input.split('\n').map(line => {
    const matches = line.match(/^([UDLR]) (\d+) \(#([\da-f]{5})([0-3])\)$/);
    const DIRCODES = "RDLU";
    return { dir: DIRCODES[matches[4]], steps: parseInt(matches[3], 16) };
});

console.log('Part 2:', getFilledArea(commands2));
