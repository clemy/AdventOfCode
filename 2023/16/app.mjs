import { readFile } from 'fs/promises';

const input = await readFile('2023/16/input.txt', 'utf8');
const matrix = input.split('\n').map(line=> line.split(''));

const width = matrix[0].length;
const height = matrix.length;

const UP = 1;
const DOWN = 2;
const LEFT = 4;
const RIGHT = 8;

const getActivatedCount = (startX, startY, startDir) => {
    const activated = new Array(width * height).fill(0);

    const dirToOffset = dir => {
        if (dir === UP) return { x: 0, y: -1 };
        if (dir === DOWN) return { x: 0, y: 1 };
        if (dir === LEFT) return { x: -1, y: 0 };
        if (dir === RIGHT) return { x: 1, y: 0 };
    };

    const followPath = (x, y, dir) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return;
        
        if (activated[y * width + x] & dir) return;
        activated[y * width + x] |= dir;

        const offset = dirToOffset(dir);
        switch (matrix[y][x]) {
            case '.':            
                followPath(x + offset.x, y + offset.y, dir);
                break;

            case '/':
                if (dir === UP) followPath(x + 1, y, RIGHT);
                if (dir === DOWN) followPath(x - 1, y, LEFT);
                if (dir === LEFT) followPath(x, y + 1, DOWN);
                if (dir === RIGHT) followPath(x, y - 1, UP);
                break;
            
            case '\\':
                if (dir === UP) followPath(x - 1, y, LEFT);
                if (dir === DOWN) followPath(x + 1, y, RIGHT);
                if (dir === LEFT) followPath(x, y - 1, UP);
                if (dir === RIGHT) followPath(x, y + 1, DOWN);
                break;
            
            case '-':
                if (dir === LEFT) followPath(x - 1, y, LEFT);
                if (dir === RIGHT) followPath(x + 1, y, RIGHT);
                if (dir === UP || dir === DOWN) {
                    followPath(x - 1, y, LEFT);
                    followPath(x + 1, y, RIGHT);
                }
                break;
        
            case '|':
                if (dir === UP) followPath(x, y - 1, UP);
                if (dir === DOWN) followPath(x, y + 1, DOWN);
                if (dir === LEFT || dir === RIGHT) {
                    followPath(x, y - 1, UP);
                    followPath(x, y + 1, DOWN);
                }
                break;
        }
    };

    followPath(startX, startY, startDir);
    return activated.reduce((sum, value) => sum + (value ? 1 : 0), 0);
};

console.log('Part 1:', getActivatedCount(0, 0, RIGHT));

// Part 2

let maxEnergy = 0;
for (let y = 0; y < height; y++) {
    maxEnergy = Math.max(maxEnergy, getActivatedCount(0, y, RIGHT));
    maxEnergy = Math.max(maxEnergy, getActivatedCount(width - 1, y, LEFT));
}
for (let x = 0; x < width; x++) {
    maxEnergy = Math.max(maxEnergy, getActivatedCount(x, 0, DOWN));
    maxEnergy = Math.max(maxEnergy, getActivatedCount(x, height - 1, UP));
}

console.log('Part 2:', maxEnergy);