import { readFile } from 'fs/promises';

const input = await readFile('2023/23/input.txt', 'utf8');

let startTime = performance.now();
let map = input.split('\n').map((line) => line.split(''));
const size = { x: map[0].length, y: map.length };

const toPos = (x, y) => (x << 8 | y);
const fromPos = (pos) => ({ x: pos >> 8, y: pos & 0xff });
const inMap = (pos) => {const {x, y} = fromPos(pos); return x >= 0 && x < size.x && y >= 0 && y < size.y;};
const getMap = (pos) => map[fromPos(pos).y][fromPos(pos).x];
const setMap = (pos, val) => map[fromPos(pos).y][fromPos(pos).x] = val;

const start = toPos(map[0].indexOf('.'), 0);
const end = toPos(map[size.y - 1].indexOf('.'), size.y - 1);

const getNeighbors = (pos) => {
    const { x, y } = fromPos(pos);
    return [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
    ].map(({x, y}) => toPos(x, y)).filter(inMap);
};

// Part 1
// split map into subgraphs on each slope
// split subgraphs with multiple inEdges
// calculate weights (one per outEdge) as the longest path length within each subgraph
// supergraph is a DAG, so calculate longest path in DAG (topological sort + dynamic programming)
// using the subgraph weights as supergraph edge weights

const subgraphs = [];
const slopes = new Set();

let startGraph, endGraph;

const createSubgraph = (nr, pos) => {
    const nodes = new Set();
    const floodFill = (pos) => {
        const c = getMap(pos);
        if (c === '<' || c === '>' || c === '^' || c === 'v') {
            slopes.add(pos);
            return;
        }
        if (getMap(pos) !== '.')
            return;
        if (pos === start)
            startGraph = nr;
        if (pos === end)
            endGraph = nr;
        setMap(pos, nr);
        nodes.add(pos);
        getNeighbors(pos).forEach(floodFill);
    };
    floodFill(pos);
    subgraphs.push({ nr, mapNr: nr, nodes, inEdges: [], outEdges: [] });
};

let subgraphNr = 0;
for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
        if (map[y][x] === '.') {
            createSubgraph(subgraphNr++, toPos(x, y));
        }
    }
}

[...slopes].forEach((pos) => {
    const c = getMap(pos);
    const { x, y } = fromPos(pos);
    let from, to;
    switch (c) {
        case '<':
            from = toPos(x + 1, y);
            to = toPos(x - 1, y);
            break;
        case '>':
            from = toPos(x - 1, y);
            to = toPos(x + 1, y);
            break;
        case '^':
            from = toPos(x, y + 1);
            to = toPos(x, y - 1);
            break;
        case 'v':
            from = toPos(x, y - 1);
            to = toPos(x, y + 1);
            break;
    }
    const fromNr = getMap(from);
    const toNr = getMap(to);
    subgraphs[fromNr].outEdges.push( { pos, to: toNr, weight: null });
    subgraphs[toNr].inEdges.push( { pos, from: fromNr, weight: null });
});

// add a final node
subgraphs.push({
    nr: subgraphNr++,
    mapNr: subgraphNr - 1,
    nodes: new Set(),
    inEdges: [{ pos: end, from: endGraph, weight: null }],
    outEdges: [],
});
subgraphs[endGraph].outEdges.push({ pos: end, to: subgraphNr - 1, weight: null });
endGraph = subgraphNr - 1;

// topological sort of subgraphs
const sortTopologically = () => {
    subgraphs.forEach((g) => g.inEdgesForSort = [ ...g.inEdges]);
    const sortedSubgraphs = [];
    const subgraphQueue = new Set(subgraphs.filter((g) => g.inEdgesForSort.length === 0));
    while (subgraphQueue.size > 0) {
        const g = subgraphQueue.values().next().value;
        subgraphQueue.delete(g);
        sortedSubgraphs.push(g);
        g.outEdges.forEach((e) => {
            const to = subgraphs[e.to];
            if (to.inEdgesForSort.splice(to.inEdgesForSort.findIndex((e2) => e2.from === g.nr), 1).length !== 1)
                return;
            if (to.inEdgesForSort.length === 0)
                subgraphQueue.add(to);
        });
    }
    if (!subgraphs.every((g) => g.inEdgesForSort.length === 0))
        throw new Error('Cycle detected');

    return sortedSubgraphs;
};
const sortedBeforeSplit = sortTopologically();
// split subgraphs with multiple inEdges
sortedBeforeSplit.reverse().forEach((g) => {
    g.inEdges.splice(1).forEach((e) => {
        subgraphs[e.from].outEdges.splice(subgraphs[e.from].outEdges.findIndex((e2) => e2.to === g.nr), 1);
        subgraphs.push({
            ...g,
            nr: subgraphNr++,
            inEdges: [e],
            outEdges: [...g.outEdges].map((e) => ({ ...e })), // deep copy
        });
        subgraphs[e.from].outEdges.push({ pos: e.pos, to: subgraphNr - 1, weight: null });
        g.outEdges.forEach((e) => {
            subgraphs[e.to].inEdges.push({ pos: e.pos, from: subgraphNr - 1, weight: null });
        });
    });
});

subgraphs.forEach((g) => {
    let lastPos = null;
    g.inEdges.forEach((e) => {
        if (lastPos !== null && lastPos !== e.pos)
            throw new Error('Different inEdges');
        lastPos = e.pos;
    });
});


const sortedSubgraphs = sortTopologically();

// calculate weights
subgraphs.forEach((g) => {
    const from = g.nr === startGraph ? start : g.inEdges[0]?.pos;
    if (from === undefined)
        throw new Error('No inEdges');

    g.outEdges.forEach((e) => {
        const to = /*g.nr === endGraph ? end :*/ e.pos;
        if (to === undefined)
            throw new Error('No outEdges');

        // path within subgraph from from to to
        const distances = new Map();
        const queue = [from];
        distances.set(from, 0);
        while (queue.length > 0) {
            queue.sort((a, b) => distances.get(a) - distances.get(b));
            const pos = queue.shift();
            const posDist = distances.get(pos);
            getNeighbors(pos).forEach((neighbor) => {
                const c = getMap(neighbor);
                if (c !== g.mapNr && c !== '<' && c !== '>' && c !== '^' && c !== 'v')
                    return;
                const neighborDist = distances.get(neighbor);
                if (neighborDist === undefined || neighborDist > posDist + 1) {
                    distances.set(neighbor, posDist + 1);
                    queue.push(neighbor);
                }
            });
        }
        e.weight = distances.get(to);
        subgraphs[e.to].inEdges.find((e2) => e2.from === g.nr).weight = e.weight;
    });
});

subgraphs.forEach((g) => {
    g.outEdges.forEach((e) => {
        if (e.weight === null || e.weight === undefined)
            throw new Error('No outEdge weight');
        if (e.weight <= 0)
            throw new Error('Invalid outEdge weight');
    });
    g.inEdges.forEach((e) => {
        if (e.weight === null || e.weight === undefined)
            throw new Error('No inEdge weight');
        if (e.weight <= 0)
            throw new Error('Invalid inEdge weight');
    });
});


// calculate longest path
const distances = new Map();
sortedSubgraphs.forEach((g) => {
    let maxDist = 0;
    g.inEdges.forEach((e) => {
        const dist = distances.get(e.from) + e.weight;
        maxDist = Math.max(maxDist, dist);
    });
    distances.set(g.nr, maxDist);
});

let endTime = performance.now();
console.log('Part 1:', distances.get(endGraph));
console.log(`Execution time: ${endTime - startTime} ms`);

// Part 2
// unfortunately no DAG anymore, so no topological sort
// split the graph into subgraphs on each crossing
// calculate edge weights as the path length within each subgraph
// search longest path in supergraph (DFS)
// use the subgraph weights as supergraph edge weights
// keeping track of visited crossings using a 64 bit bitmask (limiting the number of crossings to 64)

startTime = performance.now();
map = input.split('\n').map((line) => line.split('').map((c) => c === '#' ? '#' : '.'));

let crossingNum = 0n; // BigInt
const crossings = new Map();
const addCrossing = (from, to, length) => {
    if (crossings.has(from)) {
        const crossing = crossings.get(from);
        if (!crossing.neighbors.some((n) => n.pos === to)) {
            crossings.get(from).neighbors.push({ pos: to, length });
        }
    } else {
        crossings.set(from, { num: crossingNum++, neighbors: [{ pos: to, length }] });
    }
};
const addCrossingBiDir = (from, to, length) => {
    addCrossing(from, to, length);
    addCrossing(to, from, length);
};
let crossingSearchQueue = [{ from: null, pos: start, lastCrossing: start, length: 0 }];
while (crossingSearchQueue.length > 0) {
    let {from, pos, lastCrossing, length} = crossingSearchQueue.shift();
    if (crossings.has(pos)) {
        addCrossingBiDir(lastCrossing, pos, length);
        continue;
    }
    if (pos === end) {
        addCrossing(lastCrossing, pos, length);
        continue;
    }

    const neighbors = getNeighbors(pos).filter((nPos) => nPos !== from && getMap(nPos) === '.');
    if (neighbors.length >= 2) {
        addCrossingBiDir(lastCrossing, pos, length);
        lastCrossing = pos;
        length = 0;
    }
    length++;
    neighbors.forEach((nPos) => crossingSearchQueue.push({ from: pos, pos: nPos, lastCrossing, length }));
}

const crossingsArray = [...crossings.values()];
crossingsArray.forEach((crossing, ix) => {
    if (crossing.num != ix)
        throw new Error('Invalid crossing num');
    crossing.neighbors.forEach((neighbor) => {
        neighbor.num = crossings.get(neighbor.pos)?.num;
    });
});

// crossings.forEach((crossing, key) => {
//     console.log(`${fromPos(key).x},${fromPos(key).y},${crossing.num}`, crossing.neighbors.map((n) => `${fromPos(n.pos).x},${fromPos(n.pos).y}(${n.length})`).join(', '));
// });

// search longest path in graph
let distance2 = 0;
const searchStack = [ { crossingNum: crossings.get(start).num, length: 0, path: 0n } ];
while (searchStack.length > 0) {
    const { crossingNum, length, path } = searchStack.pop();
    const crossing = crossingsArray[crossingNum];
    const newPath = path | (1n << crossingNum);
    crossing.neighbors.forEach((neighbor) => {
        if (neighbor.num !== undefined && path & (1n << neighbor.num))
            return;
        const newLength = length + neighbor.length;
        if (neighbor.pos === end) {
            if (newLength > distance2) {
                distance2 = newLength;
                // console.log(distance2, newPath.toString(2));
            }
        } else {
            searchStack.push({ crossingNum: neighbor.num, length: newLength, path: newPath });
        }
    });
}


endTime = performance.now();
console.log('Part 2:', distance2);
console.log(`Execution time: ${endTime - startTime} ms`);

/*
Part 1: 2074
Execution time: 17.543200001120567 ms
Part 2: 6494
Execution time: 4962.664299994707 ms
*/