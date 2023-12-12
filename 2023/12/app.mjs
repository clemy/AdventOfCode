import { readFile } from 'fs/promises';

const input = await readFile('2023/12/input.txt', 'utf8');
const lines = input.split('\n');

const handleLine = (line, unfold = false) => {
    const [lineSprings, lineBadCounts] = line.split(' ');
    let springs = lineSprings.split('');
    let badCounts = lineBadCounts.split(',').map(v => parseInt(v));
    if (unfold) {
        // a loop would be so nice... :)
        springs = [...springs, '?', ...springs, '?', ...springs, '?', ...springs, '?', ...springs];
        badCounts = [...badCounts, ...badCounts, ...badCounts, ...badCounts, ...badCounts];
    }
    const subProblemMap = {}; // map for storing sub problem results
    const getKey = (last, springs, badCounts) => last + springs.join('') + ';' + badCounts.join(',');
    const getVariants = (last, springs, badCounts) => {
        const myKey = getKey(last, springs, badCounts);
        const subProblemResult = subProblemMap[myKey];
        if (subProblemResult !== undefined)
            return subProblemResult;
        if (springs.length === 0) {
            const stillBads = badCounts.length >= 2 || (badCounts.length >= 1 && badCounts[0] !== 0);
            const r = stillBads ? 0 : 1;
            subProblemMap[myKey] = r;
            return r;
        }
        if (badCounts.length > 0) {
            if ((badCounts[0] < 0) || (badCounts[0] === 0 && last === '.') || (badCounts[0] > 0 && last === '#' && springs[0] === '.')) {
                subProblemMap[myKey] = 0;
                return 0;
            }
        } else if (springs[0] === '#') {
            subProblemMap[myKey] = 0;
            return 0;
        }
        if (springs[0] === '?') {
            const r = getVariants(last, ['.', ...springs.slice(1)], badCounts) +
                      getVariants(last, ['#', ...springs.slice(1)], badCounts);
            subProblemMap[myKey] = r;
            return r;
        }
        if (springs[0] === '#')
            badCounts = [badCounts[0] - 1, ...badCounts.slice(1)];
        else if (badCounts[0] === 0)
            badCounts = badCounts.slice(1);
        const r = getVariants(springs[0], springs.slice(1), badCounts);
        subProblemMap[myKey] = r;
        return r;
    }

    return getVariants('?', springs, badCounts);
};

const sum = lines.reduce((acc, line) => acc + handleLine(line), 0);
console.log('Part 1:', sum);

// Part 2
const sum2 = lines.reduce((acc, line) => acc + handleLine(line, true), 0);
console.log('Part 2:', sum2);
