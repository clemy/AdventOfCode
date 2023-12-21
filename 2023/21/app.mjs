import { readFile } from 'fs/promises';

const input = await readFile('2023/21/input.txt', 'utf8');
const map = input.split('\n').map((line) => line.split(''));
const width = map[0].length;
const height = map.length;

const fromPos = (pos) => pos.split(',').map((n) => parseInt(n, 10));
const toPos = (x, y) => `${x},${y}`;

let startPos;
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        if (map[y][x] === 'S') {
            startPos = toPos(x, y);
            map[y][x] = '.';
        }
    }
}

const positiveMod = (n, m) => ((n % m) + m) % m;

const getNeighbors = (pos) => {
    const [x, y] = fromPos(pos);
    const neighbors = [];
    [[-1, 0], [0, -1], [1, 0], [0, 1]].map(([dx, dy]) => {
        if (map[positiveMod(y + dy, height)][positiveMod(x + dx, width)] === '.') {
            neighbors.push(toPos(x + dx, y + dy));
        }
    });
    return neighbors;
};

let currentNodes = new Set([startPos]);
const iterate = (n) => {
    for (let i = 0; i < n; i++) {
        const nextNodes = new Set();
        currentNodes.forEach((node) => {
            getNeighbors(node).forEach((neighbor) => {
                nextNodes.add(neighbor);
            });
        });
        currentNodes = nextNodes;
    }
    return currentNodes.size;
};

let currentIterations = 64;
console.log('Part 1:', iterate(currentIterations));

// Part 2
// find the target value with quadratic interpolation over:
//   0.5 * width, 1.5 * width, 2.5 * width

let n = Math.floor(width / 2);
const points = [];
while (points.length < 3) {
    points.push([n, iterate(n - currentIterations)]);
    currentIterations = n;
    n += width;
}

const interpolate = (x) => {
    const [x1, y1] = points[0];
    const [x2, y2] = points[1];
    const [x3, y3] = points[2];
    // https://en.wikipedia.org/wiki/Lagrange_polynomial
    return y1 * (x - x2) * (x - x3) / ((x1 - x2) * (x1 - x3)) +
           y2 * (x - x1) * (x - x3) / ((x2 - x1) * (x2 - x3)) +
           y3 * (x - x1) * (x - x2) / ((x3 - x1) * (x3 - x2));
};

console.log('Part 2:', interpolate(26501365));