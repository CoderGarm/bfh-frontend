import {SubscriptionManager} from "./SubscriptionManager";
import {CounterMissileHit, Distance, Fleet, MissileMovement, Move, Orbit, StarSystem, UserJson, WarShip} from "./services/swagger";
import {ArrayXY, CurveCommand, G, LineCommand, PathArrayAlias, Polygon, Shape, Svg, Text} from "@svgdotjs/svg.js";
import {RestrictedFleetArea} from "./modules/star-map/payload/restricted-fleet-area";
import {CelestialAreaDefinition} from "./modules/star-map/payload/celestial-area-definition";
import {AreaDefinition} from "./modules/star-map/area-definition";
import {OrbitDefinition} from "./modules/star-map/payload/orbit-definition";
import {NavigationCalculator} from "./NavigationCalculator";
import {Component, HostListener} from "@angular/core";
import DistanceMetricEnum = Distance.DistanceMetricEnum;


@Component({
    template: ''
})
export class BasicViewHelper extends SubscriptionManager {

    public static readonly PAN_ZOOM_OPTIONS = {
        // https://github.com/svgdotjs/svg.panzoom.js/blob/master/readme.md
        zoomFactor: 0.3, // zooming per wheel tick
        zoomMin: 0.1, // zoom max out to display the full svg payload as 20% of the screen
        zoomMax: 4 // zoom max 4 times in
    };
    public readonly STANDARD_METRIC;

    constructor(private standardDistanceMetric: DistanceMetricEnum) {
        super();

        this.STANDARD_METRIC = standardDistanceMetric;
    }

    protected readonly FLEET_SHARK_COLOR_HOSTILE = "red";
    protected readonly FLEET_SHARK_COLOR_OWN = "green";

    protected readonly COURSE_PLOT_COLOR_OUTBOUND: string = "green";
    protected readonly COURSE_PLOT_COLOR_INBOUND: string = "red";

    protected readonly NOT_COLONIZED_COLOR = "darkgoldenrod";
    protected readonly IS_COLONIZED_BY_USER_COLOR = "darkolivegreen";
    protected readonly COLONIZED_BY_OTHERS_COLOR = "#6f1585";
    protected readonly COLONIZABLE_SYSTEM_MARKER_COLOR = "#306f91";

    protected static readonly PLANET_RADIUS = 5;
    protected static readonly STAR_RADIUS = 15;

    protected orbits?: Orbit[];

    protected smallestXOrbit?: Orbit;
    protected biggestXOrbit?: Orbit;
    protected smallestYOrbit?: Orbit;
    protected biggestYOrbit?: Orbit;

    protected radiusOfCoordinateCross?: number;

    protected canvas?: Svg;

    protected USER_SELECTOR_ID_PREFIX: string = Math.random() + "-owner";
    protected CELESTIAL_BODY_SELECTOR_ID_PREFIX: string = Math.random() + "-orbit";
    protected ORBIT_SELECTOR_ID_PREFIX: string = Math.random() + "-orbit";
    protected FLEET_SHARK_SELECTOR_ID_PREFIX: string = Math.random() + "-fleet-shark";
    protected WARSHIP_SELECTOR_ID_PREFIX: string = Math.random() + "-warship";
    protected MISSILE_SALVO_SELECTOR_ID_PREFIX: string = Math.random() + "-missile-salvo";

    private readonly INVISIBLE_CLASS = "invisible";

    /**
     * the radius of the hyper limit
     * @private
     */
    protected hyperLimit?: number;

    protected celestialBodyById: Map<String, Orbit> = new Map<String, Orbit>();
    protected orbitsById: Map<String, Orbit> = new Map<String, Orbit>();
    protected orbitTextsById: Map<String, Text> = new Map<String, Text>();

    protected fleetsById: Map<String, Fleet> = new Map<String, Fleet>();
    protected fleetsByText: Map<Text, Fleet> = new Map<Text, Fleet>();
    protected fleetTextsById: Map<String, Text> = new Map<String, Text>();
    protected fleetOwnersById: Map<String, UserJson> = new Map<String, UserJson>();
    protected fleetOwnerByText: Map<Text, UserJson> = new Map<Text, UserJson>();

    protected warshipsById: Map<String, WarShip> = new Map<String, WarShip>();
    protected warshipPolygonsById: Map<String, Polygon> = new Map<String, Polygon>();
    protected warshipsByText: Map<Text, WarShip> = new Map<Text, WarShip>();
    protected warshipTextsById: Map<String, Text> = new Map<String, Text>();

    protected missileSalvoPolygonsById: Map<String, Polygon[]> = new Map<String, Polygon[]>();
    protected restrictedAreasByOrbitId: Map<String, RestrictedFleetArea[]> = new Map<String, RestrictedFleetArea[]>();
    protected groupsByID: Map<String, G> = new Map<String, G>();

    protected areaDefinitions: AreaDefinition[] = [];
    protected celestialAreas: CelestialAreaDefinition[] = [];

    protected aspectRatio: number = 1;

    @HostListener('window:resize', ['$event'])
    onResize(event?: UIEvent) {
        this.determineAspectRatio();
    }

    @HostListener('window:click', ['$event'])
    onClick(event?: UIEvent) {
        this.determineAspectRatio();
    }

    private determineAspectRatio() {
        let screenHeight = window.innerHeight;
        let screenWidth = window.innerWidth;
        this.aspectRatio = screenWidth / screenHeight;
    }

    /**
     * clears the canvas to set new elements on a fresh screen
     */
    clearCanvas() {
        if (!!this.canvas) {
            // remove all elements from canvas a little bit more performant
            this.canvas.node.innerHTML = '';
            this.celestialBodyById.clear();
            this.orbitsById.clear();
            this.fleetsById.clear();
            this.fleetTextsById.clear();
            this.fleetOwnerByText.clear();
            this.restrictedAreasByOrbitId.clear();
            this.groupsByID.clear();
            this.warshipPolygonsById.clear();
            this.orbitTextsById.clear();
            this.fleetsByText.clear();
            this.fleetOwnersById.clear();
            this.warshipsById.clear();
            this.warshipsByText.clear();
            this.warshipTextsById.clear();
            this.missileSalvoPolygonsById.clear();
            this.areaDefinitions = [];
            this.celestialAreas = [];
        }
    }

    /**
     * checks if the canvas exists and tries to set them
     *
     * @param canvas the canvas to set
     * @private
     */
    protected setCanvas(canvas: Svg) {
        if (!canvas) {
            throw new Error("The canvas isn't initialized.");
        } else {
            this.canvas = canvas;
        }
    }

    protected convertToStandardMetric(distance: Distance): number {
        return NavigationCalculator.convertDistanceToMetric(distance, this.standardDistanceMetric);
    }

    protected drawCelestial(orbitDefinition: OrbitDefinition,
                            callbackFunctionForClick: Function | null) {
        const orbit: Orbit = orbitDefinition.orbit;
        let orbitID = this.getOrbitID(orbit);
        let celestialBodyID = this.getCelestialBodyID(orbit);

        this.orbitsById.set(orbitID, orbit);
        this.celestialAreas.push(new CelestialAreaDefinition(orbit, orbitID, 50));

        if (orbitDefinition.isColonizable) {
            // to rotate around the center just flip the + and -
            let x1 = this.convertToStandardMetric(orbit.xCoordinate) - 9;
            let y1 = this.convertToStandardMetric(orbit.yCoordinate) - 8;
            let x2 = this.convertToStandardMetric(orbit.xCoordinate) + 9;
            let y2 = this.convertToStandardMetric(orbit.yCoordinate) + 8;

            let p1: LineCommand = ["M", x1, y1];
            let p2: CurveCommand = ["A", 1, 1, 1, 1, 1, x2, y2];

            let arr: PathArrayAlias = [p1, p2];
            this.canvas!.path(arr)
                .fill("none")
                .stroke({color: this.COLONIZABLE_SYSTEM_MARKER_COLOR, width: 1})
                .addClass("roundCap");
        }

        let color = this.NOT_COLONIZED_COLOR;
        if (orbitDefinition.isColonizedByLoggedInUser) {
            color = this.IS_COLONIZED_BY_USER_COLOR;
        } else if (orbitDefinition.isColonizedByOtherUser) {
            color = this.COLONIZED_BY_OTHERS_COLOR;
        }

        const circle = this.canvas!
            .circle()
            .x(this.convertToStandardMetric(orbit.xCoordinate))
            .y(this.convertToStandardMetric(orbit.yCoordinate))
            .radius(BasicViewHelper.PLANET_RADIUS)
            .id(celestialBodyID)
            .fill(color)
            .click(callbackFunctionForClick)
            .mouseover(this.mouseoverForCelestial)
            .mouseleave(this.mouseleaveForCelestial);

        let text: Text = new Text()
            .text(orbitDefinition.name)
            .x(circle.cx() + 10)
            .y(circle.cy() - 20)
            .addClass("celestial-text");

        if (!orbitDefinition.isColonizedByLoggedInUser && !orbitDefinition.isColonizedByOtherUser) {
            // add only texts which must be switched
            this.orbitTextsById.set(orbitID, text);
        } else {
            // display constantly
            this.canvas!.add(text);
        }
        this.celestialBodyById.set(celestialBodyID, orbit);
    }

    /**
     * call back function for hovering over a celestial
     *
     * @param event
     */
    private mouseoverForCelestial = (event: PointerEvent) => {
        const orbitText = this.getOrbitTextByEvent(event);
        if (!!orbitText) {
            this.canvas?.add(orbitText)
        }
    }

    /**
     * call back function for hovering over a celestial
     *
     * @param event
     */
    private mouseleaveForCelestial = (event: PointerEvent) => {
        const orbitText = this.getOrbitTextByEvent(event);
        if (!!orbitText) {
            this.canvas?.removeElement(orbitText)
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

    protected createPolarCoordinateSystem() {

        // getting biggest, absolute coord because
        let minXCoord = Math.abs(this.convertToStandardMetric(this.smallestXOrbit!.xCoordinate));
        let maxXCoord = Math.abs(this.convertToStandardMetric(this.biggestXOrbit!.xCoordinate));
        let x = Math.max(minXCoord, maxXCoord);
        let minYCoord = Math.abs(this.convertToStandardMetric(this.smallestYOrbit!.yCoordinate));
        let maxYCoord = Math.abs(this.convertToStandardMetric(this.biggestYOrbit!.yCoordinate));
        let y = Math.max(minYCoord, maxYCoord);

        this.radiusOfCoordinateCross = BasicViewHelper.calculateDistance(x, y);
        this.radiusOfCoordinateCross *= 1.1;

        this.createLocalPolarCoordinateSystem(0, 0, this.radiusOfCoordinateCross, undefined);

        /*let steps = 6;
        const radiusSteps = this.radiusOfCoordinateCross / steps;
        for (let i = 0; i < steps; i++) {
            this.canvas!
                .circle()
                .x(0)
                .y(0)
                .fill("none")
                .id("coordCross" + i)
                .addClass("coordCross")
                .radius(radiusSteps * i);
        }
        const degree = 12;
        for (let j = 1; j <= 30; j++) {
            const angle = j * degree;
            const x = this.radiusOfCoordinateCross * Math.cos(angle * Math.PI / 180);
            const y = this.radiusOfCoordinateCross * Math.sin(angle * Math.PI / 180);
            const points: ArrayXY[] = [[0, 0], [x, y]];
            this.canvas!
                .line(points)
                .addClass("coordCross")
        }
                */
    }

    protected createLocalPolarCoordinateSystem(xBase: number, yBase: number, radius: number, idPrefix?: string) {
        let steps = 6;
        const radiusSteps = radius / steps;
        for (let i = 0; i < steps; i++) {
            this.canvas!
                .circle()
                .x(xBase)
                .y(yBase)
                .fill("none")
                .id(idPrefix + "-coordCross" + i)
                .addClass("coordCross")
                .radius(radiusSteps * i);
        }
        const degree = 12;
        for (let j = 1; j <= 30; j++) {
            const angle = j * degree;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const points: ArrayXY[] = [[xBase, yBase], [xBase + x, yBase + y]];
            this.canvas!
                .line(points)
                .id(idPrefix + "-coordCross-line" + j)
                .addClass("coordCross")
        }
    }

    /**
     * todo some kind of art - could be accidentally very useful for wormhole junction resonance zones
     */
    protected drawResonanceZone(xBase: number, yBase: number, radius: number, idPrefix?: string) {
        let steps = 6;
        const radiusSteps = radius / steps;
        for (let i = 0; i < steps; i++) {
            this.canvas!
                .circle()
                .x(xBase)
                .y(yBase)
                .fill("none")
                .id("coordCross" + i)
                .addClass("coordCross")
                .radius(radiusSteps * i);
        }
        const degree = 12;
        for (let j = 1; j <= 30; j++) {
            const angle = j * degree;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const points: ArrayXY[] = [[xBase, yBase], [x, y]];
            this.canvas!
                .line(points)
                .addClass("coordCross")
        }
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
    protected createCoordinateSystem(xBase: number, yBase: number, radius: number, idPrefix: string) {
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
                width = step * 2;
            } else if (i % 5 == 0) {
                width = step;
            } else {
                width = step / 2;
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
     * returns the view box string for the svg
     */
    public setViewBox(orbit: Orbit | undefined, factor: number) {
        let viewBoxDef: string = "0 0 0 0";
        if (!!this.radiusOfCoordinateCross) {
            let width = this.radiusOfCoordinateCross! * factor;
            let height = this.radiusOfCoordinateCross! * factor;
            let startX = -width;
            let startY = -height / this.aspectRatio;

            let xOffset = 0;
            let yOffset = 0;
            if (!!orbit) {
                xOffset = this.convertToStandardMetric(orbit?.xCoordinate);
                yOffset = this.convertToStandardMetric(orbit?.yCoordinate)
            }

            viewBoxDef = (startX + xOffset) + " " + (startY + yOffset) + " " + width * 2 + " " + height * 2;
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
    public static getSum(a: number, b: number): number {
        return Math.abs(a) + Math.abs(b);
    }

    /**
     * returns the difference of two values
     *
     * @param a first value
     * @param b second value
     * @param c the third value
     * @private
     */
    public static getSumOfThree(a: number, b: number, c: number): number {
        return Math.abs(a) + Math.abs(b) + Math.abs(c);
    }

    /**
     * sorts the systems by their orbit's radius
     * @private
     */
    protected sortByOrbit() {
        if (!this.orbits) {
            throw new Error("The orbits must be present to calculate the map view.");
        }
        let sortedByX: Orbit[] = this.orbits.sort((a, b) => {
            return a.xCoordinate.coordinate < b.xCoordinate.coordinate ? -1 : 1;
        });
        this.smallestXOrbit = sortedByX[0];
        this.biggestXOrbit = sortedByX[sortedByX.length - 1];
        let sortedByY: Orbit[] = this.orbits.sort((a, b) => {
            return a.yCoordinate.coordinate < b.yCoordinate.coordinate ? -1 : 1;
        });
        this.smallestYOrbit = sortedByY[0];
        this.biggestYOrbit = sortedByY[sortedByY.length - 1];
    }

    /**
     * calculates the distance between two points
     *
     * @param firstCoordinate the first coordinate
     * @param secondCoordinate the second coordinate
     * @private
     */
    public static calculateDistanceOfPoints(firstCoordinate: ArrayXY, secondCoordinate: ArrayXY): number {
        return Math.sqrt(Math.pow(firstCoordinate[0] - secondCoordinate[0], 2) + Math.pow(firstCoordinate[1] - secondCoordinate[1], 2));
    }

    /**
     * calculates the distance between two points
     *
     * @param firstOrbit the first coordinate
     * @param secondOrbit the second coordinate
     * @private
     */
    public calculateDistanceOfOrbits(firstOrbit: Orbit, secondOrbit: Orbit): number {
        const originX = NavigationCalculator.convertDistanceToMetric(firstOrbit.xCoordinate, this.standardDistanceMetric);
        const originY = NavigationCalculator.convertDistanceToMetric(firstOrbit.yCoordinate, this.standardDistanceMetric);
        const destinationX = NavigationCalculator.convertDistanceToMetric(secondOrbit.xCoordinate, this.standardDistanceMetric);
        const destinationY = NavigationCalculator.convertDistanceToMetric(secondOrbit.yCoordinate, this.standardDistanceMetric);

        return BasicViewHelper.calculateDistanceOfPoints([originX, originY], [destinationX, destinationY]);
    }

    /**
     * set points for fleet shark
     *
     * @param x the base x coord
     * @param y the base y coord
     * @private
     */
    protected defineFleetSharkPoints(x: number, y: number) {
        let points: ArrayXY[] = [];
        let item: ArrayXY = [x, y];
        points.push(item);
        item = [x + 20, y - 7.5];
        points.push(item);

        item = [x + 15, y];
        points.push(item);

        item = [x + 20, y + 5];
        points.push(item);

        item = [x, y];
        points.push(item);
        return points;
    }

    /**
     * creates the points setup for the fleet sharks
     *
     * @param x the base x coord
     * @param y the base y coord
     * @param orbit the orbit where the fleet is located
     * @private
     */
    protected createFleetSharkPoints(x: number, y: number, orbit: Orbit): ArrayXY[] {
        let points = this.defineFleetSharkPoints(x, y);

        let restrictedFleetArea = new RestrictedFleetArea(points);

        let orbitID = this.getOrbitID(orbit);
        if (!this.restrictedAreasByOrbitId.has(orbitID)) {
            let areas = [];
            areas.push(restrictedFleetArea);
            this.restrictedAreasByOrbitId.set(orbitID, areas);
        } else {
            let areas = this.restrictedAreasByOrbitId.get(orbitID);
            let restrictedFleetAreas: RestrictedFleetArea[] = areas!.filter(area => area.collides(points));
            if (restrictedFleetAreas.length != 0) {
                points = this.createFleetSharkPoints(x, y + (35 * restrictedFleetAreas.length), orbit);
            }
            areas!.push(restrictedFleetArea);
        }
        return points;
    }

    /**
     * creates an unique orbit identifier
     *
     * @param orbit the orbit to identify
     * @private
     */
    protected getOrbitID(orbit: Orbit): string {
        return this.ORBIT_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
    }

    /**
     * prints the course path for a fleet movement
     *
     * @param move the movement
     * @private
     */
    protected createCoursePlot(move: Move) {
        if (!move.startOrbit.orbit || !move.targetOrbit.orbit) {
            throw new Error("The move should have a origin and a destination.");
        }
        let startX: number = this.convertToStandardMetric(move.startOrbit.orbit.xCoordinate);
        let startY: number = this.convertToStandardMetric(move.startOrbit.orbit.yCoordinate);

        let endX: number = this.convertToStandardMetric(move.targetOrbit.orbit.xCoordinate);
        let endY: number = this.convertToStandardMetric(move.targetOrbit.orbit.yCoordinate);

        let relativeTargetX: number = endX - startX;
        let relativeTargetY: number = endY - startY;

        let baseQx: number = 30;
        let baseQy: number = 50;

        let qXMultiplier: number = 1;
        let qYMultiplier: number = 1;
        if (relativeTargetY < 0) {
            // cY is negative if the movement on y-axis is inbound
            qYMultiplier = -1;
        }

        let color: string;
        if (BasicViewHelper.calculateDistance(startX, startY) <= BasicViewHelper.calculateDistance(endX, endY)) {
            color = this.COURSE_PLOT_COLOR_OUTBOUND;
            // outbound cX is negative
            qXMultiplier = -1;
        } else {
            color = this.COURSE_PLOT_COLOR_INBOUND;
        }

        let cX: number = qXMultiplier * baseQx;
        let cY: number = qYMultiplier * baseQy;

        let p1: LineCommand = ["M", startX, startY];
        let p2: CurveCommand = ["q", cX, cY, relativeTargetX, relativeTargetY];

        let arr: PathArrayAlias = [p1, p2];
        return {color, arr};
    }

    /**
     * states that two orbits have the same coordinates
     *
     * @param first
     * @param second
     */
    protected isSameOrbit(first: Orbit, second: Orbit): boolean {
        let isEqual = true;
        if (first.xCoordinate.coordinate != second.xCoordinate.coordinate) {
            isEqual = false;
        }
        if (first.yCoordinate.coordinate != second.yCoordinate.coordinate) {
            isEqual = false;
        }
        return isEqual;
    }

    /**
     * calculates the hyper limit
     * @param system
     */
    protected calculateHyperLimit(system: StarSystem) {
        const lightMinutesToHyperLimit = system.starClassType.lightMinutesToHyperLimit;
        const hyperRadius: Distance = {
            coordinate: lightMinutesToHyperLimit,
            distanceMetric: DistanceMetricEnum.LM
        }
        return this.convertToStandardMetric(hyperRadius);
    }

    protected getFleetSharkID(fleet: Fleet): string {
        let id: string = this.FLEET_SHARK_SELECTOR_ID_PREFIX;
        if (!!fleet.orbit) {
            if (!!fleet.orbit.orbit) {
                id += fleet.orbit.orbit.xCoordinate.coordinate + "." + fleet.orbit.orbit.yCoordinate.coordinate + "-";
            }
            if (!!fleet.orbit.system) {
                id += fleet.orbit.system.idStarSystem + "-";
            }
        }
        return id + "-" + fleet.idFleet;
    }

    protected getWarshipID(warShip: WarShip): string {
        let id: string = this.WARSHIP_SELECTOR_ID_PREFIX;
        return id + "-" + warShip.idWarship;
    }

    protected getMissileSalvoID(missileMovement: MissileMovement): string {
        let id: string = this.MISSILE_SALVO_SELECTOR_ID_PREFIX;
        return id + "-" + missileMovement.movingMissileSalvo + "-" + missileMovement.combatRoundKey.combatRound.no;
    }

    protected getMissileSalvoIDByHit(hit: CounterMissileHit) {
        let id: string = this.MISSILE_SALVO_SELECTOR_ID_PREFIX;
        return id + "-" + hit.attackedMissileSalvo + "-" + hit.combatRoundKey.combatRound.no;
    }

    protected getCelestialBodyID(orbit: Orbit): string {
        return this.CELESTIAL_BODY_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
    }

    protected getOrbitOfCelestialByID(id: string): Orbit | undefined {
        return this.celestialBodyById.get(id);
    }

    protected getOrbitOfOrbitByID(id: string): Orbit | undefined {
        return this.orbitsById.get(id);
    }

    protected getFleetTextByID(id: string): Text | undefined {
        return this.fleetTextsById.get(id);
    }

    protected getFleetByText(text: Text): Fleet | undefined {
        return this.fleetsByText.get(text);
    }

    protected getFleetByID(id: string): Fleet | undefined {
        return this.fleetsById.get(id);
    }

    protected getFleetByGroupID(id: string): Fleet | undefined {
        let reducedId = id.replace("-group", "");
        return this.getFleetByID(reducedId);
    }

    protected getOrbitOfCelestialByEvent(event: PointerEvent | MouseEvent): Orbit | undefined {
        let id = this.getIdFromEvent(event);
        return this.getOrbitOfCelestialByID(id);
    }

    protected getOrbitTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        const byEvent = this.getOrbitOfCelestialByEvent(event);
        if (!byEvent) {
            return undefined;
        }
        const orbitID = this.getOrbitID(byEvent);
        return this.getOrbitTextByID(orbitID);
    }

    protected getOrbitTextByID(id: string): Text | undefined {
        return this.orbitTextsById.get(id);
    }

    protected getOwnerByID(id: string): UserJson | undefined {
        return this.fleetOwnersById.get(id);
    }

    protected getFleetOwnerByGroupID(id: string): UserJson | undefined {
        let reducedId = id.replace("-group", "");
        return this.getOwnerByID(reducedId);
    }

    protected getFleetSharkIdForOwner(user: UserJson): string {
        return this.USER_SELECTOR_ID_PREFIX + "-" + user.idUser;
    }

    protected getFleetOwnerByText(text: Text): UserJson | undefined {
        return this.fleetOwnerByText.get(text);
    }

    protected getFleetByEvent(event: PointerEvent | MouseEvent | any): Fleet | undefined {
        let id = this.getIdFromEvent(event);
        return this.getFleetByID(id);
    }

    private getIdFromEvent(event: PointerEvent | MouseEvent | any) {
        let target: Shape = event.target as Shape;
        const id = target.id as unknown as string;
        if (!id) {
            const parent = event.path[1];
            return parent.id;
        }
        return id;
    }

    protected getFleetOwnerForOwnerByEvent(event: PointerEvent | MouseEvent): UserJson | undefined {
        let id = this.getIdFromEvent(event);
        return this.getOwnerByID(id);
    }

    protected getFleetTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let p = event.composedPath()[1];
        let x = <HTMLElement>p;
        return this.getFleetTextByID(x.id);
    }

    protected getWarshipByID(id: string): WarShip | undefined {
        return this.warshipsById.get(id);
    }

    protected getWarshipByEvent(event: PointerEvent | MouseEvent | any): WarShip | undefined {
        let id = this.getIdFromEvent(event);
        return this.getWarshipByID(id);
    }

    protected getWarshipTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let p = event.composedPath()[1];
        let x = <HTMLElement>p;
        return this.getWarshipTextByID(x.id);
    }

    protected getWarshipTextByID(id: string): Text | undefined {
        return this.warshipTextsById.get(id);
    }

    protected getWarshipByText(text: Text): WarShip | undefined {
        return this.warshipsByText.get(text);
    }
}
