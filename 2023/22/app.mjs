import { readFile } from 'fs/promises';

// read and convert data
const input = await readFile('2023/22/input.txt', 'utf8');
let max = { x: -Infinity, y: -Infinity };
const bricks = input.split('\n').map((line) => {
    const [_, x1, y1, z1, x2, y2, z2] = line.match(/(\d+),(\d+),(\d+)~(\d+),(\d+),(\d+)/).map(Number);

    // check assumptions
    if (Math.min(x1, y1, z1, x2, y2, z2) < 0)
        throw new Error(`Invalid brick, negative coordinate ${line}`);
    if (x1 > x2 || y1 > y2 || z1 > z2)
        throw new Error(`Invalid brick, wrong size order ${line}`);
    if ((x1 !== x2 && y1 !== y2) || (x1 !== x2 && z1 !== z2) || (y1 !== y2 && z1 !== z2))
        throw new Error(`Invalid brick, not line ${line}`);

    max.x = Math.max(max.x, x2);
    max.y = Math.max(max.y, y2);
    return { a: { x: x1, y: y1, z: z1 }, b: { x: x2, y: y2, z: z2 } };
});
const size = { x: max.x + 1, y: max.y + 1 };

// sort the bricks by bottom border
bricks.sort((a, b) => a.a.z - b.a.z);

// array for storing the highest block for each x,y field while building the tower
const topView = new Array(size.x * size.y).fill(null);

const handleBrick = (brickIx) => {
    const brick = bricks[brickIx];
    const { a, b } = brick;
    let finalBrickBottom = 1;
    let supporters = new Set();
    for (let x = a.x; x <= b.x; x++) {
        for (let y = a.y; y <= b.y; y++) {
            const brickBelowIx = topView[x + y * size.x];
            if (brickBelowIx !== null) {
                const ownCubeBottom = bricks[brickBelowIx].finalTop + 1;
                //console.log(`Brick ${brickIx} overlaps with ${brickBelowIx} at ${x},${y},${ownCubeBottom}`);
                if (ownCubeBottom > finalBrickBottom) {
                    finalBrickBottom = ownCubeBottom;
                    supporters.clear();
                }
                if (ownCubeBottom === finalBrickBottom) {
                    supporters.add(brickBelowIx);
                }
            }
            topView[x + y * size.x] = brickIx;
        }
    }
    brick.finalTop = finalBrickBottom + brick.b.z - brick.a.z;
    brick.supporters = [...supporters];
};

// build the tower including support information (O(brickCnt * maxBrickLengthInXY))
bricks.forEach((_, ix) => handleBrick(ix));

// Part 1

// O(brickCnt)
bricks.filter((b) => b.supporters.length === 1).forEach((b) => bricks[b.supporters[0]].important = true);
const unImportantBlocks = bricks.filter((b) => !b.important);
console.log('Part 1:', unImportantBlocks.length);

// Part 2

const countBricksToFall = (brickIx) => {
    const fallingBricks = new Set([brickIx]);
    // one iteration is enough, as supporters are always earlier in the array
    bricks.forEach((testBrick, testBrickIx) => {
        if (testBrick.supporters.length === 0) // ground
            return;
        if(testBrick.supporters.some((supporter) => !fallingBricks.has(supporter)))
            return;
        fallingBricks.add(testBrickIx);
    });
    return fallingBricks.size - 1;
};

// O(brickCnt^2)
const sumBricksToFall = bricks.reduce((acc, _, ix) => acc + countBricksToFall(ix), 0);
console.log('Part 2:', sumBricksToFall);
