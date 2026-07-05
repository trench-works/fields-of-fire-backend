const { createNoise2D } = require("simplex-noise");

const noise = createNoise2D();

const size = 10;
const acceptance = 0.5;
const zoom = 1;

const map = [];

for (let x = 0; x < size; x++) {
    const line = [];
    for (let y = 0; y < size; y++) {
        const rawValue = noise(x / zoom, y / zoom);
        let value = " ";
        if (rawValue < -1 + acceptance) {
            value = "O";
        } else if (rawValue > 1 - acceptance) {
            value = "#";
        }
        line.push(value);
    }
    map.push(line);
}

console.log(map.map((line) => line.join(",")).join("\n"));
