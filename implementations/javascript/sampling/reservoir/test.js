import { reservoirSample } from './reservoir.js';

const stream = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const k = 5;
const sample = reservoirSample(stream, k);

if (sample.length !== k) {
  throw new Error('Expected sample size ' + k + ', saw ' + sample.length);
}
for (const x of sample) {
  if (!stream.includes(x)) {
    throw new Error('Value ' + x + ' not in stream');
  }
}
const unique = new Set(sample);
if (unique.size !== k) {
  throw new Error('Expected unique elements');
}
console.log('javascript reservoir ok');
