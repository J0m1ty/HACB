import P5, { Vector } from "p5";
import { p5 } from "./index";
import { Game } from "./game";

class MinMax {
    min: number;
    max: number;

    constructor(min: number, max: number) {
        if (min > max) {
            throw new Error("min cannot be greater than max");
        }
        this.min = min;
        this.max = max;
    }
}

export class Camera {
    game: Game;
    position: Vector;
    dist: number;
    speed: number;
    rotation: number;
    scale: number;
    zoom: number;
    zoomConstraint: MinMax;
    zoomSensitivity: number;

    toPosition: Vector;
    toRotation: number;
    toZoom: number;

    positionResponse: number;
    rotationResponse: number;
    zoomResponse: number;

    drawInfo: { drawn: number, ignored: number };

    constructor(game: Game) {
        this.game = game;
        this.position = p5.createVector(0, 0);
        this.dist = 0;
        this.speed = 0.2;

        this.rotation = 0;

        this.scale = 1;
        this.zoom = 1;
        this.zoomConstraint = new MinMax(1, 2);
        this.zoomSensitivity = 75;

        this.toPosition = this.position;
        this.toRotation = this.rotation;
        this.toZoom = this.zoom;

        this.positionResponse = 0.33;
        this.rotationResponse = 1;
        this.zoomResponse = 0.1;

        this.drawInfo = { drawn: 0, ignored: 0 }

        this.resize();
    }

    /**
    Make sure map is always scaled to the window.
    **/
    resize() {
        // Find pixel width of map
        this.dist = ((this.game.map.radius - 1) * 2) * this.game.map.tileSize;
        // Find scaling ratio based on screen size
        let ratio = this.dist / this.game.size;
        this.scale = 1 / ratio;
    }

    /**
    Update camera by getting input and reseting optimization statistics (called each frame).
    **/
    update() {
        let move = p5.createVector(0, 0);

        // Check for key presses
        if (this.game.keys[65]) {
            move.x += 1;
        }
        if (this.game.keys[68]) {
            move.x -= 1;
        }
        if (this.game.keys[87]) {
            move.y += 1;
        }
        if (this.game.keys[83]) {
            move.y -= 1;
        }
        // Normalize the velocity of the camera to a fixed speed
        move.normalize().mult(this.speed * p5.deltaTime);

        this.position.add(move); // Update the camera's position
        let xc = p5.map(this.zoom, this.zoomConstraint.min, this.zoomConstraint.max, 0, this.dist / 2);
        let yc = p5.map(this.zoom, this.zoomConstraint.min, this.zoomConstraint.max, 0, this.dist / 2);
        this.position.x = p5.constrain(this.position.x, -xc, xc);
        this.position.y = p5.constrain(this.position.y, -yc, yc);

        // Update the camera's zoom
        this.zoom += (this.game.scroll / this.zoomSensitivity) * p5.deltaTime;
        this.zoom = p5.constrain(this.zoom, this.zoomConstraint.min, this.zoomConstraint.max);

        // Smooth camera motion
        this.toPosition = P5.Vector.lerp(this.toPosition, this.position, this.positionResponse);
        this.toRotation = p5.lerp(this.toRotation, this.rotation, this.rotationResponse);
        this.toZoom = p5.lerp(this.toZoom, this.zoom, this.zoomResponse);

        this.drawInfo = { drawn: 0, ignored: 0 };
    }

    pass(through: (() => void)) {
        p5.push();
        p5.translate(p5.width / 2, p5.height / 2);
        p5.scale(this.toZoom * this.scale);
        p5.translate(this.toPosition.x - p5.width / 2, this.toPosition.y - p5.height / 2);
        p5.rotate(this.toRotation);
        through();
        p5.pop();
    }

    getPosition(mouse: Vector): Vector;

    getPosition(mouseX: number, mouseY: number): Vector;

    /**
     * Calculates the screen position of a point after camera transforms are applied.
     * @param arg1 - Vector to convert or the x-coordinate of the point
     * @param arg2 - The y-coordinate of the point
     * @returns Vecor of the point converted to screen-space coordinates
    */
    getPosition(arg1: Vector | number, arg2?: number): Vector {
        let mouse: Vector;
        if (arg1 instanceof Vector) {
            mouse = arg1;
        }
        else {
            mouse = p5.createVector(arg1, arg2);
        }

        // Set the center of the screen to be the origin
        mouse.x -= p5.width / 2;
        mouse.y -= p5.height / 2;

        // Scale the point by the zoom factor
        mouse.x /= this.toZoom * this.scale;
        mouse.y /= this.toZoom * this.scale;

        // Reset the origin to the top left
        mouse.x += p5.width / 2;
        mouse.y += p5.height / 2;

        // Apply the camera translation
        mouse.x -= this.toPosition.x;
        mouse.y -= this.toPosition.y;

        return mouse; // Return the transformed position
    }

    /**
     * Clipping between a bounding box and the camera viewport.
     * @param p - The position of the object to check
     * @param w - The width of the object
     * @param h - The hight of the object
     * @returns - True if the object is at least partially in the frame, false otherwise
    **/
    isWithinCamera(p: Vector, w: number, h: number = w): boolean {
        let topLeft = this.getPosition(new Vector(0, 0));
        let bottomRight = this.getPosition(new Vector(p5.width, p5.height));

        if (p.x < topLeft.x - w || p.x > bottomRight.x + w || p.y < topLeft.y - h || p.y > bottomRight.y + h) {
            this.drawInfo.ignored++;
            return false;
        }
        else {
            this.drawInfo.drawn++;
            return true;
        }
    }
}