import { readFile } from 'fs/promises';

const input = await readFile('2023/17/input.txt', 'utf8');
const matrix = input.split('\n').map(line=> line.split('').map(c => parseInt(c)));

const width = matrix[0].length;
const height = matrix.length;

const LEFT = 1;
const RIGHT = 2;
const UP = 3;
const DOWN = 4;

const DIRCHARS = ['<', '>', '^', 'v'];

const dijkstra = (startX, startY, minStraight, maxStraight) => {
    // Dijkstra's algorithm with nodes arranged in 4 dimensions: x, y, incoming direction, straight step count
    const distance = new Array(width * height * 4 * (maxStraight + 1)).fill(Infinity);
    const prev = new Array(width * height * 4 * (maxStraight + 1)).fill(null);
    const queue = [];

    const getOffset = (x, y, dir, s) => ((y * width + x) * 4 + dir - 1) * (maxStraight + 1) + s;

    const getNeighbors = (x, y, dir, s) => {
        const neighbors = [];
        if (s < maxStraight) {
            if (dir === LEFT && x > 0) neighbors.push({ x: x - 1, y, dir: LEFT, s: s + 1 });
            if (dir === RIGHT && x < width - 1) neighbors.push({ x: x + 1, y, dir: RIGHT, s: s + 1 });
            if (dir === UP && y > 0) neighbors.push({ x, y: y - 1, dir: UP, s: s + 1 });
            if (dir === DOWN && y < height - 1) neighbors.push({ x, y: y + 1, dir: DOWN, s: s + 1 });
        }

        if (s >= minStraight) {
            if (dir === LEFT || dir === RIGHT) {
                if (y > 0) neighbors.push({ x, y: y - 1, dir: UP, s: 1 });
                if (y < height - 1) neighbors.push({ x, y: y + 1, dir: DOWN, s: 1 });
            }

            if (dir === UP || dir === DOWN) {
                if (x > 0) neighbors.push({ x: x - 1, y, dir: LEFT, s: 1 });
                if (x < width - 1) neighbors.push({ x: x + 1, y, dir: RIGHT, s: 1 });
            }
        }
        
        return neighbors;
    };

    const getWeight = (x, y) => {
        return matrix[y][x];
    };

    const getDistance = (x, y, dir, s) => {
        return distance[getOffset(x, y, dir, s)];
    };

    const setDistance = (x, y, dir, s, dist) => {
        distance[getOffset(x, y, dir, s)] = dist;
    };

    const enqueue = (x, y, dir, s) => {
        queue.push({ x, y, dir, s });
    };

    const getMin = () => {
        // priority queue would be better
        let min = Infinity;
        let minIndex = -1;
        for (let i = 0; i < queue.length; i++) {
            const { x, y, dir, s } = queue[i];
            const dist = getDistance(x, y, dir, s);
            if (dist < min) {
                min = dist;
                minIndex = i;
            }
        }
        return queue.splice(minIndex, 1)[0];
    };

    distance[getOffset(startX, startY, RIGHT, 0)] = 0;
    enqueue(startX, startY, RIGHT, 0);

    while (queue.length > 0) {
        const { x, y, dir, s } = getMin();
        const dist = getDistance(x, y, dir, s);
        const neighbors = getNeighbors(x, y, dir, s);
        for (const { x: nx, y: ny, dir: nDir, s: nS } of neighbors) {
            const weight = getWeight(nx, ny);
            const nDist = dist + weight;
            const oldDist = getDistance(nx, ny, nDir, nS);
            if (nDist < oldDist) {
                setDistance(nx, ny, nDir, nS, nDist);
                prev[getOffset(nx, ny, nDir, nS)] = { x, y, dir, s };
                enqueue(nx, ny, nDir, nS);
            }
        }
    }

    const finalDistances = [];
    const finalDirs = [];
    const finalS = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let minDistance = Infinity;
            let minDir;
            let minS;
            for (let dir = 1; dir <= 4; dir++) {
                for (let s = minStraight; s < (maxStraight + 1); s++) {
                    const dist = getDistance(x, y, dir, s);
                    if (dist < minDistance) {
                        minDistance = dist;
                        minDir = dir;
                        minS = s;
                    }
                }
            }
            finalDistances.push(minDistance);
            finalDirs.push(minDir);
            finalS.push(minS);
        }
    }
    
    // show path
    const pathMatrix = new Array(width * height).fill('.');
    let currentPos = { x: width - 1, y: height - 1, dir: finalDirs[width * height - 1], s: finalS[width * height - 1] };
    while (currentPos) {
        const { x, y, dir, s } = currentPos;
        pathMatrix[y * width + x] = DIRCHARS[dir - 1];
        currentPos = prev[getOffset(x, y, dir, s)];
    }
    console.log(pathMatrix.map((c, i) => i % width === 0 ? '\n' + c : c).join(''));
    return finalDistances;
};

const dist1 = dijkstra(0, 0, 0, 3);
console.log('Part 1:', dist1[width * height - 1]);

// Part 2

const dist2 = dijkstra(0, 0, 4, 10);
console.log('Part 2:', dist2[width * height - 1]);
