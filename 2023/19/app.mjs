import { readFile } from 'fs/promises';

const input = await readFile('2023/19/input.txt', 'utf8');
const [workflowList, partList] = input.split('\n\n');

const workflows = workflowList.split('\n').reduce((acc, wf) => {
    const [_, workflowName, ruleList, finalTarget] = wf.match(/^(\w+){([\w<>,:]+),(\w+)}$/);
    const rules = ruleList.split(',').map(r => {
        const CATEGORYCODES = Object.fromEntries("xmas".split('').map((c, ix) => [c, ix]));
        const [_, category, op, rating, target] = r.match(/^([xmas])([<>])(\d+):(\w+)$/);
        return { category: CATEGORYCODES[category], op, rating: parseInt(rating), target };
    });
    return { ...acc, [workflowName]: { rules, finalTarget } };
}, {});

// Part 1

const parts = [...partList.matchAll(/{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/g)]
    .map(part => part.slice(1, 5).map(s => parseInt(s)));

const checkPartAndGetValue = part => {
    const checkWorkflow = w => {
        for (const rule of w.rules) {
            const val = part[rule.category];
            const result = rule.op === '<' ? val < rule.rating : val > rule.rating;
            if (result)
                return rule.target;
        }
        return w.finalTarget;
    };
    let workflow = 'in';
    while(true) {
        workflow = checkWorkflow(workflows[workflow]);
        if (workflow === 'R')
            return 0;
        if (workflow === 'A')
            return part.reduce((acc, v) => acc + v);
    }
};

const sum1 = parts.reduce((acc, p) => acc + (checkPartAndGetValue(p)), 0);
console.log('Part 1:', sum1);

// Part 2

const splitRanges = (ranges, category, op, rating) => {
    const rangesTrue = [...ranges];
    const rangesFalse = [...ranges];
    if (op === '<') {
        rangesTrue[category] = { ...ranges[category], max: Math.min(ranges[category].max, rating - 1)};
        rangesFalse[category] = { ...ranges[category], min: Math.max(ranges[category].min, rating)};
    } else {
        rangesTrue[category] = { ...ranges[category], min: Math.max(ranges[category].min, rating + 1)};
        rangesFalse[category] = { ...ranges[category], max: Math.min(ranges[category].max, rating)};
    }
    return [rangesTrue, rangesFalse];
};

let sum2 = 0;
const collectAccepted = ranges => {
    sum2 += ranges.map(({min, max}) => max - min + 1).reduce((acc, v) => acc * v);
};

const handleWorkflow = (wfName, ruleNr, ranges) => {
    if (wfName === 'R')
        return;
    if (wfName === 'A')
        return collectAccepted(ranges);
    const wf = workflows[wfName];
    const rule = wf.rules[ruleNr];
    if (rule === undefined)
        return handleWorkflow(wf.finalTarget, 0, ranges);
    const [rangesTrue, rangesFalse] = splitRanges(ranges, rule.category, rule.op, rule.rating);
    handleWorkflow(rule.target, 0, rangesTrue);
    handleWorkflow(wfName, ruleNr + 1, rangesFalse);
};

const initialRanges = [];
for (let i = 0; i < 4; i++)
    initialRanges.push({ min: 1, max: 4000 });

handleWorkflow('in', 0, initialRanges);

console.log('Part 2:', sum2);
