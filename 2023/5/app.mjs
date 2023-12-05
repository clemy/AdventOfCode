import { readFile } from 'fs/promises';
import peggy from 'peggy';

const parserSrc = await readFile('2023/5/parser.pegjs', 'utf8');
const parser = peggy.generate(parserSrc);
const input = await readFile('2023/5/input.txt', 'utf8');
const almanac = parser.parse(input);

const getNearestLocation = (start, end, type="seed") => {
    const map = almanac.maps[type];
    if (!map)
        return start;

    let minLocation = Infinity;
    // find the map entry for start or the one which is right before the start (if there is none)
    let ix = map.data.findLastIndex(({src}) => start >= src);
    while (start <= end) {
        if (ix < 0 || ix >= map.data.length || start >= map.data[ix].src + map.data[ix].len) {
            // we are in unmapped area
            ix++;
            const segmentEnd = Math.min(end, map.data[ix]?.src ?? Infinity);
            minLocation = Math.min(minLocation, getNearestLocation(start, segmentEnd, map.to));
            start = segmentEnd + 1;
        } else {
            // we are in mapped area
            const mapEntry = map.data[ix];
            const segmentEnd = Math.min(end, mapEntry.src + mapEntry.len - 1);
            const remapOffset = mapEntry.dest - mapEntry.src;
            minLocation = Math.min(minLocation, getNearestLocation(start + remapOffset, segmentEnd + remapOffset, map.to));
            start = segmentEnd + 1;
            if (ix + 1 >= map.data.length || start >= map.data[ix + 1].src)
                ix++;
        }
    }
    return minLocation;
};

const nearestSeedLocation = almanac.seeds.reduce((acc, seed) => Math.min(acc, getNearestLocation(seed, seed)), Infinity);
console.log('Part 1:', nearestSeedLocation);

// Part 2
let nearestSeedLocationPart2 = Infinity;

for (let group = 0; group < almanac.seeds.length / 2; group++) {
    const start = almanac.seeds[group * 2];
    const len = almanac.seeds[group * 2 + 1];

    nearestSeedLocationPart2 = Math.min(nearestSeedLocationPart2, getNearestLocation(start, start + len - 1));
}

console.log('Part 2:', nearestSeedLocationPart2);