import { HexPosition } from "../../shared/hexPosition";

abstract class Entity {
    position: HexPosition;

    constructor(position: HexPosition) {
        this.position = position;
    }
}