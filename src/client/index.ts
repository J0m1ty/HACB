import { io, Socket } from "socket.io-client";

import P5 from "p5";

const socket: Socket = io();

const sketch = (p5: P5) => {
    p5.setup = () => {
        const canvas = p5.createCanvas(200, 200);
        canvas.parent("game");
    };

    p5.draw = () => {
        p5.background("red");
    };
}

new P5(sketch);