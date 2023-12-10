import { readFile } from 'fs/promises';

const input = await readFile('2023/10/input.txt', 'utf8');
const lines = input.split('\n');
const map = lines.map(line => line.split(''));

const width = map.reduce((acc, line) => Math.min(acc, line.length), Infinity);
const widthMax = map.reduce((acc, line) => Math.max(acc, line.length), 0);
if(width !== widthMax) throw new Error('Map is not rectangular');
const height = map.length;

const getNodeNumber = (x, y) => y * width + x;
const getNeighborOffsets = char => {
    // get connected neighbors
    switch (char) {
        case '|': return [{ x: 0, y: -1 }, { x: 0, y: 1 }];
        case '-': return [{ x: -1, y: 0 }, { x: 1, y: 0 }];
        case 'L': return [{ x: 0, y: -1 }, { x: 1, y: 0 }];
        case 'J': return [{ x: 0, y: -1 }, { x: -1, y: 0 }];
        case '7': return [{ x: 0, y: 1 }, { x: -1, y: 0 }];
        case 'F': return [{ x: 0, y: 1 }, { x: 1, y: 0 }];
        case '.': return [];
        case 'S': return [];
        default: throw new Error(`Unknown char ${char}`);
    }
}

const nodeList = [];
let startNodeNr;
for (let y = 0; y < height; y++) {
  const line = map[y];
  for (let x = 0; x < width; x++) {
    const cell = line[x];
    if (cell === 'S') {
        startNodeNr = getNodeNumber(x, y);
    }
    const neighbors = getNeighborOffsets(cell).map(offset => getNodeNumber(x + offset.x, y + offset.y));
    nodeList.push({ x, y, cell, neighbors });
  }
}
// check neighbors of start if they connect to start and update start node
const startNeighbors = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }].map(offset =>
    [nodeList[startNodeNr].x + offset.x, nodeList[startNodeNr].y + offset.y]).filter(([x, y]) =>
        x >= 0 && x < width && y >= 0 && y < height).map(([x, y]) => getNodeNumber(x, y)).filter(node =>
            nodeList[node].neighbors.includes(startNodeNr));
nodeList[startNodeNr].neighbors = startNeighbors;

let currentNodeNr = startNodeNr;
let steps = 0;
const insideList = new Set();
const addToInsideList = (node, neighborIndex) => {
    // for Part 2
    // add always the nodes on the right side of the pipe path
    // it must be ensured that the start direction is forcing the inside on the right side
    let offsets = [];
    switch (node.cell) {
        case '|': offsets = neighborIndex === 0 ?
            [{ x: 1, y: 0 }] :
            [{ x: -1, y: 0 }];
            break;
        case '-': offsets = neighborIndex === 0 ?
            [{ x: 0, y: -1 }] :
            [{ x: 0, y: 1 }];
            break;
        case 'L': offsets = neighborIndex === 0 ?
            [{ x: 1, y: -1 }] :
            [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }];
            break;
        case 'J': offsets = neighborIndex === 0 ?
            [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }] :
            [{ x: -1, y: -1 }];
            break;
        case '7': offsets = neighborIndex === 0 ?
            [{ x: -1, y: 1 }] :
            [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }];
            break;
        case 'F': offsets = neighborIndex === 0 ?
            [{ x: 0, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 0 }] :
            [{ x: 1, y: 1 }];
            break;
    }
    offsets.map(offsets => [node.x + offsets.x, node.y + offsets.y]).filter(([x, y]) =>
        x >= 0 && x < width && y >= 0 && y < height).map(([x, y]) =>
            getNodeNumber(x, y)).forEach(nodeNr => insideList.add(nodeNr));
};

do {
    // trace the pipe path
    const currentNode = nodeList[currentNodeNr];
    const nextNeighborIndex = nodeList[currentNode.neighbors[0]].visited ? 1 : 0;
    currentNode.visited = true;
    currentNodeNr = currentNode.neighbors[nextNeighborIndex];
    steps++;
    if (!nodeList[currentNodeNr].visited)
        addToInsideList(currentNode, nextNeighborIndex); // for Part 2
} while (!nodeList[currentNodeNr].visited);

console.log('Part 1:', steps / 2);

// Part 2:
// remove pipe path nodes from the inside list
const insideListFiltered = [...insideList.values()].filter(nodeNr => !nodeList[nodeNr].visited);

let filledCnt = 0;
const floodFill = (nodeNr) => {
    const node = nodeList[nodeNr];
    if (node.filled || node.visited)
        return;
    node.filled = true;
    filledCnt++;
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }].map(offset =>
        [node.x + offset.x, node.y + offset.y]).filter(([x, y]) =>
            x >= 0 && x < width && y >= 0 && y < height).map(([x, y]) =>
                getNodeNumber(x, y)).forEach(nodeNr => 
                    floodFill(nodeNr)
    );
}

// flood fill the inside (reaching nodes not touched by the pipe)
insideListFiltered.forEach(nodeNr => floodFill(nodeNr));
console.log('Part 2:', filledCnt);
