import { readFile } from 'fs/promises';

// read and convert data
let testData = false;
// testData = true;
const input = await readFile(testData ? '2023/24/tinput.txt' : '2023/24/input.txt', 'utf8');
const limit = testData ? [7, 27] : [200000000000000, 400000000000000];
const stones = input.split('\n').map((line) => {
    const [_, x, y, z, dx, dy, dz] = line.match(/^\s*(\d+),\s*(\d+),\s*(\d+)\s*@\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)\s*$/).map(Number);
    return { x, y, z, dx, dy, dz };
});

// find intersection
const findIntersection = (a, b) => {
    const d = a.dx * b.dy - a.dy * b.dx;
    if (d === 0) return false;
    const t = ((b.x - a.x) * b.dy - (b.y - a.y) * b.dx) / d;
    const u = ((b.x - a.x) * a.dy - (b.y - a.y) * a.dx) / d;
    if (t < 0 || u < 0) return false;
    const px = a.x + t * a.dx;
    const py = a.y + t * a.dy;
    if (px < limit[0] || px > limit[1]) return false;
    if (py < limit[0] || py > limit[1]) return false;
    return true;
};

const checkStone = (stone, ix) => {
    let intersections = 0;
    for (let ixOther = ix + 1; ixOther < stones.length; ixOther++) {
        const other = stones[ixOther];
        const intersects = findIntersection(stone, other);
        if (intersects) {
            intersections++;
        }
    }
    return intersections;
};

const count1 = stones.reduce((acc, stone, ix) => acc + checkStone(stone, ix), 0);
console.log('Part 1:', count1);

// Part 2
// for finding the intercept trajectory for linear motion 3 (linear independent) hailstones are enough

// ps .. position vector of stone
// vs .. velocity vector of stone
// px .. position vector of hailstone x
// vx .. velocity vector of hailstone x
// tx .. time of intersection of stone and hailstone x
// ps + vs * tx = px + vx * tx
// (ps - px) = tx * (vx - vs)
// tx is scalar => (ps - px) is (vx - vs) scaled by tx => (ps - px) is parallel to (vx - vs)
// => their cross-product is 0 =>
// (ps - px) x (vx - vs) = 0
// ps x vx - ps x vx - px x vs + px x vs = 0
// inserting hailstone 1 (p1, v1) and 2 (p2, v2) and subtracting the equations:
// ps x (v1 - v2) + vs x (p1 - p2) = p1 x v1 - p2 x v2
// dv = v1 - v2, dp = p1 - p2
// ps x dv + vs x dp = p1 x v1 - p2 x v2
// -(dv x ps) + -(dp x vs) = p1 x v1 - p2 x v2

// Equation System: Ax = b
//   with x = [ps.x, ps.y, ps.z, vs.x, vs.y, vs.z]

const crossProduct = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
});

const createEquationSystem = (hs1, hs2) => {
    const p1 = { x: hs1.x, y: hs1.y, z: hs1.z };
    const p2 = { x: hs2.x, y: hs2.y, z: hs2.z };
    const v1 = { x: hs1.dx, y: hs1.dy, z: hs1.dz };
    const v2 = { x: hs2.dx, y: hs2.dy, z: hs2.dz };
    const dp = { x: hs1.x - hs2.x, y: hs1.y - hs2.y, z: hs1.z - hs2.z };
    const dv = { x: hs1.dx - hs2.dx, y: hs1.dy - hs2.dy, z: hs1.dz - hs2.dz };

    // cross product of vectors and split up into components of ps and vs
    const A = [
        [0, dv.z, -dv.y, 0, dp.z, -dp.y],
        [-dv.z, 0, dv.x, -dp.z, 0, dp.x],
        [dv.y, -dv.x, 0, dp.y, -dp.x, 0]
    ];

    const b1 = crossProduct(p1, v1);
    const b2 = crossProduct(p2, v2);
    const b = [
        b1.x - b2.x,
        b1.y - b2.y,
        b1.z - b2.z
    ];

    return { A, b };
};

const {A: A1, b: b1} = createEquationSystem(stones[0], stones[1]);
const {A: A2, b: b2} = createEquationSystem(stones[0], stones[2]);
const A = A1.concat(A2);
const b = b1.concat(b2);

// solve equation system
const solve = (A, b) => {
    const n = A.length;
    const x = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        // find pivot row and swap
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
                maxRow = j;
            }
        }
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [b[i], b[maxRow]] = [b[maxRow], b[i]];

        // pivot within A and b
        for (let j = i + 1; j < n; j++) {
            const c = -A[j][i] / A[i][i];
            for (let k = i; k < n; k++) {
                if (i === k) {
                    A[j][k] = 0;
                } else {
                    A[j][k] += c * A[i][k];
                }
            }
            b[j] += c * b[i];
        }
    }

    // back substitution
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (b[i] - sum) / A[i][i];
    }
    return x;
};

const x = solve(A, b);

console.log('Part 2:', Math.round(x[0]) + Math.round(x[1]) + Math.round(x[2]));
