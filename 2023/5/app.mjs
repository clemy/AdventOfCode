import { readFile } from 'fs/promises';
import peggy from 'peggy';

const parserSrc = await readFile('2023/5/parser.pegjs', 'utf8');
const parser = peggy.generate(parserSrc);
const input = await readFile('2023/5/input.txt', 'utf8');
const almanac = parser.parse(input);

const remapNr = (map, nr) => {
    // maybe change to binary search in sorted array
    const mapEntry = map.data.find(({src, len}) => nr >= src && nr < src + len);
    if (mapEntry)
        return nr - mapEntry.src + mapEntry.dest;
    return nr;
};

const getLocation = (nr, type="seed") => {
    const map = almanac.maps[type];
    if (!map)
        return nr;
    const newNr = remapNr(map, nr);
    return getLocation(newNr, map.to);
};

const nearestSeedLocation = almanac.seeds.reduce((acc, seed) => Math.min(acc, getLocation(seed)), Infinity);
console.log('Part 1:', nearestSeedLocation);

// Part 2
// This is really slow, but solved the task
// Alternatively: create a final dictionary of ranges (by subdividing it on every step)
let nearestSeedLocationPart2 = Infinity;

for (let group = 0; group < almanac.seeds.length; group += 2) {
    const start = almanac.seeds[group];
    const len = almanac.seeds[group + 1];

    for (let seedNr = start; seedNr < start + len; seedNr++) {
        nearestSeedLocationPart2 = Math.min(nearestSeedLocationPart2, getLocation(seedNr));
    }
}

console.log('Part 2:', nearestSeedLocationPart2);