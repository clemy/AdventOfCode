import { readFile } from 'fs/promises';

const input = await readFile('2023/20/input.txt', 'utf8');

const modules = input.split('\n').reduce((acc, line) => {
    const [_, type, name, outList] = line.match(/^([%&]?)([a-z]+) -> ([a-z, ]+)$/);
    const outs = outList.split(', ');
    return { ...acc, [name]: { type, outs } };
}, {});

let buttonCount;

const initState = () => {
    buttonCount = 0;
    for (const moduleName in modules) {
        const module = modules[moduleName];
        if (module.type === '%') {
            module.state = false;
        }
        module.outs.forEach(out => {
            if (modules[out]?.type === '&') {
                modules[out].state = { ...modules[out].state, [moduleName]: false };
                modules[out].cycleLengths = { ...modules[out].cycleLengths, [moduleName]: null };
            }
        });
    }
};

const pulseCounters = [0, 0];
const pulseQueue = [];
const queuePulse = (senderName, receiverName, level) => {
    // console.log(`${senderName} -${level ? 'high' : 'low'}-> ${receiverName}`);
    pulseQueue.push({ senderName, receiverName, level });
    pulseCounters[level ? 1 : 0]++;
};

const handlePulse = ({ senderName, receiverName, level }) => {
    const receiver = modules[receiverName];
    if (receiver === undefined) return;
    let outLevel;
    switch (receiver.type) {
        case '':
            outLevel = level;
            break;

        case '%':
            if (level) return;
            outLevel = receiver.state = !receiver.state;
            break;

        case '&':
            receiver.state[senderName] = level;
            if (level && receiver.cycleLengths[senderName] === null) {
                receiver.cycleLengths[senderName] = buttonCount;
            }
            outLevel = !Object.values(receiver.state).reduce((acc, v) => acc & v);
            break;
    }
    receiver.outs.forEach(out => queuePulse(receiverName, out, outLevel));
};

const handleQueue = () => {
    while (pulseQueue.length > 0) {
        handlePulse(pulseQueue.shift());
    }
};

const pushButton = () => {
    buttonCount++;
    queuePulse('button', 'broadcaster', false);
};


initState();
for (let i = 0; i < 1000; i++) {
    pushButton();
    handleQueue();
}

console.log('Part 1:', pulseCounters[0] * pulseCounters[1]);

// Part 2
initState();
const senderForRx = Object.values(modules).filter(module => module.outs.includes('rx'))[0];
if (senderForRx) {
    while (Object.values(senderForRx.cycleLengths).includes(null)) {
        pushButton();
        handleQueue();
    }

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (a, b) => a * b / gcd(a, b);
    const totalCycleLength = Object.values(senderForRx.cycleLengths).reduce(lcm);
    console.log('Part 2:', totalCycleLength);
} else {
    console.log('Part 2:', 'rx not available');
}
