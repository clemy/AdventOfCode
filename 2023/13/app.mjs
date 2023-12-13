import { readFile } from 'fs/promises';

const input = await readFile('2023/13/input.txt', 'utf8');
const blocks = input.split('\n\n');

// this returns an array with the calculated value and for part 2 with the ignore information
const handleBlock = (data, ignore = [-1, -1]) => {
    const transpose = b => {
        const b2 = [...b];
        b.length = 0;
        b2.forEach(l => {
            for (let ix = 0; ix < l.length; ix++) {
                b[ix] = (b[ix] ?? '') + l[ix];
            }
        });
    };

    const checkForMirror = (b, ignore) => {
        for (let i = b.length % 2; i < b.length - 1; i += 2) {
            if (i === ignore)
                continue;
            if (b[i] === b[b.length - 1]) {
                let ok = true;
                for (let j = i + 1; j < b.length - 1; j++) {
                    if (b[j] !== b[b.length - j + i - 1]) {
                        ok = false;
                        break;
                    }
                }
                if (ok)
                    return i;
            }
        }
        return -1;
    };
    const block = data.split('\n');
    // check rows
    let pos = checkForMirror(block, ignore[0] === 1 ? ignore[1] : -1);
    if (pos >= 0)
        return [100 * ((block.length - pos) / 2 + pos), [1, pos]];

    // check rows from end
    block.reverse();
    pos = checkForMirror(block, ignore[0] === 2 ? ignore[1] : -1);
    if (pos >= 0)
        return [100 * (block.length - ((block.length - pos) / 2 + pos)), [2, pos]];

    // check columns
    transpose(block);
    pos = checkForMirror(block, ignore[0] === 3 ? ignore[1] : -1);
    if (pos >= 0)
        return [(block.length - pos) / 2 + pos, [3, pos]];

    // check columns from end
    block.reverse();
    pos = checkForMirror(block, ignore[0] === 4 ? ignore[1] : -1);
    if (pos >= 0)
        return [block.length - ((block.length - pos) / 2 + pos), [4, pos]];

    // nothing found
    return -1;
};

console.log('Part 1:', blocks.reduce((acc, block) => acc + handleBlock(block)[0], 0));

// Part 2
const handleBlockSmudge = data => {   
    const oldv = handleBlock(data);
    const block = data.split('\n');
    const flip = (x, y) => {
        const s = block[y].split('');
        s[x] = s[x] === '.' ? '#' : '.';
        block[y] = s.join('');
    };
    for (let y = 0; y < block.length; y++) {
        for (let x = 0; x < block[y].length; x++) {
            flip(x, y);
            const v = handleBlock(block.join('\n'), oldv[1])[0];
            if (v >= 0)
                return v;
            flip(x, y);
        }
    }
    return -Infinity;
};

console.log('Part 2:', blocks.reduce((acc, block) => acc + handleBlockSmudge(block), 0));
