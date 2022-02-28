import {G} from "@svgdotjs/svg.js";
import {Orbit} from "../../../services/swagger";

export class CelestialAreaDefinition {

    readonly referenceId: string;

    readonly referenceOrbit: Orbit;

    private readonly radius: number;

    constructor(orbit: Orbit, orbitId: string, radius: number) {
        this.referenceOrbit = orbit;
        this.referenceId = orbitId;
        this.radius = radius;
    }

    /**
     * checks if the given points are inside of the reference orbit
     */
    isInside(group: G): boolean {
        let box = group.bbox();
        let x = box.x;
        let y = box.y;

        let leftBound = this.referenceOrbit.xCoordinate.coordinate - this.radius;
        let rightBound = this.referenceOrbit.xCoordinate.coordinate + this.radius;

        let lowerBound = this.referenceOrbit.yCoordinate.coordinate - this.radius;
        let upperBound = this.referenceOrbit.yCoordinate.coordinate + this.radius;

        let xFit: boolean = false;
        let yFit: boolean = false;
        if (x >= leftBound && x <= rightBound) {
            xFit = true;
        }
        if (y >= lowerBound && y <= upperBound) {
            yFit = true;
        }
        return xFit && yFit;
    }
}
