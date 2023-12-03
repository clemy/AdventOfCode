import { readFile } from 'fs/promises';

const input = await readFile('2023/1/input.txt', 'utf8');
const sum1 = input.split('\n').reduce((acc, line) => {const n = line.replace(/[^\d]/g, ''); return acc + parseInt(n[0]) * 10 + parseInt(n[n.length - 1])}, 0);
console.log(sum1);

// Part 2
const digitnames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const isDigit = (char) => {
    return /^\d$/.test(char);
};

const fixalphanum = (str) => {
    var out = '';
    while(str.length > 0) {	
        if (isDigit(str[0])) {
            out += str[0];
        } else {
            for (var i = 0; i < digitnames.length; i++) {
                if (str.startsWith(digitnames[i])) {
                    out += (i + 1);
                    break;
                }
            }
        }
        str = str.substr(1);
    }
    return out;
};

const sum2 = input.split('\n').reduce((acc, line) => {const n = fixalphanum(line); return acc + parseInt(n[0]) * 10 + parseInt(n[n.length - 1])}, 0);
console.log(sum2);
