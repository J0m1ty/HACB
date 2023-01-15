import { Vector } from "p5";

export class Cube {
    q: number;
    r: number;
    s: number;

    constructor(q: number, r: number, s: number) {
        this.q = q;
        this.r = r;
        this.s = s;

        if (this.q + this.r + this.s != 0) {
            throw new Error(`invalid cube coordinates: ${this.q} + ${this.r} + ${this.s} = ${this.q + this.r + this.s}, should equal 0`);
        }
    }

    convert(): number {
        let x = this.q;
        let y = this.r;
        let z = this.s;

        let layer = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));

        let p: number;
        if (x >= 0 && y >= 0) { p = x; }
        else if (y < 0 && z < 0) { p = layer - y; }
        else if (x >= 0 && z >= 0) { p = 2 * layer + z; }
        else if (x < 0 && y < 0) { p = 3 * layer - x; }
        else if (y >= 0 && z >= 0) { p = 4 * layer + y; }
        else if (x < 0 && z < 0) { p = 5 * layer - z; }

        return Radial.Index(layer, Radial.Mod(((3 * (layer - 1)) + 2) - p, layer * 6));
    }

    toString(axial: boolean = true): string {
        return `${this.q}, ${this.r}${axial ? `` : `, ${this.s}`}`;
    }

    static FromIndex(index: number) {
        if (index == 0) return new Cube(0, 0, 0);

        let layer = Radial.Layer(index);
        let position = Radial.Position(index, layer) - (layer - 1);

        let k = Radial.Mod(Math.floor(position / layer), 6);
        let j = Radial.Mod(position, layer);

        let x: number, y: number, z: number;

        // Weird stack overflow answer magic
        switch (k) {
            case 0:
                x = j;
                y = layer - j;
                z = -layer;
                break;
            case 1:
                x = layer;
                y = -j;
                z = j - layer;
                break;
            case 2:
                x = layer - j;
                y = -layer;
                z = j;
                break;
            case 3:
                x = -j;
                y = j - layer;
                z = layer;
                break;
            case 4:
                x = -layer;
                y = j;
                z = layer - j;
                break;
            case 5:
                x = j - layer;
                y = layer;
                z = -j;
                break;
        }

        return new Cube(-z, -y, -x);
    }

    static Round(frac: { q: number, r: number, s: number }): Cube {
        let q = Math.round(frac.q);
        let r = Math.round(frac.r);
        let s = Math.round(frac.s);

        let qd = Math.abs(q - frac.q);
        let rd = Math.abs(r - frac.r);
        let sd = Math.abs(s - frac.s);

        if (qd > rd && qd > sd) { q = -r - s; }
        else if (rd > sd) { r = -q - s; }
        else { s = -q - r; }

        return new Cube(q, r, s);
    }
}

export class Radial {
    static Layer(index: number): number {
        if (index == 0) return 0;
        return Math.floor((3 + Math.sqrt(12 * index - 3)) / 6);
    }

    static Position(index: number, layer: number): number {
        if (layer == 0 || index == 0) return 0;
        return index - 3 * layer * (layer - 1) - 1;
    }

    static Index(layer: number, position: number): number {
        if (layer == 0) return 0;
        return 3 * layer * (layer - 1) + 1 + position;
    }

    static Mod(x: number, y: number): number {
        if (y === 0) return 0;
        return ((x % y) + y) % y;
    }
}