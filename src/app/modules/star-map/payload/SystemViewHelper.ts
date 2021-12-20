import {ArrayXY, CurveCommand, G, LineCommand, PathArrayAlias, Shape, StrokeData, Svg, Text} from "@svgdotjs/svg.js";
import {Fleet, FleetOrbit, Move, Orbit, Planet, StarSystem} from "../../../services/swagger";
import {timer} from "rxjs";
import {RestrictedFleetArea} from "./restricted-fleet-area";
import {AreaDefinition} from "./area-definition";
import {CelestialAreaDefinition} from "./celestial-area-definition";
import {OrbitDefinition} from "./OrbitDefinition";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {SubscriptionManager} from "../../../SubscriptionManager";

export class SystemViewHelper extends SubscriptionManager {

    private readonly FLEET_SHARK_COLOR_HOSTILE = "red";
    private readonly FLEET_SHARK_COLOR_OWN = "green";

    private readonly COURSE_PLOT_COLOR_OUTBOUND: string = "green";
    private readonly COURSE_PLOT_COLOR_INBOUND: string = "red";

    private readonly NOT_COLONIZED_COLOR = "darkgoldenrod";
    private readonly IS_COLONIZED_BY_USER_COLOR = "darkolivegreen";
    private readonly COLONIZED_BY_OTHERS_COLOR = "#6f1585";
    private readonly COLONIZABLE_SYSTEM_MARKER_COLOR = "#306f91";

    private orbits?: Orbit[];

    smallestXOrbit?: Orbit;
    biggestXOrbit?: Orbit;
    smallestYOrbit?: Orbit;
    biggestYOrbit?: Orbit;

    canvas?: Svg;

    private CELESTIAL_BODY_SELECTOR_ID_PREFIX: string = Math.random() + "-orbit";
    private ORBIT_SELECTOR_ID_PREFIX: string = Math.random() + "-orbit";
    private FLEET_SHARK__SELECTOR_ID_PREFIX: string = Math.random() + "-fleet-shark";

    private celestialBodyMap: Map<String, Orbit> = new Map<String, Orbit>();

    private orbitsMap: Map<String, Orbit> = new Map<String, Orbit>();

    private fleetsInOrbitsMap: Map<String, Fleet> = new Map<String, Fleet>();
    private fleetTextsByIdSVGMap: Map<String, Text> = new Map<String, Text>();
    private fleetsInOrbitByTextSVGMap: Map<Text, Fleet> = new Map<Text, Fleet>();

    private restrictedAreasByOrbit: Map<String, RestrictedFleetArea[]> = new Map<String, RestrictedFleetArea[]>();

    private areaDefinitions: AreaDefinition[] = [];
    private groupsByID: Map<String, G> = new Map<String, G>();
    private celestialAreas: CelestialAreaDefinition[] = [];
    /**
     * the radius of the hyper limit
     * @private
     */
    private hyperLimit?: number;

    constructor(protected tokenStorage: TokenStorage) {
        super();
    }

    /**
     * clears the canvas to set new elements on a fresh screen
     */
    clearCanvas() {
        if (!!this.canvas) {
            // remove all elements from canvas a little bit more performant
            this.canvas.node.innerHTML = '';
            this.celestialBodyMap.clear();
            this.orbitsMap.clear();
            this.fleetsInOrbitsMap.clear();
            this.fleetTextsByIdSVGMap.clear();
            this.fleetsInOrbitByTextSVGMap.clear();
            this.restrictedAreasByOrbit.clear();
            this.areaDefinitions = [];
            this.celestialAreas = [];
        }
    }

    /**
     * prints a fleet in motion to the canvas and also the course plot
     *
     * @param canvas the canvas
     * @param fleetsInMotion the fleets to print by movement
     * @param dblClickForFleet the double click callback
     * @param dragEndForFleet the drag end callback
     */
    setFleetsInMotion(canvas: Svg,
                      fleetsInMotion: Map<Move, Fleet[]>,
                      dblClickForFleet: (event: PointerEvent) => void,
                      dragEndForFleet: (draggedFleet?: Fleet, targetFleet?: Fleet, orbit?: Orbit) => void) {

        fleetsInMotion.forEach((fleets, move) => {
            if (!move.startOrbit.orbit || !move.targetOrbit.orbit) {
                return;
            }
            let {color, arr} = this.createCoursePlot(move);

            let path = this.canvas!.path(arr).fill("none").stroke({color: color, width: 1});
            fleets.forEach(fleet => {
                if (!fleet.move || !fleet.move.startOrbit.orbit || !fleet.move.targetOrbit.orbit) {
                    return;
                }

                let startOrbit = fleet.move.startOrbit.orbit;
                let targetOrbit = fleet.move.targetOrbit.orbit;
                let distance = SystemViewHelper.calculateDistanceOfPoints([startOrbit.xCoordinate, startOrbit.yCoordinate], [targetOrbit.xCoordinate, targetOrbit.yCoordinate]);

                let part = (fleet.move!.originalDuration - fleet.move!.moveDoneAtZero) / fleet.move!.originalDuration;
                if (part < 0.1) {
                    part = 0.1;
                } else if (part > 0.9) {
                    part = 0.9;
                }
                let coveredTrackLength = distance * part;

                let pointAt = path.pointAt(coveredTrackLength);

                let fleetSharkPoints: ArrayXY[] = SystemViewHelper.defineFleetSharkPoints(pointAt.x, pointAt.y);
                let fleetSharkID = this.getFleetSharkID(fleet);

                this.createFleetSharkAndPrint(fleetSharkID, dragEndForFleet, fleetSharkPoints, dblClickForFleet, fleet);
            });
        });
    }

    /**
     * prints the course path for a fleet movement
     *
     * @param move the movement
     * @private
     */
    private createCoursePlot(move: Move) {
        if (!move.startOrbit.orbit || !move.targetOrbit.orbit) {
            throw new Error("The move should have a origin and a destination.");
        }
        let startX: number = move.startOrbit.orbit.xCoordinate;
        let startY: number = move.startOrbit.orbit.yCoordinate;

        let endX: number = move.targetOrbit.orbit.xCoordinate;
        let endY: number = move.targetOrbit.orbit.yCoordinate;

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
        if (SystemViewHelper.calculateDistance(startX, startY) <= SystemViewHelper.calculateDistance(endX, endY)) {
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
     * creates the fleet sharks which are in the orbit of a planet
     *
     * @param canvas the canvas to draw at
     * @param fleetOrbits all fleets in the orbit
     * @param dblClickForFleet the callback function
     * @param dragEndForFleet
     */
    setFleetsInOrbits(canvas: Svg,
                      fleetOrbits: Map<FleetOrbit, Fleet>,
                      dblClickForFleet: (event: PointerEvent) => void,
                      dragEndForFleet: (draggedFleet?: Fleet, targetFleet?: Fleet, orbit?: Orbit) => void) {
        this.setCanvas(canvas);

        fleetOrbits.forEach((fleet, fleetOrbit) => {

            let fleetSharkID = this.getFleetSharkID(fleet);
            this.fleetsInOrbitsMap.set(fleetSharkID, fleet);

            let orbit: Orbit = fleetOrbit.orbit!;
            let x: number = orbit.xCoordinate + 25 + (Array.from(fleetOrbits.keys()).indexOf(fleetOrbit) % 2 == 0 ? 15 : 0);
            let y: number = orbit.yCoordinate + 25;
            let fleetSharkPoints: ArrayXY[] = this.createFleetSharkPoints(x, y, orbit);

            this.createFleetSharkAndPrint(fleetSharkID, dragEndForFleet, fleetSharkPoints, dblClickForFleet, fleet);
        });
    }

    /**
     * creates a fleet shark, a text and groups them in the svg
     *
     * @param fleetSharkID the id
     * @param dragEndForFleet the drag end callback
     * @param fleetSharkPoints the polygon points itself
     * @param dblClickForFleet the double click callback
     * @param fleet the fleet to print the fleet shark for
     * @private
     */
    private createFleetSharkAndPrint(fleetSharkID: string,
                                     dragEndForFleet: (draggedFleet?: Fleet, targetFleet?: Fleet, orbit?: Orbit) => void,
                                     fleetSharkPoints: ArrayXY[],
                                     dblClickForFleet: (event: PointerEvent) => void, fleet: Fleet) {
        let sd: StrokeData = {
            color: "black",
            width: 1
        }

        let group = this.canvas?.group()
            .id(fleetSharkID + "-group");

        if (!fleet.move) {
            // make fleet group draggable if it is not in motion
            group!.draggable(true).on('dragend', this.dragEndFleetGroup(dragEndForFleet));
        }

        this.groupsByID.set(fleetSharkID + "-group", group!);
        this.areaDefinitions.push(new AreaDefinition(group!));

        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        let userID = this.tokenStorage.getUserID();
        if (fleet.owner.idUser == userID) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }
        group!.polygon(fleetSharkPoints).fill(fleetSharkColor).stroke(sd).id(fleetSharkID).dblclick(dblClickForFleet);

        let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);
        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];

        let text: Text = group!.text(fleet.name)
            .x(xText[0])
            .y(yText[1])
            .addClass("text")
            .stroke("white")
            .id(fleetSharkID + "-txt")
            .dblclick(dblClickForFleet);

        this.canvas?.add(group!);
        this.fleetTextsByIdSVGMap.set(fleetSharkID + "-txt", text);
        this.fleetsInOrbitByTextSVGMap.set(text, fleet);
    }

    /**
     * on drag end the drag target should be detected and passed to the callback function
     * @param dragEndForFleet
     * @private
     */
    private dragEndFleetGroup(dragEndForFleet: (draggedFleet?: Fleet, targetFleet?: Fleet, orbit?: Orbit) => void) {
        return (e: any) => {
            let target = <SVGGElement>e.target;
            let id: string = target.id;
            let group = this.groupsByID.get(id);
            if (!group) {
                return;
            }
            let draggedFleet = this.getFleetByGroupID(id);
            if (!draggedFleet) {
                return;
            }
            let userID = this.tokenStorage.getUserID();
            // detect if dragged fleet is another fleet
            let areaDefinitions = this.areaDefinitions.filter(a => a.isInside(group!));
            if (!!areaDefinitions && areaDefinitions.length > 0) {
                let detectedMergeTarget = areaDefinitions[0];
                let targetFleet = this.getFleetByGroupID(detectedMergeTarget.referenceGroup.id());
                if (!!targetFleet && draggedFleet.owner.idUser == userID && targetFleet.owner.idUser == userID) {
                    // only if the logged in user is the owner of both fleets
                    dragEndForFleet(draggedFleet, targetFleet, undefined);
                    return;
                }
            }
            // detect if dragged fleet is inside of a celestial body areaF
            let celestialAreas = this.celestialAreas.filter(a => a.isInside(group!));
            if (!!celestialAreas && celestialAreas.length > 0) {
                let detectedMoveTarget = celestialAreas[0];
                let orbitId = detectedMoveTarget.referenceId;
                let orbit = this.getOrbitOfOrbitByID(orbitId);
                // call callback function
                dragEndForFleet(draggedFleet, undefined, orbit);
                return;
            }
        };
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
        let points = SystemViewHelper.defineFleetSharkPoints(x, y);

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
     * @param system the system to display
     * @param callbackFunctionForClick the callback function to every orbit
     */
    setOrbits(canvas: Svg, system: StarSystem, callbackFunctionForClick: Function | null) {
        this.setCanvas(canvas);

        let planetsByOrbit: Map<Orbit, Planet> = new Map<Orbit, Planet>();
        system.planets.forEach((planet) => planetsByOrbit.set(planet.orbit, planet));
        let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForStarSystem(this.tokenStorage.getUserID(), system.planets);

        this.orbits = orbitDefinitions.map(od => od.orbit);
        this.sortByOrbit();
        this.setViewBox();

        this.createCoordinateCross();

        this.hyperLimit = this.calculateHyperLimit(system, orbitDefinitions);
        this.canvas!
            .circle()
            .x(0)
            .y(0)
            .id("hyper-limit-of-" + system.idStarSystem)
            .fill("none")
            .addClass("hyper-limit")
            .radius(this.hyperLimit);

        orbitDefinitions.forEach(orbitDefinition => {
            const orbit = orbitDefinition.orbit;
            let celestialBodyID = this.getCelestialBodyID(orbit);
            let orbitID = this.getOrbitID(orbit);
            let radius: number = SystemViewHelper.calculateDistance(orbit.xCoordinate, orbit.yCoordinate);

            this.canvas!
                .circle()
                .x(0)
                .y(0)
                .id(orbitID)
                .fill("none")
                .addClass("orbit")
                .radius(radius)
                .on('mouseover', evt => this.mouseOverEventCallback(<MouseEvent>evt));

            this.createCoordinateSystem(orbit.xCoordinate, orbit.yCoordinate, 50, orbitID);

            this.orbitsMap.set(orbitID, orbit);
            this.celestialAreas.push(new CelestialAreaDefinition(orbit, orbitID, 50));

            if (orbitDefinition.isColonizable) {
                // to rotate around the center just flip the + and -
                let x1 = orbit.xCoordinate - 9;
                let y1 = orbit.yCoordinate - 8;
                let x2 = orbit.xCoordinate + 9;
                let y2 = orbit.yCoordinate + 8;

                let p1: LineCommand = ["M", x1, y1];
                let p2: CurveCommand = ["A", 1, 1, 1, 1, 1, x2, y2];

                let arr: PathArrayAlias = [p1, p2];
                // todo remember the path?
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

            this.canvas!
                .circle()
                .x(orbit.xCoordinate)
                .y(orbit.yCoordinate)
                .radius(5)
                .id(celestialBodyID)
                .fill(color)
                .click(callbackFunctionForClick);

            this.celestialBodyMap.set(celestialBodyID, orbit);
        });
    }

    /**
     * calculates the hyper limit
     * @param system
     * @param orbitDefinitions
     * @private
     */
    private calculateHyperLimit(system: StarSystem, orbitDefinitions: OrbitDefinition[]) {
        // todo convert light minutes to distance units
        const lightMinutesToHyperLimit = system.starClassType.lightMinutesToHyperLimit;
        let sortedRaises = orbitDefinitions
            .sort((o1, o2) => {
                let o1Radius = SystemViewHelper.calculateDistance(o1.orbit.xCoordinate, o1.orbit.yCoordinate);
                let o2Radius = SystemViewHelper.calculateDistance(o2.orbit.xCoordinate, o2.orbit.yCoordinate);
                return o1Radius > o2Radius ? 1 : -1;
            });

        const biggestRadiusOrbit = sortedRaises[sortedRaises.length - 1];
        const biggestRadius = SystemViewHelper.calculateDistance(biggestRadiusOrbit.orbit.xCoordinate, biggestRadiusOrbit.orbit.yCoordinate);
        return biggestRadius + lightMinutesToHyperLimit;
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

                    timer(8000).subscribe(() => {
                        let byId = this.canvas?.node.getElementById(celestialBodyID + "-pulser");
                        if (!!byId) {
                            // remove its still present
                            this.canvas!.removeElement(circlePulser)
                        }
                    })
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
     * calculates the distance between two points
     *
     * @param firstCoordinate the first coordinate
     * @param secondCoordinate the second coordinate
     * @private
     */
    private static calculateDistanceOfPoints(firstCoordinate: ArrayXY, secondCoordinate: ArrayXY): number {
        return Math.sqrt(Math.pow(firstCoordinate[0] - secondCoordinate[0], 2) + Math.pow(firstCoordinate[1] - secondCoordinate[1], 2));
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
            if (!!fleet.orbit.orbit) {
                id += fleet.orbit.orbit.xCoordinate + "." + fleet.orbit.orbit.yCoordinate + "-";
            }
            if (!!fleet.orbit.system) {
                id += fleet.orbit.system.idStarSystem + "-";
            }
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
     * returns the text to the given id
     *
     * @param id the id
     * @private
     */
    private getFleetTextByID(id: string): Text | undefined {
        return this.fleetTextsByIdSVGMap.get(id);
    }

    /**
     * returns the fleet shark to the given id
     *
     * @param id the id
     * @private
     */
    private getFleetByID(id: string): Fleet | undefined {
        return this.fleetsInOrbitsMap.get(id);
    }

    /**
     * returns the fleet identified by the group id
     * @param id
     * @private
     */
    private getFleetByGroupID(id: string): Fleet | undefined {
        let reducedId = id.replace("-group", "");
        return this.getFleetByID(reducedId);
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
     * @param event
     */
    getFleetTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let p = event.composedPath()[1];
        let x = <HTMLElement>p;
        return this.getFleetTextByID(x.id);
    }

    /**
     * returns the fleet shark if known by this id
     * @param event
     */
    getFleetByEvent(event: PointerEvent | MouseEvent): Fleet | undefined {
        let target: Shape = event.target as Shape;
        let id: string = target.id as unknown as string;
        return this.getFleetByID(id);
    }

    /**
     * returns the fleet shark if known by this id
     * @param text
     */
    getFleetByText(text: Text): Fleet | undefined {
        return this.fleetsInOrbitByTextSVGMap.get(text);
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
                + SystemViewHelper.getDifference(this.smallestYOrbit!.yCoordinate, this.biggestYOrbit!.yCoordinate)
                + " "
                + SystemViewHelper.getDifference(this.smallestXOrbit!.xCoordinate, this.biggestXOrbit!.xCoordinate);
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

        let radius: number = SystemViewHelper.calculateDistance(x, y);
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

    /**
     * states that two orbits have the same coordinates
     *
     * @param first
     * @param second
     */
    static isSameOrbit(first: Orbit, second: Orbit): boolean {
        let isEqual = true;
        if (first.xCoordinate != second.xCoordinate) {
            isEqual = false;
        }
        if (first.yCoordinate != second.yCoordinate) {
            isEqual = false;
        }
        return isEqual;
    }
}
