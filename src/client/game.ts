import P5, { Vector, Shader } from "p5";
import { Map } from "./map";
import { Camera } from "./camera";
import { p5, RemoteImage } from "./index";
import { TileType } from "./tileManager";

const average = (arr: number[]) => arr.reduce((a, b) => a + b) / arr.length;

export class Game {
    p5: P5;
    images: RemoteImage[];
    map: Map;
    camera: Camera;

    keys: boolean[];
    keyPressed: boolean;
    click: boolean;
    scroll: number;

    fpsAverage: number;
    fps: number[];

    mouse: Vector;

    constructor(p5: P5, images: RemoteImage[], shader: Shader) {
        this.p5 = p5;
        this.images = images;
        this.map = new Map(this, {
            tileTypes: [
                {
                    name: "water",
                    color: p5.color(90, 188, 216),
                    borderColor: p5.color(28, 71, 97)
                },
                {
                    name: "island",
                    color: p5.color(156, 139, 131),
                    borderColor: p5.color(28, 71, 97)
                }
            ]
        });
        this.camera = new Camera(this);

        this.keys = [];
        this.keyPressed = false;
        this.click = false;
        this.scroll = 0;

        this.fps = [];

        this.mouse = p5.createVector(0, 0);
    }

    get size(): number {
        return p5.width < p5.height ? p5.width : p5.height;
    }

    get center(): Vector {
        return p5.createVector(p5.width / 2, p5.height / 2);
    }

    background() {
        p5.background(48, 52, 54);
        let bg = this.images.filter(img => img.name == "ocean")[0].image;
        let size = p5.width < p5.height ? p5.height : p5.width;
        p5.image(bg, 0, 0, size, size);
        p5.fill(17, 45, 84, 200);
        p5.stroke(15, 94, 156);
        p5.strokeWeight(2);
        p5.ellipse(p5.width / 2, p5.height / 2, this.size);
    }

    ui() {
        this.fps.push(p5.frameRate());

        p5.noStroke();
        p5.textSize(20);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.fill(49, 122, 122);
        p5.text(~~average(this.fps), 20, 20);

        p5.text(`${~~(this.camera.drawInfo.drawn / (this.camera.drawInfo.drawn + this.camera.drawInfo.ignored) * 100)}% rendered`, 20, 50);

        if (this.fps.length > 200) this.fps.shift();
    }

    run() {
        this.camera.update();

        this.mouse = this.camera.getPosition(p5.mouseX, p5.mouseY);

        this.background();

        this.camera.pass(() => {
            this.map.display();
        });

        this.ui();

        this.keyPressed = false;
        this.click = false;
        this.scroll = 0;
    }
}