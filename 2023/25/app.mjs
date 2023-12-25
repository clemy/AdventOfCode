import { readFile } from 'fs/promises';
import { mincut } from '@graph-algorithm/minimum-cut';

const input = await readFile('2023/25/input.txt', 'utf8');

const nodes = {};
const edges = [];
const addNodeIfNotExists = (nodeName) => {
    nodes[nodeName] = nodes[nodeName] ?? Object.keys(nodes).length;
};

input.split('\n').forEach((line) => {
    const [nodeName, connectedNodeNames] = line.split(': ');
    const edgeNodeNames = connectedNodeNames.split(' ');
    addNodeIfNotExists(nodeName);
    edgeNodeNames.forEach((edgeNodeName) => {
        addNodeIfNotExists(edgeNodeName);
        edges.push([nodes[nodeName], nodes[edgeNodeName]]);
    });
});

// find the minimum cut using an algorithm from the graph-algorithm package
const cuts = [...mincut(edges)];
if (cuts.length !== 3)
    throw new Error(`Expected three cuts, but got ${cuts.length} cuts`);

const edgesWithoutCut = {};
edges.forEach((e) => {
    const [n1, n2] = e;
    // skip edges that are part of the cut (both directions)
    if (cuts.findIndex(([c1, c2]) => n1 === c1 && n2 === c2 || n1 === c2 && n2 === c1) !== -1)
        return;
    edgesWithoutCut[n1] = [...edgesWithoutCut[n1] ?? [], n2];
    edgesWithoutCut[n2] = [...edgesWithoutCut[n2] ?? [], n1];
});

const countNodes = (start) => {
    const visited = new Set();
    const toVisit = [start];
    while (toVisit.length > 0) {
        const n = toVisit.pop();
        if (visited.has(n)) continue;
        visited.add(n);
        toVisit.push(...edgesWithoutCut[n]);
    }
    return visited.size;
};

// count the nodes on each side of the first cut
const va = countNodes(cuts[0][0]);
const vb = countNodes(cuts[0][1]);

console.log('Part 1:', va * vb);
