import { Vector, Image, Color } from "p5";

import { Game } from "./game";
import { p5 } from "./index";

import { TileManager, TileSprite, TileType, TileName } from "./tileManager";
import { Cube, Radial } from "./coordinates";
import { ShipSegment } from "./battleship";

export type Direction = 0 | 1 | 2 | 3 | 4 | 5;

export class Tile {
    map: Map;
    index: number;
    cube: Cube;
    position: Vector;
    sprite: TileSprite;
    shipSegment: ShipSegment;

    constructor(parent: Map, index: number, position: Vector, sprite: TileSprite) {
        this.map = parent;
        this.index = index;
        this.position = position;
        this.sprite = sprite;

        this.cube = Cube.FromIndex(index);
    }

    display() {
        if (this.map.mouseOver == this.index) {
            p5.tint(0, 200, 200);
        }
        else {
            p5.noTint();
        }

        p5.image(this.sprite.image, this.position.x, this.position.y, this.map.tileSize, this.map.tileSize);
    }

    getNeighbor(dir: Direction): number {
        return this.getNeighbors()[dir];
    }

    getNeighbors(): number[] {
        let neighbors: number[] = [];

        if (this.index == 0) {
            for (let i = 0; i < 6; i++) {
                neighbors[i] = Radial.Index(0, i);
            }
        }
        else {
            let layer = Radial.Layer(this.index);
            let position = Radial.Position(this.index, layer);

            let corner = layer <= 1 ? true : (Radial.Mod(position, layer) == layer - 1);

            if (corner) {
                neighbors = [
                    Radial.Index(layer - 1, position),
                    Radial.Index(layer, position - 1),
                    Radial.Index(layer, position + 1),
                    Radial.Index(layer + 1, position - 1),
                    Radial.Index(layer + 1, position),
                    Radial.Index(layer + 1, position + 1)
                ];
            }
            else {
                neighbors = [
                    Radial.Index(layer - 1, position - 1),
                    Radial.Index(layer - 1, position),
                    Radial.Index(layer, position - 1),
                    Radial.Index(layer, position + 1),
                    Radial.Index(layer + 1, position),
                    Radial.Index(layer + 1, position + 1)
                ];
            }
        }

        return neighbors;
    }
}

const shuffe = (arr: any[]): any[] => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export class Map {
    game: Game;
    radius: number;
    tileSize: number;
    position: (() => Vector);
    tiles: Tile[];
    mouseOver: number | null;

    tileManager: TileManager;

    constructor(game: Game, info?: { radius?: number, tileSize?: number, position?: (() => Vector), tileTypes?: TileType[] }) {
        this.game = game;
        this.radius = info?.radius ?? 6;
        this.tileSize = info?.tileSize ?? 50;
        this.position = info?.position ?? (() => this.game.center);
        this.tiles = [];
        this.mouseOver = null;

        this.tileManager = new TileManager(info?.tileTypes);

        this.generate();
    }

    generate() {
        this.tiles = [];

        let surfaces = [];
        const arrSize = this.radius * 2 + 1;
        for (let i = 0; i < arrSize; i++) {
            surfaces.push()
        }

        const pointer = p5.createVector(0, 0);
        const sqrt3 = Math.sqrt(3);

        let direction = 5;
        for (let layer = 0; layer < this.radius; layer++) {
            let layerSize = layer == 0 ? 1 : 6 * layer;
            for (let pos = 0; pos < layerSize; pos++) {
                let i = layer == 0 ? 0 : Radial.Index(layer, pos);
                let r = layer == 0 ? 0 : Radial.Layer(i);
                let p = layer == 0 ? 0 : Radial.Position(i, r);

                const corner = layer <= 1 ? true : (Radial.Mod(p, r) == r - 1);

                if (p == layerSize - 1) {
                    direction = 5;
                }
                else if (corner && direction != 5) {
                    direction = Radial.Mod(direction + 1, 6);
                }

                this.createTile(i, p5.createVector(pointer.x, pointer.y), "default");

                const theta = direction * Math.PI / 3;
                pointer.x += this.tileSize / 2 * Math.cos(theta) * sqrt3;
                pointer.y += this.tileSize / 2 * Math.sin(theta) * sqrt3;

                if (p == layerSize - 1) {
                    direction = 0;
                }
            }
        }
    }

    fetch(index: number): Tile | null {
        return (index >= 0 && index < this.tiles.length) ? this.tiles[index] : null;
    }

    getNeighbor(tile: Tile | number, direction: Direction): Tile | null {
        let search = tile instanceof Tile ? tile : this.tiles[tile];
        return this.fetch(search.getNeighbor(direction));
    }

    /**
     * Create a new tile and add it to the map
     * @param index - The unique index of the tile to be created
     * @param position - The world position of the tile in the map
     * @param type - The tipe of tile to be added
     */
    createTile(index: number, position: Vector, type: TileName) {
        let tile = new Tile(this, index, position,
            this.tileManager.getSpriteByName(type));

        this.tiles.push(tile);
    }

    /**
     * Converts a world-space postion to cube coordinates
     * @param point - Position to be converted
     * @returns - Cube coordinate position
     */
    pointToCube(point: Vector): Cube {
        let size = this.tileSize / 2;
        let q = (Math.sqrt(3) / 3 * point.x - 1 / 3 * point.y) / size;
        let r = (2 / 3 * point.y) / size;
        return Cube.Round({ q: q, r: r, s: -q - r });
    }

    /**
     * Draw the map to the screen
     */
    display() {
        let over = this.pointToCube(p5.createVector(this.game.mouse.x - this.position().x, this.game.mouse.y - this.position().y)).convert();
        this.mouseOver = over == p5.constrain(over, 0, this.tiles.length) ? over : null;

        p5.push();
        p5.imageMode(p5.CENTER);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.translate(this.position().x, this.position().y);
        for (let tile of this.tiles) {
            if (!this.game.camera.isWithinCamera(Vector.add(this.position(), tile.position), this.tileSize)) continue;
            tile.display();
        }
        p5.pop();
    }
}