import {ArrayXY, Circle, Polygon, Shape, StrokeData, Svg, Text} from "@svgdotjs/svg.js";
import {Fleet, FleetOrbit, Orbit} from "../../services/swagger";
import {timer} from "rxjs";
import {RestrictedFleetArea} from "./restricted-fleet-area";

export type EViewBoxType = 'UNIVERSE' | 'STAR_SYSTEM';
export const EViewBoxType = {
    UNIVERSE: 'UNIVERSE' as EViewBoxType,
    STAR_SYSTEM: 'STAR_SYSTEM' as EViewBoxType
};

export class ViewHelper {

    private orbits?: Orbit[];

    smallestXOrbit?: Orbit;
    biggestXOrbit?: Orbit;
    smallestYOrbit?: Orbit;
    biggestYOrbit?: Orbit;

    canvas?: Svg;

    private CELESTIAL_BODY_SELECTOR_ID_PREFIX: string = Math.random() + "-orbit";
    private ORBIT_SELECTOR_ID_PREFIX: string = Math.random() + "-orbit";
    private FLEET_SHARK__SELECTOR_ID_PREFIX: string = Math.random() + "-fleet-shark";

    private celestialBodySvgMap: Map<String, Circle> = new Map<String, Circle>();
    private celestialBodyMap: Map<String, Orbit> = new Map<String, Orbit>();

    private orbitSvgMap: Map<String, Circle> = new Map<String, Circle>();
    private orbitsMap: Map<String, Orbit> = new Map<String, Orbit>();

    private fleetOrbits: FleetOrbit[] = [];
    private fleetsInOrbits: Map<FleetOrbit, Fleet> = new Map<FleetOrbit, Fleet>();
    private fleetsInOrbitsMap: Map<String, Fleet> = new Map<String, Fleet>();
    private fleetsInOrbitSVGMap: Map<String, Polygon> = new Map<String, Polygon>();
    private fleetOrbitsInOrbitsMap: Map<String, FleetOrbit> = new Map<String, FleetOrbit>();
    private fleetsInOrbitTextSVGMap: Map<String, Text> = new Map<String, Text>();

    private restrictedAreasByOrbit: Map<String, RestrictedFleetArea[]> = new Map<String, RestrictedFleetArea[]>();

    constructor() {
    }

    /**
     * clears the canvas to set new elements on a fresh screen
     */
    clearCanvas() {
        if (!!this.canvas) { // todo remove all elements from canvas
            this.canvas.children().forEach(c => this.canvas!.removeElement(c));
            this.celestialBodySvgMap.clear();
            this.celestialBodyMap.clear();
            this.orbitSvgMap.clear();
            this.orbitsMap.clear();
            this.fleetOrbits = [];
            this.fleetsInOrbits.clear();
            this.fleetsInOrbitsMap.clear();
            this.fleetsInOrbitSVGMap.clear();
            this.fleetOrbitsInOrbitsMap.clear();
            this.fleetsInOrbitTextSVGMap.clear();
            this.restrictedAreasByOrbit.clear();
        }
    }

    /**
     * creates the fleet sharks which are in the orbit of a planet
     *
     * @param canvas the canvas to draw at
     * @param fleetOrbits all fleets in the orbit
     * @param clickForFleetInOrbit the callback function
     */
    setFleetsInOrbits(canvas: Svg, fleetOrbits: Map<FleetOrbit, Fleet>, clickForFleetInOrbit: (event: PointerEvent) => void) {
        this.setCanvas(canvas);

        let sd: StrokeData = {
            color: "black",
            width: 1
        }

        this.fleetsInOrbits = fleetOrbits;
        this.fleetOrbits = Array.from(fleetOrbits.keys());
        this.fleetsInOrbits.forEach((fleet, fleetOrbit) => {

            let fleetSharkID = this.getFleetSharkID(fleet);
            this.fleetsInOrbitsMap.set(fleetSharkID, fleet);
            this.fleetOrbitsInOrbitsMap.set(fleetSharkID, fleetOrbit);

            let orbit = fleetOrbit.planet!.orbit;
            let x: number = orbit.xCoordinate + 25 + (this.fleetOrbits.indexOf(fleetOrbit) % 2 == 0 ? 15 : 0);
            let y: number = orbit.yCoordinate + 25;
            let fleetSharkPoints: ArrayXY[] = this.createFleetSharkPoints(x, y, orbit);

            let group = this.canvas?.group().draggable(true);

            let fleetShark: Polygon = group!
                .polygon(fleetSharkPoints)
                .fill("green")
                .stroke(sd)
                .id(fleetSharkID)
                .click(clickForFleetInOrbit);

            let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
            let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);
            let xText = sortedPointsX[sortedPointsX.length - 1];
            let yText = sortedPointsY[0];

            let text: Text = group!.text(fleet.name)
                .x(xText[0])
                .y(yText[1])
                .stroke("white")
                .id(fleetSharkID)
                .click(clickForFleetInOrbit);

            this.canvas?.add(group!);
            this.fleetsInOrbitTextSVGMap.set(fleetSharkID, text);
            this.fleetsInOrbitSVGMap.set(fleetSharkID, fleetShark);
        });
    }

    /**
     * creates the points setup for the fleet sharks
     *
     * @param x the base x coord
     * @param y the base y coord
     * @param orbit the orbit where the fleet is located
     * @private
     */
    private createFleetSharkPoints(x: number, y: number, orbit: Orbit): ArrayXY[] {
        let points = ViewHelper.defineFleetSharkPoints(x, y);

        let restrictedFleetArea = new RestrictedFleetArea(points);

        let orbitID = this.getOrbitID(orbit);
        if (!this.restrictedAreasByOrbit.has(orbitID)) {
            let areas = [];
            areas.push(restrictedFleetArea);
            this.restrictedAreasByOrbit.set(orbitID, areas);
        } else {
            let areas = this.restrictedAreasByOrbit.get(orbitID);
            let restrictedFleetAreas: RestrictedFleetArea[] = areas!.filter(area => area.collides(points));
            if (restrictedFleetAreas.length != 0) {
                points = this.createFleetSharkPoints(x, y + (35 * restrictedFleetAreas.length), orbit);
            }
            areas!.push(restrictedFleetArea);
        }
        return points;
    }

    /**
     * set points for fleet shark
     *
     * @param x the base x coord
     * @param y the base y coord
     * @private
     */
    private static defineFleetSharkPoints(x: number, y: number) {
        let points: ArrayXY[] = [];
        let item: ArrayXY = [x, y];
        points.push(item);
        item = [x + 40, y - 15];
        points.push(item);

        item = [x + 30, y];
        points.push(item);

        item = [x + 40, y + 10];
        points.push(item);

        item = [x, y];
        points.push(item);
        return points;
    }

    /**
     * starts the complete process of building the canvas and it's attachments
     *
     * @param canvas the canvas to draw at
     * @param viewBoxType the view box type
     * @param orbits all orbits to display
     * @param callbackFunctionForClick the callback function to every orbit
     */
    setOrbits(canvas: Svg, viewBoxType: EViewBoxType, orbits: IterableIterator<Orbit>, callbackFunctionForClick: Function | null) {
        this.setCanvas(canvas);
        this.orbits = Array.from(orbits);
        this.sortByOrbit();
        this.setViewBox();

        let sd: StrokeData = {
            color: "white",
            width: 2
        }

        this.createCoordinateCross();

        this.orbits.forEach(orbit => {
            let celestialBodyID = this.getCelestialBodyID(orbit);
            let orbitID = this.getOrbitID(orbit);
            let radius: number = ViewHelper.calculateDistance(orbit.xCoordinate, orbit.yCoordinate);

            if (EViewBoxType.STAR_SYSTEM === viewBoxType) {
                let orbitSvg = this.canvas!
                    .circle()
                    .x(0)
                    .y(0)
                    .id(orbitID)
                    .fill("none")
                    .stroke(sd)
                    .addClass("orbit")
                    .radius(radius)
                    .on('mouseover', evt => this.mouseOverEventCallback(<MouseEvent>evt));

                this.orbitsMap.set(orbitID, orbit);
                this.orbitSvgMap.set(orbitID, orbitSvg)
            }

            if (EViewBoxType.STAR_SYSTEM === viewBoxType) {
                this.createCoordinateSystem(orbit.xCoordinate, orbit.yCoordinate, 50, orbitID);
            }

            let circle = this.canvas!
                .circle()
                .x(orbit.xCoordinate)
                .y(orbit.yCoordinate)
                .id(celestialBodyID)
                .addClass("object")
                .click(callbackFunctionForClick);

            this.celestialBodyMap.set(celestialBodyID, orbit);
            this.celestialBodySvgMap.set(celestialBodyID, circle);
        });
    }

    /**
     * creates an pulsing event if crossing the orbit's line
     *
     * @param event the mouse event
     */
    private mouseOverEventCallback = (event: MouseEvent) => {
        let orbit: Orbit | undefined = this.getOrbitOfOrbitByEvent(event);
        if (!!orbit) {
            let orbitID: string = this.getCelestialBodyID(orbit);
            let celestial: Orbit | undefined = this.celestialBodyMap.get(orbitID);
            if (!!celestial) {
                let celestialBodyID: string | undefined = this.getCelestialBodyID(celestial);
                if (!!celestialBodyID) {
                    let circlePulser = this.canvas!
                        .circle()
                        .x(orbit.xCoordinate)
                        .y(orbit.yCoordinate)
                        .id(celestialBodyID + "-pulser")
                        .addClass("pulse");

                    timer(8000).subscribe(timer => this.canvas!.removeElement(circlePulser))
                }
            }
        }
    }

    /**
     * calculates the distance between two points
     *
     * @param firstCoordinate the first coordinate
     * @param secondCoordinate the second coordinate
     * @private
     */
    public static calculateDistance(firstCoordinate: number, secondCoordinate: number): number {
        return Math.sqrt(Math.pow(firstCoordinate, 2) + Math.pow(secondCoordinate, 2));
    }

    /**
     * creates an unique orbit identifier
     *
     * @param orbit the orbit to identify
     * @private
     */
    private getCelestialBodyID(orbit: Orbit): string {
        return this.CELESTIAL_BODY_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate + "-" + orbit.yCoordinate;
    }

    /**
     * creates the id of the fleet shark
     *
     * @param fleet the fleet to build the id for
     * @private
     */
    private getFleetSharkID(fleet: Fleet): string {
        let id: string = this.FLEET_SHARK__SELECTOR_ID_PREFIX;
        if (!!fleet.orbit) {
            if (!!fleet.orbit.planet) {
                id += fleet.orbit!.planet?.idPlanet + "-";
            }
            id += fleet.orbit!.system.idStarSystem + "-";
        }
        return id + "-" + fleet.idFleet;
    }

    /**
     * creates an unique orbit identifier
     *
     * @param orbit the orbit to identify
     * @private
     */
    private getOrbitID(orbit: Orbit): string {
        return this.ORBIT_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate + "-" + orbit.yCoordinate;
    }

    /**
     * returns the orbit to the given id
     *
     * @param id the id
     * @private
     */
    private getOrbitOfCelestialByID(id: string): Orbit | undefined {
        return this.celestialBodyMap.get(id);
    }

    /**
     * returns the orbit to the given id
     *
     * @param id the id
     * @private
     */
    private getOrbitOfOrbitByID(id: string): Orbit | undefined {
        return this.orbitsMap.get(id);
    }

    /**
     * returns the fleet shark to the given id
     *
     * @param id the id
     * @private
     */
    private getFleetSharkByID(id: string): Polygon | undefined {
        return this.fleetsInOrbitSVGMap.get(id);
    }

    /**
     * sorts the systems by their orbit's radius
     * @private
     */
    private sortByOrbit() {
        let sortedByX: Orbit[] = this.orbits!.sort((a, b) => {
            return a.xCoordinate < b.xCoordinate ? -1 : 1;
        });
        this.smallestXOrbit = sortedByX[0];
        this.biggestXOrbit = sortedByX[sortedByX.length - 1];
        let sortedByY: Orbit[] = this.orbits!.sort((a, b) => {
            return a.yCoordinate < b.yCoordinate ? -1 : 1;
        });
        this.smallestYOrbit = sortedByY[0];
        this.biggestYOrbit = sortedByY[sortedByY.length - 1];
    }

    /**
     * returns the orbit if known by this id
     *
     * @param event the event
     */
    getOrbitOfCelestialByEvent(event: PointerEvent | MouseEvent): Orbit | undefined {
        let target: Shape = event.target as Shape;
        let id: string = target.id as unknown as string;
        return this.getOrbitOfCelestialByID(id);
    }

    /**
     * returns the orbit if known by this id
     *
     * @param event
     */
    getOrbitOfOrbitByEvent(event: PointerEvent | MouseEvent): Orbit | undefined {
        let target: Shape = event.target as Shape;
        let id: string = target.id as unknown as string;
        return this.getOrbitOfOrbitByID(id);
    }

    /**
     * returns the fleet shark if known by this id
     *
     * @param event
     */
    getFleetSharkByEvent(event: PointerEvent | MouseEvent): Polygon | undefined {
        let target: Shape = event.target as Shape;
        let id: string = target.id as unknown as string;
        return this.getFleetSharkByID(id);
    }

    /**
     * returns the view box string for the svg
     */
    private setViewBox() {
        let viewBoxDef: string = "0 0 0 0";
        let isPresent = !!this.smallestXOrbit && !!this.biggestXOrbit && !!this.smallestYOrbit && !!this.biggestYOrbit;
        if (isPresent) {
            viewBoxDef = this.smallestXOrbit!.xCoordinate
                + " "
                + this.smallestYOrbit!.yCoordinate
                + " "
                + ViewHelper.getDifference(this.smallestYOrbit!.yCoordinate, this.biggestYOrbit!.yCoordinate)
                + " "
                + ViewHelper.getDifference(this.smallestXOrbit!.xCoordinate, this.biggestXOrbit!.xCoordinate);
        }
        this.canvas!.viewbox(viewBoxDef);
    }

    /**
     * returns the difference of two values
     *
     * @param a first value
     * @param b second value
     * @private
     */
    private static getDifference(a: number, b: number): number {
        if (a > b) {
            return Math.abs(a) + Math.abs(b);
        }
        return Math.abs(b) + Math.abs(a);
    }

    /**
     * creates the coordinate axis cross
     *
     * @private
     */
    private createCoordinateCross() {
        let minXCoord = this.smallestXOrbit!.xCoordinate;
        let maxXCoord = this.biggestXOrbit!.xCoordinate;
        let x = Math.abs(minXCoord) < Math.abs(maxXCoord) ? Math.abs(maxXCoord) : Math.abs(minXCoord);
        let minYCoord = this.smallestYOrbit!.yCoordinate;
        let maxYCoord = this.biggestYOrbit!.yCoordinate;
        let y = Math.abs(minYCoord) < Math.abs(maxYCoord) ? Math.abs(maxYCoord) : Math.abs(minYCoord);

        let radius: number = ViewHelper.calculateDistance(x, y);
        radius *= 1.1;

        this.createCoordinateSystem(0, 0, radius, "main");
    }

    /**
     * creates a coordinate cross for the given base
     *
     * @param xBase the x coord
     * @param yBase the y coord
     * @param radius the radius for the axis
     * @param idPrefix the css id selector prefix
     * @private
     */
    private createCoordinateSystem(xBase: number, yBase: number, radius: number, idPrefix: string) {
        // y-axis
        // x-axis
        this.drawAxis(xBase, yBase, radius, idPrefix);
        // y-axis tick marks
        // x-axis tick marks
        this.drawTickMarks(xBase, yBase, radius, idPrefix);
    }

    /**
     * draws the tick marks for the axis
     *
     * @param xBase the base x coord
     * @param yBase the base y coord
     * @param radius the maximum radius
     * @param idPrefix the css selector prefix
     * @private
     */
    private drawTickMarks(xBase: number, yBase: number, radius: number, idPrefix: string) {
        let p: number[] = [];
        let diff: number = radius / 2;
        let step: number = diff / 10;
        let xRunnerUpper: number = xBase;
        let xRunnerLower: number = xBase;
        let yRunnerUpper: number = yBase;
        let yRunnerLower: number = yBase;
        for (let i = 0; i <= 20; i++) {
            if (i == 0) {
                xRunnerUpper += step;
                xRunnerLower -= step;
                yRunnerUpper += step;
                yRunnerLower -= step;
                continue;
            }
            let width = step;
            if (i % 10 == 0) {
                width = step;
            } else if (i % 5 == 0) {
                width = step / 2;
            } else {
                width = step / 5;
            }
            p = [];
            p.push(xBase + width, yRunnerUpper);
            p.push(xBase - width, yRunnerUpper);
            this.canvas!.line(p).addClass("coordCross").id(idPrefix + "y-" + i);
            p = [];
            p.push(xBase + width, yRunnerLower);
            p.push(xBase - width, yRunnerLower);
            this.canvas!.line(p).addClass("coordCross").id(idPrefix + "y-" + i);
            p = [];
            p.push(xRunnerUpper, yBase + width);
            p.push(xRunnerUpper, yBase - width);
            this.canvas!.line(p).addClass("coordCross").id(idPrefix + "x-" + i);
            p = [];
            p.push(xRunnerLower, yBase + width);
            p.push(xRunnerLower, yBase - width);
            this.canvas!.line(p).addClass("coordCross").id(idPrefix + "x-" + i);
            xRunnerUpper += step;
            xRunnerLower -= step;
            yRunnerUpper += step;
            yRunnerLower -= step;
        }
    }

    /**
     * draws the axis
     *
     * @param xBase the base x coord
     * @param yBase the base y coord
     * @param radius the maximum radius
     * @param idPrefix the css selector prefix
     * @private
     */
    private drawAxis(xBase: number, yBase: number, radius: number, idPrefix: string) {
        let p: number[] = [];
        p.push(xBase, yBase + radius);
        p.push(xBase, yBase + radius * -1);
        this.canvas!.line(p).addClass("coordCross").id(idPrefix + "-x");
        p = []
        p.push(xBase + radius, yBase);
        p.push(xBase + radius * -1, yBase);
        this.canvas!.line(p).addClass("coordCross").id(idPrefix + "-y");
    }

    /**
     * checks if the canvas exists and tries to set them
     *
     * @param canvas the canvas to set
     * @private
     */
    private setCanvas(canvas: Svg) {
        if (!canvas) {
            throw new Error("The canvas isn't initialized.");
        } else {
            this.canvas = canvas;
        }
    }
}