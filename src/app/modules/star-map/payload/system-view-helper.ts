import {ArrayXY, StrokeData, Svg, Text} from "@svgdotjs/svg.js";
import {Distance, Fleet, FleetOrbit, Move, Orbit, Planet, StarSystem} from "../../../services/swagger";
import {AreaDefinition} from "../area-definition";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {OrbitDefinition} from "./orbit-definition";
import {BasicViewHelper} from "../../../basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class SystemViewHelper extends BasicViewHelper {

    static readonly STANDARD_METRIC = DistanceMetricEnum.LS;

    constructor(protected tokenStorage: TokenStorage) {
        super(SystemViewHelper.STANDARD_METRIC);
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
                let distance = this.calculateDistanceOfOrbits(startOrbit, targetOrbit);

                let part = (fleet.move!.originalDuration - fleet.move!.moveDoneAtZero) / fleet.move!.originalDuration;
                if (part < 0.1) {
                    part = 0.1;
                } else if (part > 0.9) {
                    part = 0.9;
                }
                let coveredTrackLength = distance * part;

                let pointAt = path.pointAt(coveredTrackLength);

                let fleetSharkPoints: ArrayXY[] = this.defineFleetSharkPoints(pointAt.x, pointAt.y);
                let fleetSharkID = this.getFleetSharkID(fleet);

                this.createFleetSharkAndPrint(fleetSharkID, dragEndForFleet, fleetSharkPoints, dblClickForFleet, fleet);
            });
        });
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
            this.fleetsById.set(fleetSharkID, fleet);

            let orbit: Orbit = fleetOrbit.orbit!;
            let x: number = this.convertToStandardMetric(orbit.xCoordinate) + 25 + (Array.from(fleetOrbits.keys()).indexOf(fleetOrbit) % 2 == 0 ? 15 : 0);
            let y: number = this.convertToStandardMetric(orbit.yCoordinate) + 25;
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

        let userID = this.tokenStorage.getUserID();
        if (!fleet.move && fleet.owner.idUser == userID) {
            // make fleet group draggable if it is not in motion
            group!.draggable(true).on('dragend', this.dragEndFleetGroup(dragEndForFleet));
        }

        this.groupsByID.set(fleetSharkID + "-group", group!);
        this.areaDefinitions.push(new AreaDefinition(group!));

        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (fleet.owner.idUser == userID) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }
        group!.polygon(fleetSharkPoints).fill(fleetSharkColor).stroke(sd).id(fleetSharkID).dblclick(dblClickForFleet);

        let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);
        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];

        let text: Text = group!.text(fleet.name + " of " + fleet.owner.username)
            .x(xText[0])
            .y(yText[1])
            .addClass("fleet-text")
            .id(fleetSharkID + "-txt")
            .dblclick(dblClickForFleet);

        this.canvas?.add(group!);
        this.fleetTextsById.set(fleetSharkID + "-txt", text);
        this.fleetsByText.set(text, fleet);
    }

    /**
     * on drag end the drag target should be detected and passed to the callback function
     * @param dragEndForFleet
     * @private
     */
    private dragEndFleetGroup(dragEndForFleet: (draggedFleet?: Fleet, targetFleet?: Fleet, orbit?: Orbit) => void) {
        return (e: any) => {
            const target = <SVGGElement>e.target;
            const id: string = target.id;
            const group = this.groupsByID.get(id);
            if (!group) {
                return;
            }
            const draggedFleet = this.getFleetByGroupID(id);
            if (!draggedFleet) {
                return;
            }
            const userID = this.tokenStorage.getUserID();
            // detect if dragged fleet is another fleet
            const areaDefinitions = this.areaDefinitions.filter(a => a.isInside(group!));
            if (!!areaDefinitions && areaDefinitions.length > 0) {
                let detectedMergeTarget = areaDefinitions[0];
                let targetFleet = this.getFleetByGroupID(detectedMergeTarget.referenceGroup.id());
                if (!!targetFleet && draggedFleet.owner.idUser == userID && targetFleet.owner.idUser == userID) {
                    // only if the logged-in user is the owner of both fleets
                    dragEndForFleet(draggedFleet, targetFleet, undefined);
                    return;
                }
            }
            // detect if dragged fleet is inside a celestial body areaF
            const celestialAreas = this.celestialAreas.filter(a => a.isInside(group!));
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
        let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForPlanet(this.tokenStorage.getUserID(), system.planets);

        this.orbits = orbitDefinitions.map(od => od.orbit);
        this.sortByOrbit();
        this.createPolarCoordinateSystem();
        this.setViewBox(undefined, 0.7);

        this.hyperLimit = this.calculateHyperLimit(system);
        this.canvas!
            .circle()
            .x(0)
            .y(0)
            .id("hyper-limit-of-" + system.idStarSystem)
            .fill("none")
            .addClass("hyper-limit")
            .radius(this.hyperLimit);

        this.canvas!
            .circle()
            .x(0)
            .y(0)
            .id("star-of-" + system.idStarSystem)
            .fill("yellow")
            .addClass("star")
            .radius(BasicViewHelper.STAR_RADIUS);

        orbitDefinitions.forEach(orbitDefinition => {
            const orbit = orbitDefinition.orbit;
            let orbitID = this.getOrbitID(orbit);
            let radius: number = BasicViewHelper.calculateDistance(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate));

            this.canvas!
                .circle()
                .x(0)
                .y(0)
                .id(orbitID)
                .fill("none")
                .addClass("orbit")
                .radius(radius);

            //this.createCoordinateSystem(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate), 50, orbitID);
            this.createLocalPolarCoordinateSystem(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate), 50, orbitID);

            this.drawCelestial(orbitDefinition, callbackFunctionForClick);
        });
    }
}
