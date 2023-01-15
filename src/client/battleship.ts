import { Vector } from "p5";
import { Direction, Tile } from "./map";

export enum NavalUnit {
    "patrol" = 1,
    "submarine" = 2,
    "destroyer" = 2,
    "battleship" = 3,
    "carrier" = 4,
};

export class ShipSegment {
    ship: Ship;
    tile: Tile;

    constructor(ship: Ship, tile: Tile) {
        this.ship = ship;
        this.tile = tile;
        this.tile.shipSegment = this;
    }
}

export class Ship {
    type: NavalUnit;
    origin: Tile;
    dir: Direction;

    components: ShipSegment[];

    constructor(type: NavalUnit, origin: Tile, dir: Direction, cb: (err: boolean) => never) {
        this.type = type;
        this.origin = origin;
        this.dir = dir;

        let recent = this.origin;
        for (let i = 0; i < this.type; i++) {
            this.components.push(new ShipSegment(this, recent));
            recent = recent.map.getNeighbor(recent, this.dir);
        }
    }

    static checkValid(type: NavalUnit, origin: Tile, dir: Direction): boolean {
        let check = origin;
        for (let i = 0; i < type; i++) {
            if (check.shipSegment) {return false;}
            check = check.map.getNeighbor(check, dir);
        }
        return true;
    }
}