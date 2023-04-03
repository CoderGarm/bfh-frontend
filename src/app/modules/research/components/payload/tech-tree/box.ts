export class Box {

    readonly x1: number;
    readonly x2: number;
    readonly y1: number;
    readonly y2: number;

    constructor(x: number, y: number, width: number, height: number, radius: number) {
        this.x1 = x;
        this.x2 = x + width;
        this.y1 = y;
        this.y2 = y + height;
    }

    isInside(x: number, y: number): boolean {
        let xFit: boolean = false;
        let yFit: boolean = false;
        if (x >= this.x1 && x <= this.x2) {
            xFit = true;
        }
        if (y >= this.y1 && y <= this.y2) {
            yFit = true;
        }
        return xFit && yFit;
    }

    getWidth() {
        return Math.max(this.x1, this.x2) - Math.min(this.x1, this.x2);
    }

    getHeight() {
        return Math.max(this.y1, this.y2) - Math.min(this.y1, this.y2);
    }

    getCenter(): { x: number, y: number } {
        return {x: this.x1 + (this.getWidth() / 2), y: this.y1 + (this.getHeight() / 2)};
    }
}
