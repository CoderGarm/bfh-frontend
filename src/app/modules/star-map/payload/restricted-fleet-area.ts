import {ArrayXY} from "@svgdotjs/svg.js";

export class RestrictedFleetArea {
    private minX: number = Number.MAX_VALUE
    private maxX: number = -1 * Number.MAX_VALUE;
    private minY: number = Number.MAX_VALUE;
    private maxY: number = -1 * Number.MAX_VALUE;

    constructor(fleetSharkPoints: ArrayXY[]) {
        fleetSharkPoints.forEach(polyPair => {
            let polyX: number = polyPair[0];
            if (polyX < this.minX) {
                this.minX = polyX;
            }
            if (polyX > this.maxX) {
                this.maxX = polyX;
            }

            let polyY: number = polyPair[1];
            if (polyY < this.minY) {
                this.minY = polyY;
            }
            if (polyY > this.maxY) {
                this.maxY = polyY;
            }
        });
    }

    /**
     * checks if the given amount of points are colliding with this
     *
     * @param restrictedFleetAreaPoints the points
     */
    collides(restrictedFleetAreaPoints: ArrayXY[]) {
        let collidesWith = false;
        restrictedFleetAreaPoints.forEach(polyPair => {
            let xCoordinate: number = polyPair[0];
            let yCoordinate: number = polyPair[1];
            if (xCoordinate > this.minX && xCoordinate < this.maxX && yCoordinate > this.minY && yCoordinate < this.maxY) {
                collidesWith = true;
            }
        });
        return collidesWith;
    }
}