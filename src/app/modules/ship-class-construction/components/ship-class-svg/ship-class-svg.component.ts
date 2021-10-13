import {AfterViewInit, Component, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AlignedFitting, ShipClass} from "../../../../services/swagger";
import {ArrayXY, G, Polygon, Svg, SVG} from "@svgdotjs/svg.js";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-ship-class-svg',
    templateUrl: './ship-class-svg.component.html',
    styleUrls: ['./ship-class-svg.component.scss']
})
export class ShipClassSvgComponent implements AfterViewInit, OnChanges {

    private subscriptions: Subscription[] = [];

    /**
     * The user selected ShipClass.
     */
    @Input()
    selectedShipClassInput?: ShipClass;
    selectedShipClassInputDefinition: string = "selectedShipClassInput";

    @Input()
    weaponsAmountByAlignmentInput?: EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>>;
    weaponsAmountByAlignmentInputDefinition: string = "weaponsAmountByAlignmentInput";

    /**
     * the css selector which is used to describe the svg div
     */
    @Input()
    svgSelector?: string;

    svgPresent: EventEmitter<Boolean> = new EventEmitter<Boolean>();

    canvas?: Svg;

    private upperBow?: Polygon;
    private upperBowPoints?: ArrayXY[];

    private upperBroadside?: Polygon;
    private upperBroadsidePoints?: ArrayXY[];
    private upperBroadsideGroup?: G;

    private upperStern?: Polygon;
    private upperSternPoints?: ArrayXY[];

    private lowerBow?: Polygon;
    private lowerBowPoints?: ArrayXY[];

    private lowerBroadside?: Polygon;
    private lowerBroadsidePoints?: ArrayXY[];
    private lowerBroadsideGroup?: G;

    private lowerStern?: Polygon;
    private lowerSternPoints?: ArrayXY[];

    /**
     * waits for the event that indicates that the template of the parent component is rendered
     */
    @Input()
    isTemplateRenderedInput?: EventEmitter<boolean>;
    isTemplateRenderedInputDefinition: string = "isTemplateRenderedInput";

    constructor() {
    }

    ngAfterViewInit(): void {
        this.createCanvas();
        this.createHullOutlines();

    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedShipClassInputDefinition]) {
            if (!this.selectedShipClassInput) {
                this.clearCanvas();
            }
            this.createHullOutlines();
            this.createWeaponSlots(undefined);
        }
        if (changes[this.isTemplateRenderedInputDefinition]) {
            if (!!this.isTemplateRenderedInput) {
                let sub = this.isTemplateRenderedInput.subscribe(event => {
                    if (event) {
                        this.createCanvas();
                        this.createHullOutlines();
                        this.createWeaponSlots(undefined);
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        if (changes[this.weaponsAmountByAlignmentInputDefinition]) {
            if (!!this.weaponsAmountByAlignmentInput) {
                let sub = this.weaponsAmountByAlignmentInput.subscribe(event => {
                    this.clearCanvas();
                    this.createHullOutlines();
                    this.createWeaponSlots(event);
                });
                this.subscriptions.push(sub);
            }
        }
    }

    /**
     * creates the canvas and emits there presence
     * @private
     */
    private createCanvas() {
        if (!this.canvas) {
            if (this.checkIfSvgDivExists()) {
                this.canvas = SVG().addTo('#' + this.svgSelector).panZoom();
                this.canvas!.viewbox({
                    x: 0,
                    y: 0,
                    width: 700,
                    height: 120
                });
                this.svgPresent.emit(true);
            }
        }
    }

    /**
     * returns if the svg div exists
     * @private
     */
    private checkIfSvgDivExists(): boolean {
        return !!document.getElementById(this.svgSelector!);
    }

    /**
     * creates the weapon slots
     *
     * @private
     */
    private createWeaponSlots(event?: Map<AlignedFitting.WeaponAlignmentEnum, number>) {
        if (!!this.canvas) {
            let map: Map<AlignedFitting.WeaponAlignmentEnum, number> = new Map<AlignedFitting.WeaponAlignmentEnum, number>();
            if (!!this.selectedShipClassInput && !event) {
                let fittings: AlignedFitting[] = this.selectedShipClassInput!.fittings;
                fittings.forEach(fitting => {
                    let amount: number = fitting.amount;
                    let weaponAlignment: AlignedFitting.WeaponAlignmentEnum = fitting.weaponAlignment;
                    if (map.has(weaponAlignment)) {
                        map.set(weaponAlignment, map.get(weaponAlignment)! + amount);
                    } else {
                        map.set(weaponAlignment, amount);
                    }
                });
            }
            if (!!event && event.size > 0) {
                // if the user selected more
                map = event;
            }
            map.forEach((amount, weaponAlignment) => {
                let half: number[];
                let firstHalfSeparated: number[];
                let secondHalfSeparated: number[];
                switch (weaponAlignment) {
                    case "BOW":
                        half = ShipClassSvgComponent.calculateHalf(amount);
                        firstHalfSeparated = ShipClassSvgComponent.calculateHalf(half[0]);
                        this.drawSloperLineWeaponSlots(firstHalfSeparated[0], this.upperBowPoints!, "below", "bigger", 3, 2);
                        this.drawBaseLineWeaponSlots(firstHalfSeparated[1], this.upperBowPoints!, "above", "bigger", 3, 2);

                        secondHalfSeparated = ShipClassSvgComponent.calculateHalf(half[1]);
                        this.drawSloperLineWeaponSlots(secondHalfSeparated[0], this.lowerBowPoints!, "above", "bigger", 3, 2);
                        this.drawBaseLineWeaponSlots(secondHalfSeparated[1], this.lowerBowPoints!, "below", "bigger", 3, 2);

                        break;
                    case "BROADSIDE":
                        this.createBroadSideSlots(amount, this.upperBroadsidePoints!, this.upperBroadsideGroup!);
                        this.createBroadSideSlots(amount, this.lowerBroadsidePoints!, this.lowerBroadsideGroup!);
                        break;
                    case "STERN":
                        half = ShipClassSvgComponent.calculateHalf(amount);
                        firstHalfSeparated = ShipClassSvgComponent.calculateHalf(half[0]);
                        this.drawSloperLineWeaponSlots(firstHalfSeparated[0], this.upperSternPoints!, "below", "smaller", 3, 2);
                        this.drawBaseLineWeaponSlots(firstHalfSeparated[1], this.upperSternPoints!, "above", "smaller", 3, 2);

                        secondHalfSeparated = ShipClassSvgComponent.calculateHalf(half[1]);
                        this.drawSloperLineWeaponSlots(secondHalfSeparated[0], this.lowerSternPoints!, "above", "smaller", 3, 2);
                        this.drawBaseLineWeaponSlots(secondHalfSeparated[1], this.lowerSternPoints!, "below", "smaller", 3, 2);

                        break;
                }
            });

        }
    }

    /**
     * calculates just the half and secures that nothing bas been left
     *
     * @param amount the amount to separate
     * @private
     */
    private static calculateHalf(amount: number): number[] {
        let firstHalf = Math.floor(amount / 2);
        let secondHalf = amount - firstHalf;
        return [firstHalf, secondHalf];
    }

    /**
     * calculates and draws the given amount of points into the given group based on the boundaries of the given points
     *
     * @param amount the amount of slots to draw
     * @param pointsArray the points array which represents the boundaries
     * @param svgGroup the svg group to draw into
     * @private
     */
    private createBroadSideSlots(amount: number, pointsArray: ArrayXY[], svgGroup: G) {
        let upperBox: number[] = this.detectBox(pointsArray);
        let upperCirclesToDeploy: ArrayXY[] = this.equalizeSlotsInBox(upperBox, amount, 3, 2);

        for (let i = upperCirclesToDeploy.length - 1; i >= 0; i--) {
            let slot = upperCirclesToDeploy[i];
            svgGroup.circle()
                .x(slot[0])
                .y(slot[1])
                .fill("green")
                .radius(3);
        }
    }

    /**
     * creates the hull outlines
     *
     * @private
     */
    private createHullOutlines() {
        let sub = this.svgPresent.subscribe(event => {
            if (!event) {
                this.createCanvas();
            }

            let lines: ArrayXY[];
            lines = []; // upper bow
            lines.push([500, 20]);
            lines.push([550, 30]);
            lines.push([550, 15]);
            lines.push([590, 15]);
            lines.push([650, 35]);
            lines.push([650, 55]);
            lines.push([500, 55]);
            lines.push([500, 20]);
            this.upperBow = this.canvas!.polygon(lines).fill("none").stroke({color: "red", width: 1});
            this.upperBowPoints = lines;

            lines = [];
            lines.push([350, 20]);  // upper broadside
            lines.push([500, 20]);
            lines.push([500, 55]);
            lines.push([200, 55]);
            lines.push([200, 20]);
            lines.push([350, 20]);
            this.upperBroadsideGroup = this.canvas?.group().id("upperBroadsideGroup").addClass("flex-broadside");
            this.upperBroadside = this.upperBroadsideGroup!.polygon(lines).fill("none").stroke({
                color: "red",
                width: 1
            });
            this.upperBroadsidePoints = lines;

            lines = []; // upper stern
            lines.push([50, 55]);
            lines.push([50, 35]);
            lines.push([110, 15]);
            lines.push([150, 15]);
            lines.push([150, 30]);
            lines.push([200, 20]);
            lines.push([200, 55]);
            lines.push([50, 55]);
            this.upperStern = this.canvas!.polygon(lines).fill("none").stroke({color: "red", width: 1});
            this.upperSternPoints = lines;

            lines = []; // lower stern
            lines.push([200, 65]);
            lines.push([200, 100]);
            lines.push([150, 90]);
            lines.push([150, 105]);
            lines.push([110, 105]);
            lines.push([50, 85]);
            lines.push([50, 65]);
            lines.push([200, 65]);
            this.lowerStern = this.canvas!.polygon(lines).fill("none").stroke({color: "red", width: 1});
            this.lowerSternPoints = lines;

            lines = [];
            lines.push([500, 100]); // lower broadside
            lines.push([500, 65]);
            lines.push([200, 65]);
            lines.push([200, 100]);
            lines.push([500, 100]);
            this.lowerBroadsideGroup = this.canvas?.group().id("lowerBroadsideGroup").addClass("flex-broadside");
            this.lowerBroadside = this.lowerBroadsideGroup!.polygon(lines).fill("none").stroke({
                color: "red",
                width: 1
            });
            this.lowerBroadsidePoints = lines;

            lines = [];
            lines.push([650, 65]); // lower bow
            lines.push([650, 85]);
            lines.push([590, 105]);
            lines.push([550, 105]);
            lines.push([550, 90]);
            lines.push([500, 100]);
            lines.push([500, 65]);
            this.lowerBow = this.canvas!.polygon(lines).fill("none").stroke({color: "red", width: 1});
            this.lowerBowPoints = lines;
        });
        this.subscriptions.push(sub);
    }

    /**
     * checks the four most outer points of an points array
     *
     * will return an array which consists of
     * - [0] = minX
     * - [1] = maxX
     * - [2] = minY
     * - [3] = maxY
     *
     * @param param the points array
     * @private
     */
    private detectBox(param: ArrayXY[]): number[] {
        let minX = Number.MAX_VALUE;
        let maxX = Number.MAX_VALUE * -1;
        let minY = Number.MAX_VALUE;
        let maxY = Number.MAX_VALUE * -1;
        param.forEach(point => {
            let x = point[0];
            let y = point[1];

            if (minX > x) {
                minX = x;
            }
            if (maxX < x) {
                maxX = x;
            }
            if (minY > y) {
                minY = y;
            }
            if (maxY < y) {
                maxY = y;
            }
        });
        return [minX, maxX, minY, maxY];
    }

    /**
     * distributes the given amount equally in the box
     *
     * @param upperBox the boundary
     * @param amount the amount of points to spread
     * @param radius the radius of the slots in px
     * @param margin the margin around the circle in px
     * @private
     */
    private equalizeSlotsInBox(upperBox: number[], amount: number, radius: number, margin: number): ArrayXY[] {

        let minX = upperBox[0];
        let maxX = upperBox[1];
        let minY = upperBox[2];
        let maxY = upperBox[3];

        let rangeX = maxX - minX;
        let rangeY = maxY - minY;

        let slotsPerRow = Math.floor(rangeX / (3 * radius + 2 * margin));
        let columnsPerBox = Math.floor(rangeY / (radius + margin));
        let columnsNeeded = Math.ceil(amount / slotsPerRow);
        if (columnsNeeded > columnsPerBox) {
            return this.equalizeSlotsInBox(upperBox, amount, --radius, --margin);
        }

        // define y position
        let midY = rangeY / 2;
        let columnPositions: number[] = [];
        if (columnsNeeded == 1) {
            columnPositions.push(midY);
        } else if (columnsNeeded == 2) {
            columnPositions.push(midY - rangeY / 4);
            columnPositions.push(midY + rangeY / 4);
        } else if (columnsNeeded == 3) {
            columnPositions.push(midY - rangeY / 5);
            columnPositions.push(midY);
            columnPositions.push(midY + rangeY / 5);
        }

        // define x positions
        let distanceX = rangeX / slotsPerRow;
        let midX = rangeX / 2;
        let result: ArrayXY[] = [];
        let flowingX = midX;
        let incrementor = 1;
        for (let i = 1; i <= amount;) {
            for (let j = 0; j < columnPositions.length; j++) {
                if (i <= amount) {
                    result.push([flowingX, columnPositions[j]]);
                    i++;
                }
            }
            // add the position and flip it to other side of the mid position
            flowingX = flowingX + (incrementor % 2 == 0 ? 1 : -1) * (incrementor * distanceX);
            incrementor++;
        }

        // adding the svg view box offset
        let result2: ArrayXY[] = [];
        result.forEach(point => result2.push([minX + point[0], minY + point[1]]));
        return result2;
    }

    /**
     * calculates the longest sloper in a bow or stern section
     *
     * @param points the points
     * @private
     */
    private calculateLongestSloper(points: ArrayXY[]): ArrayXY[] {

        let sloper: ArrayXY[][] = [];
        for (let i = 0; i < points.length; i++) {
            // points to watch are neighbors but neither at the start nor end
            let currentPoint = points[i];
            let otherPoint;
            if (i + 1 < points.length) {
                otherPoint = points[i + 1];
            } else {
                otherPoint = points[i - 1];
            }

            if (ShipClassSvgComponent.pointDiffersCompletely(currentPoint, otherPoint)) {
                sloper.push([currentPoint, otherPoint]);
            }
        }

        let sortedSloper: ArrayXY[][] = sloper.sort((a, b) => ShipClassSvgComponent.calculateDistance(a[0], a[1]) < ShipClassSvgComponent.calculateDistance(b[0], b[1]) ? -1 : 1);
        return sortedSloper[sortedSloper.length - 1];
    }

    /**
     * calculates the distance between two points
     *
     * @param firstCoordinate the first coordinate
     * @param secondCoordinate the second coordinate
     * @private
     */
    private static calculateDistance(firstCoordinate: ArrayXY, secondCoordinate: ArrayXY): number {
        return Math.sqrt(Math.pow(firstCoordinate[0] - secondCoordinate[0], 2) + Math.pow(firstCoordinate[1] - secondCoordinate[1], 2));
    }

    /**
     * checks if two points differ in both components
     *
     * @param one one point
     * @param two the other point
     * @private
     */
    private static pointDiffersCompletely(one: ArrayXY, two: ArrayXY): boolean {
        return one[0] != two[0] && one[1] != two[1];
    }

    /**
     * calculates the baseline in a bow or stern section
     *
     * @param points the points
     * @private
     */
    private calculateBaseLine(points: ArrayXY[]): ArrayXY[] {
        let baseline: ArrayXY[][] = [];
        for (let i = 0; i < points.length; i++) {
            // points to watch are possibly at the start or end of the array so watch every neighbor
            let currentPoint = points[i];
            let otherPoint;
            if (i + 1 < points.length) {
                otherPoint = points[i + 1];
            } else if (i == points.length - 1) {
                otherPoint = points[0];
            } else {
                otherPoint = points[i - 1];
            }

            if (ShipClassSvgComponent.pointDiffersInX(currentPoint, otherPoint)) {
                baseline.push([currentPoint, otherPoint]);
            }
        }

        let sortedSloper: ArrayXY[][] = baseline.sort((a, b) => ShipClassSvgComponent.sortCoordinates(a, b));
        return sortedSloper[sortedSloper.length - 1];
    }

    /**
     * sorts the coordinates by distance to each others points
     *
     * @param a first coord
     * @param b second coord
     * @private
     */
    private static sortCoordinates(a: ArrayXY[], b: ArrayXY[]) {
        return ShipClassSvgComponent.calculateDistance(a[0], a[1]) < ShipClassSvgComponent.calculateDistance(b[0], b[1]) ? -1 : 1;
    }

    /**
     * checks if two points differs only in the x coordinate
     *
     * @param one the first
     * @param two the second
     * @private
     */
    private static pointDiffersInX(one: ArrayXY, two: ArrayXY): boolean {
        return one[0] != two[0] && one[1] == two[1];
    }

    /**
     * draws weapon slots at the longest sloper
     *
     * @param amount the amount of slots to draw
     * @param sectionPoints the points of the section
     * @param belowOrAboveBaseline if the slots should be drawn above or below the baseline
     * @param xStartAt if the segment starts at the bigger or smaller value
     * @param radius the radius of a slot
     * @param margin the margin around a slot
     * @private
     */
    private drawBaseLineWeaponSlots(amount: number, sectionPoints: ArrayXY[], belowOrAboveBaseline: string,
                                    xStartAt: string, radius: number, margin: number) {
        if (!this.canvas) {
            return;
        }
        let baseLine: ArrayXY[] = this.calculateBaseLine(sectionPoints);

        let start: ArrayXY;
        let end: ArrayXY;
        if (baseLine[0] > baseLine[1]) {
            start = baseLine[0];
            end = baseLine[1];
        } else {
            start = baseLine[1];
            end = baseLine[0];
        }
        // define first and second point and direction
        let biggerOrSmaller: number;
        if (xStartAt === "bigger") {
            biggerOrSmaller = -1;
        } else if (xStartAt === "smaller") {
            biggerOrSmaller = 1;
        } else {
            return;
        }

        let aboveOrBelow: number;
        if (belowOrAboveBaseline === "below") {
            aboveOrBelow = 1;
        } else if (belowOrAboveBaseline === "above") {
            aboveOrBelow = -1;
        } else {
            return;
        }

        let x1 = start[0];
        let y1 = start[1];

        let x2 = end[0];

        let biggerX = x2 > x1 ? x2 : x1;
        let smallerX = x2 < x1 ? x2 : x1;
        let rangeX = biggerX - smallerX;

        let slotsPerRow = Math.floor(rangeX / (3 * radius + 2 * margin));
        let distanceX = rangeX / slotsPerRow;

        let columnAmount = Math.ceil(amount / slotsPerRow);
        let startX = x1 + biggerOrSmaller * margin * 4;
        let startY = y1 + aboveOrBelow * margin;
        for (let i = 0; i < amount; i++) {
            if (i > slotsPerRow - 1) {
                return;
            }
            for (let j = 0; j < columnAmount; j++) {
                this.canvas!.circle()
                    .x(startX + biggerOrSmaller * i * distanceX)
                    .y(startY + aboveOrBelow * (radius + margin))
                    .fill("green")
                    .radius(3);
            }
        }
    }

    /**
     * draws the slots at the sloper line
     *
     * @param amount the amount of slots to draw
     * @param sectionPoints the points of the section
     * @param belowOrAboveBaseline if the slots should be drawn above or below the baseline
     * @param xStartAt if the segment starts at the bigger or smaller value
     * @param radius the radius of a slot
     * @param margin the margin around a slot
     * @private
     */
    private drawSloperLineWeaponSlots(amount: number, sectionPoints: ArrayXY[], belowOrAboveBaseline: string,
                                      xStartAt: string, radius: number, margin: number) {
        let sloperLine: ArrayXY[] = this.calculateLongestSloper(sectionPoints!);

        let start: ArrayXY;
        let end: ArrayXY;
        if (sloperLine[0] > sloperLine[1]) {
            start = sloperLine[0];
            end = sloperLine[1];
        } else {
            start = sloperLine[1];
            end = sloperLine[0];
        }
        // define first and second point and direction
        let biggerOrSmaller: number;
        if (xStartAt === "bigger") {
            biggerOrSmaller = -1;
        } else if (xStartAt === "smaller") {
            biggerOrSmaller = 1;
        } else {
            return;
        }

        let aboveOrBelow: number;
        if (belowOrAboveBaseline === "below") {
            aboveOrBelow = 1;
        } else if (belowOrAboveBaseline === "above") {
            aboveOrBelow = -1;
        } else {
            return;
        }

        let x1 = start[0];
        let y1 = start[1];

        let x2 = end[0];
        let y2 = end[1];

        let slope: number = (y2 - y1) / (x2 - x1);

        let distance = ShipClassSvgComponent.calculateDistance(start, end);
        let slotsPerRow = Math.floor(distance / (2 * radius + 2 * margin));

        let referenceSlots: ArrayXY[] = [];
        let radiusModifier: number = radius + margin;
        for (let i = 1; i <= amount; i++) {
            let row: number = Math.ceil(i / slotsPerRow);
            if (row > 2) {
                // hard stop at two rows
                return;
            }
            let xCoord;
            let yCoord;
            if (row == 1) {
                xCoord = x1 + (biggerOrSmaller * i) * 2 * radiusModifier;
                yCoord = slope * (xCoord - x1) + y1 + (aboveOrBelow * row) * radiusModifier;
                referenceSlots.push([xCoord, yCoord]);
            } else {
                let referenceSlot: ArrayXY = referenceSlots[i - ((row - 1) * slotsPerRow) - 1];
                xCoord = referenceSlot[0] + (biggerOrSmaller * row) * (3 * radiusModifier);
                yCoord = referenceSlot[1];
            }

            this.canvas!.circle()
                .x(xCoord)
                .y(yCoord)
                .fill("green")
                .radius(3);
        }
    }

    /**
     * removes all children of the canvas and creates them as new
     * @private
     */
    private clearCanvas() {
        if (!!this.canvas) {
            this.canvas.children().forEach(element => this.canvas!.removeElement(element));
            this.svgPresent.emit(true);
        }
    }
}
