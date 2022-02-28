import {ArrayXY, CurveCommand, G, LineCommand, PathArrayAlias, Shape, StrokeData, Svg, Text} from "@svgdotjs/svg.js";
import {Distance, Fleet, FleetDistributionPerUser, Move, Orbit, StarSystem, UserJson} from "../../../services/swagger";
import {RestrictedFleetArea} from "./restricted-fleet-area";
import {CelestialAreaDefinition} from "./celestial-area-definition";
import {OrbitDefinition} from "./orbit-definition";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {NavigationCalculator} from "../../../NavigationCalculator";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class InterstellarViewHelper extends SubscriptionManager {

    public static readonly STANDARD_METRIC = DistanceMetricEnum.LY;
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
    private USER_SELECTOR_ID_PREFIX: string = Math.random() + "-owner";

    private celestialBodyMap: Map<String, Orbit> = new Map<String, Orbit>();

    private orbitsMap: Map<String, Orbit> = new Map<String, Orbit>();

    private fleetTextsByIdSVGMap: Map<String, Text> = new Map<String, Text>();
    private fleetsByIdMap: Map<String, Fleet> = new Map<String, Fleet>();
    private fleetsByTextSVGMap: Map<Text, Fleet> = new Map<Text, Fleet>();
    private fleetOwnersInSystemMap: Map<String, UserJson> = new Map<String, UserJson>();
    private fleetOwnerInSystemByTextSVGMap: Map<Text, UserJson> = new Map<Text, UserJson>();

    private restrictedAreasByOrbit: Map<String, RestrictedFleetArea[]> = new Map<String, RestrictedFleetArea[]>();

    private groupsByID: Map<String, G> = new Map<String, G>();
    private celestialAreas: CelestialAreaDefinition[] = [];

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
            this.fleetTextsByIdSVGMap.clear();
            this.fleetOwnerInSystemByTextSVGMap.clear();
            this.restrictedAreasByOrbit.clear();
            this.celestialAreas = [];
        }
    }

    setFleetsInInterstellarMotion(canvas: Svg,
                                  fleetsInMotion: Map<Move, Fleet[]>,
                                  dblClickForFleet: (event: PointerEvent) => void) {
        fleetsInMotion.forEach((fleets, move) => {

            let {color, arr} = this.createCoursePlotForInterstellarMotion(move);

            let path = this.canvas!.path(arr).fill("none").stroke({color: color, width: 1});
            fleets.forEach(fleet => {

                let startOrbit = fleet.move!.startOrbit.system!.orbit;
                let targetOrbit = fleet.move!.targetOrbit.system!.orbit;
                let distance = InterstellarViewHelper.calculateDistanceOfOrbits(startOrbit, targetOrbit, DistanceMetricEnum.LS);

                let part = (fleet.move!.originalDuration - fleet.move!.moveDoneAtZero) / fleet.move!.originalDuration;
                if (part < 0.1) {
                    part = 0.1;
                } else if (part > 0.9) {
                    part = 0.9;
                }
                let coveredTrackLength = distance * part;

                let pointAt = path.pointAt(coveredTrackLength);

                let fleetSharkPoints: ArrayXY[] = InterstellarViewHelper.defineFleetSharkPoints(pointAt.x, pointAt.y);
                let fleetSharkID = this.getFleetSharkID(fleet);
                this.fleetsByIdMap.set(fleetSharkID, fleet);
                this.createFleetSharkInterstellarMotionAndPrint(fleetSharkID, fleetSharkPoints, dblClickForFleet, fleet);
            });
        });
    }

    private createCoursePlotForInterstellarMotion(move: Move) {
        // todo check start planet's orbit
        let startX: number = this.convertToStandardMetric(move.startOrbit.system!.orbit.xCoordinate);
        let startY: number = this.convertToStandardMetric(move.startOrbit.system!.orbit.yCoordinate);

        let endX: number = this.convertToStandardMetric(move.targetOrbit.system!.orbit.xCoordinate);
        let endY: number = this.convertToStandardMetric(move.targetOrbit.system!.orbit.yCoordinate);

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
        if (InterstellarViewHelper.calculateDistance(startX, startY) <= InterstellarViewHelper.calculateDistance(endX, endY)) {
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

    private createFleetSharkInterstellarMotionAndPrint(fleetSharkID: string,
                                                       fleetSharkPoints: ArrayXY[],
                                                       dblClickForFleet: (event: PointerEvent) => void,
                                                       fleet: Fleet) {
        let sd: StrokeData = {
            color: "black",
            width: 1
        }

        let group = this.canvas?.group()
            .id(fleetSharkID + "-group");

        this.groupsByID.set(fleetSharkID + "-group", group!);

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
        this.fleetsByTextSVGMap.set(text, fleet);
        this.fleetTextsByIdSVGMap.set(fleetSharkID + "-txt", text);
    }

    setFleetsAtSystem(canvas: Svg,
                      fleetDistributionPerUsers: FleetDistributionPerUser[],
                      dblClickForFleet: (event: PointerEvent, system: StarSystem) => void,
                      dragEndForFleet: (draggedFleet?: UserJson, fromSystem?: StarSystem, targetOrbit?: Orbit) => void) {
        this.setCanvas(canvas);

        fleetDistributionPerUsers.forEach(fd => {
            let system = fd.starSystem;
            let orbit = system.orbit;
            let users = fd.users;
            users.forEach(owner => {
                let fleetSharkIdForOwner = this.getFleetSharkIdForOwner(owner);
                this.fleetOwnersInSystemMap.set(fleetSharkIdForOwner, owner);

                let x: number = this.convertToStandardMetric(orbit.xCoordinate) + 25 + (users.indexOf(owner) % 2 == 0 ? 15 : 0);
                let y: number = this.convertToStandardMetric(orbit.yCoordinate) + 25;
                let fleetSharkPoints: ArrayXY[] = this.createFleetSharkPoints(x, y, orbit);
                this.createFleetSharkAndPrintAtSystem(fleetSharkIdForOwner, dragEndForFleet, fleetSharkPoints, dblClickForFleet, system, owner);
            });

        });
    }

    private createFleetSharkAndPrintAtSystem(fleetSharkID: string,
                                             dragEndForFleet: (draggedFleet?: UserJson, fromSystem?: StarSystem, targetOrbit?: Orbit) => void,
                                             fleetSharkPoints: ArrayXY[],
                                             dblClickForFleet: (event: PointerEvent, system: StarSystem) => void,
                                             system: StarSystem,
                                             owner: UserJson) {
        let sd: StrokeData = {
            color: "black",
            width: 1
        }

        let group = this.canvas?.group()
            .id(fleetSharkID + "-group");

        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;

        let userID = this.tokenStorage.getUserID();
        if (userID == owner.idUser) {
            // make owner group draggable if it is dragged by the owner
            group!
                .draggable(true)
                .on('dragend', this.dragEndFleetGroupAtSystem((draggedUser, targetOrbit) => {
                    if (!!targetOrbit) {
                        dragEndForFleet(draggedUser, system, targetOrbit)
                    }
                }));
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }

        this.groupsByID.set(fleetSharkID + "-group", group!);

        group!
            .polygon(fleetSharkPoints)
            .fill(fleetSharkColor)
            .stroke(sd)
            .id(fleetSharkID)
            .dblclick((event: PointerEvent) => {
                dblClickForFleet(event, system);
            });


        let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);
        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];

        let text: Text = group!.text(owner.username)
            .x(xText[0])
            .y(yText[1])
            .addClass("text")
            .stroke("white")
            .id(fleetSharkID + "-txt")
            .dblclick((event: PointerEvent) => {
                dblClickForFleet(event, system);
            });

        this.canvas?.add(group!);
        this.fleetTextsByIdSVGMap.set(fleetSharkID + "-txt", text);
        this.fleetOwnerInSystemByTextSVGMap.set(text, owner);
    }

    private dragEndFleetGroupAtSystem(dragEndForFleet: (draggedFleetSharkOfUser?: UserJson, orbit?: Orbit) => void) {
        return (e: any) => {
            let target = <SVGGElement>e.target;
            let id: string = target.id;
            let group = this.groupsByID.get(id);
            if (!group) {
                return;
            }
            let fleetOwner = this.getFleetOwnerByGroupID(id);
            if (!fleetOwner) {
                return;
            }
            // detect if dragged fleet is inside of a celestial body areaF
            let celestialAreas = this.celestialAreas.filter(a => a.isInside(group!));
            if (celestialAreas.length > 0) {
                let detectedMoveTarget = celestialAreas[0];
                let orbitId = detectedMoveTarget.referenceId;
                let orbit = this.getOrbitOfOrbitByID(orbitId);
                // call callback function
                dragEndForFleet(fleetOwner, orbit);
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
        let points = InterstellarViewHelper.defineFleetSharkPoints(x, y);

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
     * starts the complete process of building the canvas and it's attachments
     *
     * @param canvas the canvas to draw at
     * @param orbits all orbits to display
     * @param callbackFunctionForClick the callback function to every orbit
     */
    setOrbits(canvas: Svg, orbits: OrbitDefinition[], callbackFunctionForClick: Function | null) {
        this.setCanvas(canvas);
        this.orbits = orbits.map(od => od.orbit);
        this.sortByOrbit();
        this.setViewBox();

        this.createCoordinateCross();

        orbits.forEach(orbitDefinition => {
            const orbit = orbitDefinition.orbit;
            let celestialBodyID = this.getCelestialBodyID(orbit);
            let orbitID = this.getOrbitID(orbit);

            this.orbitsMap.set(orbitID, orbit);
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

            this.canvas!
                .circle()
                .x(this.convertToStandardMetric(orbit.xCoordinate))
                .y(this.convertToStandardMetric(orbit.yCoordinate))
                .radius(5)
                .id(celestialBodyID)
                .fill(color)
                .click(callbackFunctionForClick);

            this.celestialBodyMap.set(celestialBodyID, orbit);
        });
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
    public static calculateDistanceOfPoints(firstCoordinate: ArrayXY, secondCoordinate: ArrayXY): number {
        return Math.sqrt(Math.pow(firstCoordinate[0] - secondCoordinate[0], 2) + Math.pow(firstCoordinate[1] - secondCoordinate[1], 2));
    }

    /**
     * calculates the distance between two points
     *
     * @param firstOrbit the first coordinate
     * @param secondOrbit the second coordinate
     * @param distanceMetric the target metric
     * @private
     */
    public static calculateDistanceOfOrbits(firstOrbit: Orbit, secondOrbit: Orbit, distanceMetric: DistanceMetricEnum): number {
        const originX = NavigationCalculator.convertDistanceToMetric(firstOrbit.xCoordinate, distanceMetric);
        const originY = NavigationCalculator.convertDistanceToMetric(firstOrbit.yCoordinate, distanceMetric);
        const destinationX = NavigationCalculator.convertDistanceToMetric(secondOrbit.xCoordinate, distanceMetric);
        const destinationY = NavigationCalculator.convertDistanceToMetric(secondOrbit.yCoordinate, distanceMetric);

        return InterstellarViewHelper.calculateDistanceOfPoints([originX, originY], [destinationX, destinationY]);
    }

    /**
     * creates an unique orbit identifier
     *
     * @param orbit the orbit to identify
     * @private
     */
    private getCelestialBodyID(orbit: Orbit): string {
        return this.CELESTIAL_BODY_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
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
                id += fleet.orbit.orbit.xCoordinate.coordinate + "." + fleet.orbit.orbit.yCoordinate.coordinate + "-";
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
        return this.ORBIT_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
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
     * returns the fleet text if known by this id
     * @param event
     */
    getFleetTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let p = event.composedPath()[1];
        let x = <HTMLElement>p;
        return this.getFleetTextByID(x.id);
    }

    /**
     * returns the fleet owner if known by this id
     * @param event
     */
    getFleetOwnerForOwnerByEvent(event: PointerEvent | MouseEvent): UserJson | undefined {
        let target: Shape = event.target as Shape;
        let id: string = target.id as unknown as string;
        return this.getOwnerByID(id);
    }

    getFleetByEvent(event: PointerEvent | MouseEvent): Fleet | undefined {
        let target: Shape = event.target as Shape;
        let id: string = target.id as unknown as string;
        return this.getFleetByID(id);
    }

    private getFleetByID(id: string): Fleet | undefined {
        return this.fleetsByIdMap.get(id);
    }

    /**
     * returns the fleet owner if known by this id
     * @param text
     */
    getFleetOwnerByText(text: Text): UserJson | undefined {
        return this.fleetOwnerInSystemByTextSVGMap.get(text);
    }

    getFleetByText(text: Text): Fleet | undefined {
        return this.fleetsByTextSVGMap.get(text);
    }

    /**
     * creates an unique identifier for the users fleets in the system
     *
     * @param user the user to identify
     * @private
     */
    private getFleetSharkIdForOwner(user: UserJson): string {
        return this.USER_SELECTOR_ID_PREFIX + "-" + user.idUser;
    }

    /**
     * returns the owner of a system symbolic fleet shark identified by the group id
     * @param id
     * @private
     */
    private getFleetOwnerByGroupID(id: string): UserJson | undefined {
        let reducedId = id.replace("-group", "");
        return this.getOwnerByID(reducedId);
    }

    /**
     * returns the fleet shark to the given id
     *
     * @param id the id
     * @private
     */
    private getOwnerByID(id: string): UserJson | undefined {
        return this.fleetOwnersInSystemMap.get(id);
    }

    /**
     * sorts the systems by their orbit's radius
     * @private
     */
    private sortByOrbit() {
        if (!this.orbits) {
            throw new Error("The orbits must be present to calculate the universe view.");
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
     * returns the view box string for the svg
     */
    private setViewBox() {
        let viewBoxDef: string = "0 0 0 0";
        let isPresent = !!this.smallestXOrbit && !!this.biggestXOrbit && !!this.smallestYOrbit && !!this.biggestYOrbit;
        if (isPresent) {
            viewBoxDef = this.convertToStandardMetric(this.smallestXOrbit!.xCoordinate)
                + " "
                + this.convertToStandardMetric(this.smallestYOrbit!.yCoordinate)
                + " "
                + InterstellarViewHelper.getSum(this.convertToStandardMetric(this.smallestYOrbit!.yCoordinate),
                    this.convertToStandardMetric(this.biggestYOrbit!.yCoordinate))
                + " "
                + InterstellarViewHelper.getSum(this.convertToStandardMetric(this.smallestXOrbit!.xCoordinate),
                    this.convertToStandardMetric(this.biggestXOrbit!.xCoordinate));
        }
        this.canvas!.viewbox(viewBoxDef);
    }

    private convertToStandardMetric(distance: Distance) {
        return NavigationCalculator.convertDistanceToMetric(distance, InterstellarViewHelper.STANDARD_METRIC);
    }

    /**
     * returns the difference of two values
     *
     * @param a first value
     * @param b second value
     * @private
     */
    public static getSum(a: number, b: number): number {
        return Math.abs(b) + Math.abs(a);
    }

    /**
     * creates the coordinate axis cross
     *
     * @private
     */
    private createCoordinateCross() {
        let minXCoord = this.convertToStandardMetric(this.smallestXOrbit!.xCoordinate);
        let maxXCoord = this.convertToStandardMetric(this.biggestXOrbit!.xCoordinate);
        let x = Math.abs(minXCoord) < Math.abs(maxXCoord) ? Math.abs(maxXCoord) : Math.abs(minXCoord);
        let minYCoord = this.convertToStandardMetric(this.smallestYOrbit!.yCoordinate);
        let maxYCoord = this.convertToStandardMetric(this.biggestYOrbit!.yCoordinate);
        let y = Math.abs(minYCoord) < Math.abs(maxYCoord) ? Math.abs(maxYCoord) : Math.abs(minYCoord);

        let radius: number = InterstellarViewHelper.calculateDistance(x, y);
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
}
