export class HexPosition {
    row: number;
    col: number;
    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    public copyFrom(p: HexPosition) {
        this.row = p.row;
        this.col = p.col;
    }

    public copy(): HexPosition {
        return new HexPosition(this.row, this.col);
    }

    public getAdjacent(direction: number): HexPosition {
        return this;
    }

    public static Zero(): HexPosition {
        return new HexPosition(0, 0);
    }
}