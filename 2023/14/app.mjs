import { readFile } from 'fs/promises';

const input = await readFile('2023/14/input.txt', 'utf8');
const lines = input.split('\n');
const matrix = lines.map(line => line.split(''));

const handleColumn = col => {
    const len = matrix.length;
    const v = pos => matrix[pos][col];
    let sum = 0;
    let roundStones = 0;
    let firstFreeValue = len;
    const updateSum = p => {
        sum += ((firstFreeValue * (firstFreeValue + 1)) - ((firstFreeValue - roundStones) * (firstFreeValue - roundStones + 1))) / 2;
        roundStones = 0;
        firstFreeValue = len - p - 1;
    };
    for (let p = 0; p < len; p++) {
        switch (v(p)) {
            case '#':
                updateSum(p);
                break;
        
            case 'O':
                roundStones++;
                break;

            default:
                break;
        }
    }
    updateSum(-1);
    return sum;
};

const sum1 = [...Array(matrix[0].length).keys()].reduce((acc, i) => acc + handleColumn(i), 0);
console.log('Part 1:', sum1);

// Part 2

const rollStones = (col, dir) => {
    let len, v, setV;
    switch (dir) {
        case 0:
            len = matrix.length;
            v = pos => matrix[pos][col];
            setV = (pos, v) => matrix[pos][col] = v;            
            break;
        case 1:
            len = matrix[col].length;
            v = pos => matrix[col][pos];
            setV = (pos, v) => matrix[col][pos] = v;
            break;
        case 2:
            len = matrix.length;
            v = pos => matrix[len - pos - 1][col];
            setV = (pos, v) => matrix[len - pos - 1][col] = v;
            break;
        case 3:
            len = matrix[col].length;
            v = pos => matrix[col][len - pos - 1];
            setV = (pos, v) => matrix[col][len - pos - 1] = v;
            break;
    }

    let roundStones = 0;
    let firstFreePos = 0;
    const updateStones = p => {
        for (let w = firstFreePos; w < firstFreePos + roundStones; w++)
            setV(w, 'O');
        for (let w = firstFreePos + roundStones; w < p; w++)
            setV(w, '.');
        roundStones = 0;
        firstFreePos = p + 1;
    };
    for (let p = 0; p < len; p++) {
        switch (v(p)) {
            case '#':
                updateStones(p);
                break;
        
            case 'O':
                roundStones++;
                break;
        }
    }
    updateStones(len);
};

const rotateCycle = () => {
    for (let dir = 0; dir < 4; dir++) {
        const len = dir % 2 === 0 ? matrix[0].length : matrix.length;
        for (let c = 0; c < len; c++)
            rollStones(c, dir);
    }
};

const calcWeight = () => {
    return matrix.reduce((acc, row, ix) =>
        acc + (matrix.length - ix) * row.reduce((acc2, v) =>
            acc2 + (v === 'O' ? 1 : 0), 0),
    0);
};

const matrixCache = {};
let repeatingCycleEnd = -1;
let repeatingCycleLen = -1;
const iterations = 1000000000;

for (let cycle = 1; cycle <= iterations; cycle++)
{
    rotateCycle();
    const matrixString = matrix.map(row => row.join('')).join('\n');
    if (matrixCache[matrixString] !== undefined) {
        repeatingCycleEnd = cycle;
        repeatingCycleLen = cycle - matrixCache[matrixString];
        break;
    }
    matrixCache[matrixString] = cycle;
}

const remainingIterations = (iterations - repeatingCycleEnd) % repeatingCycleLen;
for (let cycle = 0; cycle < remainingIterations; cycle++)
{
    rotateCycle();
}

const sum2 = calcWeight();
console.log('Part 2:', sum2);
