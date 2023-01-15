import { Color, Graphics, Image } from "p5";
import { p5 } from "./index";

export type TileName = "default" | "water" | "island";

export type TileType = {
    name: TileName;
    color: Color;
    borderColor?: Color;
    size?: number;
}

export class TileSprite {
    type: TileType;
    image: Image;

    constructor(type: TileType, image: Image) {
        this.type = type;
        this.image = image;
    }
}

export class TileManager {
    types: TileType[];
    tileSprites: TileSprite[];

    constructor(types: TileType[]) {
        this.types = types;

        this.tileSprites = [];

        for (let tileType of this.types) {
            let sprite = TileManager.generate(tileType);
            this.tileSprites.push(new TileSprite(tileType, sprite));
        }
    }

    /**
     * Returns the sprite for a tile of the given name.
     * @param name - Name of the type of tile to find the sprite for
     * @returns - A tile sprite which combines a type and a p5.Image object
    */
    getSpriteByName(name: TileName): TileSprite {
        let result = this.tileSprites.filter(t => t.type.name == name)[0];
        return result;
    }

    /**
     * Generates the image sprite for a tile.
     * @param type - The name of the tile style to use
     * @returns - A p5.Image object of the rendered tile
    */
    static generate(type: TileType): Image {
        let size = type.size ?? 100;

        const output = p5.createImage(size, size);  // Create the output image

        const canvas = p5.createGraphics(size, size);  // Create the canvas to draw on

        canvas.clear(0, 0, 0, 0);
        canvas.push(); // Preserve style
        canvas.fill(type.color); // Set hexagon background color
        if (type.borderColor) {
            canvas.stroke(type.borderColor); // Set heagon border color
        }
        else {
            canvas.noStroke();
        }
        // Draw the hexagon
        canvas.beginShape();
        let deltaTheta = Math.PI / 3;  // Radians between vertexes
        for (let i = 0; i < 6; i++) {  // Create 6 vertexes
            canvas.vertex((1 + Math.sin(i * deltaTheta)) * size / 2,
                (1 + Math.cos(i * deltaTheta)) * size / 2);
        }
        canvas.endShape(p5.CLOSE); // End drawing the hexagon
        canvas.pop(); // Reset style

        // Copy the canvas content to the image
        output.copy(canvas,
            0, 0, size, size,
            0, 0, size, size);

        return output; // Return the image
    }
}



