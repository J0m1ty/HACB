import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../shared/events";

import P5, { Image, Shader } from "p5";

import { Game } from "./game";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

export class RemoteImage {
    name: string;
    image: Image;

    constructor(name: string) {
        this.name = name;
        this.image = p5.loadImage(`./images/${this.name}.jpg`);
    }
}

const sketch = async (p: P5) => {
    var game: Game;
    var images: RemoteImage[];
    var shader: Shader;

    p.preload = async () => {
        images = [
            new RemoteImage("ocean")
        ];

        shader = p.loadShader(`./shaders/water.vert`, `./shaders/water.frag`);
    };

    p.setup = async () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        canvas.parent("game");

        p.pixelDensity(1);
        p.smooth();
        p.frameRate(Infinity);

        game = new Game(p, images, shader);
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        game.camera.resize();
    };

    p.keyPressed = () => {
        game.keys[p.keyCode] = true;
        game.keyPressed = true;
    };

    p.keyReleased = () => {
        game.keys[p.keyCode] = false;
    };

    p.mouseClicked = () => {
        game.click = true;
    }

    p.mouseWheel = (event: any) => {
        let dir = 0;
        if (event.delta > 0) {
            dir = 1;
        }
        else if (event.delta < 0) {
            dir = -1;
        }

        game.scroll = dir;

        return false;
    }

    p.draw = () => {
        // p.background(50);
        // game.run();

        p.shader(waterShader);

        p.rect(0, 0, p.width, p.height);
    };
}

export const p5 = new P5(sketch);