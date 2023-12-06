import { readFile } from 'fs/promises';

const input = await readFile('2023/6/tinput.txt', 'utf8');
const lines = input.split('\n');

const calculateResult = input => {
    const parseValues = line => line.split(/: */)[1].split(/ +/).map(s => parseInt(s));
    const times = parseValues(input[0]);
    const distances = parseValues(input[1]);

    // Calculate bounds by solving the equation system:
    //   Distance = TimeButtonPressed * TimeTraveled
    //   Time = TimeButtonPressed + TimeTraveled
    //  =>
    //   TimeButtonPressed^2 - Time * TimeButtonPressed + Distance = 0
    //  => solving quadratic equation to
    //   Bound_{1,2} = Time/2 \pm \sqrt{Time^2 / 4 - Distance}
    const bounds = times.map((t, ix) => [
        t/2 - Math.sqrt(t**2/4-distances[ix]),
        t/2 + Math.sqrt(t**2/4-distances[ix])
    ]);

    // Searching integer bounds within the open interval
    // given by the calculated bounds (winning interval)
    const roundedBounds = bounds.map(([a, b]) => [
        Number.isInteger(a) ? a + 1 : Math.ceil(a),
        Number.isInteger(b) ? b - 1 : Math.floor(b)
    ]);
    const possibleTimeCounts = roundedBounds.map(([a, b]) => b - a + 1);
    return possibleTimeCounts.reduce((acc, n) => acc * n);
}

console.log('Part 1: ', calculateResult(lines));
console.log('Part 2: ', calculateResult(lines.map(line => line.replace(/ +/g, ''))));
