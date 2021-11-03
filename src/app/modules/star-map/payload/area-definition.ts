import {G} from "@svgdotjs/svg.js";

export class AreaDefinition {

    private readonly referenceId: string;

    readonly referenceGroup: G;

    constructor(group: G) {
        this.referenceId = group.id();
        this.referenceGroup = group;
    }

    /**
     * checks if the given group is inside of the reference group but is not the same as the given group
     */
    isInside(group: G): boolean {
        if (group.id() === this.referenceId) {
            return false;
        }
        let box = group.bbox();
        let x = box.x;
        let y = box.y;

        let knownBox = this.referenceGroup.bbox();
        let leftBound = knownBox.x;
        let rightBound = leftBound + knownBox.width;

        let lowerBound = knownBox.y;
        let upperBound = lowerBound + knownBox.height;

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
