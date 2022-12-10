import {ArrayXY, Svg} from "@svgdotjs/svg.js";
import {Distance, FleetMarker, FleetOrbit, Move, Orbit, Planet, StarSystem} from "../../../services/swagger";
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

    setFleetsInMotion(canvas: Svg,
                      fleetsInMotion: Map<Move, FleetMarker[]>,
                      dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void,
                      dragEndForFleet: (draggedFleet?: FleetMarker, targetFleet?: FleetMarker, orbit?: Orbit) => void) {

        fleetsInMotion.forEach((fleets, move) => {
            if (!move.startOrbit.orbit || !move.targetOrbit.orbit) {
                return;
            }
            let {color, arr} = this.createStellarCoursePlot(move);

            let path = this.canvas!.path(arr).fill("none").stroke({color: color, width: 1});
            fleets.forEach(fleetMarker => {
                const fleetOrbit = fleetMarker.orbit;
                if (!fleetMarker.move || !fleetMarker.move.startOrbit.orbit || !fleetMarker.move.targetOrbit.orbit) {
                    return;
                }

                let startOrbit = fleetMarker.move.startOrbit.orbit;
                let targetOrbit = fleetMarker.move.targetOrbit.orbit;
                let distance = this.calculateDistanceOfOrbits(startOrbit, targetOrbit);

                let part = (fleetMarker.move!.originalDuration - fleetMarker.move!.moveDoneAtZero) / fleetMarker.move!.originalDuration;
                if (part < 0.1) {
                    part = 0.1;
                } else if (part > 0.9) {
                    part = 0.9;
                }
                let coveredTrackLength = distance * part;

                let pointAt = path.pointAt(coveredTrackLength);

                let fleetSharkPoints: ArrayXY[] = this.defineFleetSharkPoints(pointAt.x, pointAt.y);

                this.createFleetSharkAndPrint(fleetOrbit, fleetMarker, dragEndForFleet, fleetSharkPoints, dblClickForFleet);
            });
        });
    }

    setFleetsInOrbits(canvas: Svg,
                      fleetOrbits: Map<FleetOrbit, FleetMarker>,
                      dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void,
                      dragEndForFleet: (draggedFleet?: FleetMarker, targetFleet?: FleetMarker, orbit?: Orbit) => void) {
        this.setCanvas(canvas);

        fleetOrbits.forEach((fleetMarker, fleetOrbit) => {

            let fleetSharkID = this.getFleetSharkID(fleetMarker);
            this.fleetsById.set(fleetSharkID, fleetMarker);

            let orbit: Orbit = fleetOrbit.orbit!;
            let x: number = this.convertToStandardMetric(orbit.xCoordinate) + 25 + (Array.from(fleetOrbits.keys()).indexOf(fleetOrbit) % 2 == 0 ? 15 : 0);
            let y: number = this.convertToStandardMetric(orbit.yCoordinate) + 25;
            let fleetSharkPoints: ArrayXY[] = this.createFleetSharkPoints(x, y, orbit);

            this.createFleetSharkAndPrint(fleetOrbit, fleetMarker, dragEndForFleet, fleetSharkPoints, dblClickForFleet);
        });
    }

    private createFleetSharkAndPrint(fleetOrbit: FleetOrbit | undefined,
                                     fleetMarker: FleetMarker,
                                     dragEndForFleet: (draggedFleet?: FleetMarker, targetFleet?: FleetMarker, orbit?: Orbit) => void,
                                     fleetSharkPoints: ArrayXY[],
                                     dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void) {

        const fleetSharkText = fleetMarker.name + " of " + fleetMarker.owner.name;
        const canBeDragged = !fleetMarker.move && fleetMarker.state.isActive;
        const userIsOwner = fleetMarker.owner.id == this.tokenStorage.getUserID();

        let group = this.createFleetGroup(fleetMarker, userIsOwner, fleetSharkPoints, dblClickForFleet, fleetOrbit, fleetSharkText);

        if (userIsOwner && canBeDragged) {
            group!.draggable(true).on('dragend', this.dragEndFleetGroup(dragEndForFleet));
        }
        this.areaDefinitions.push(new AreaDefinition(group!));
    }

    private dragEndFleetGroup(dragEndForFleet: (draggedFleet?: FleetMarker, targetFleet?: FleetMarker, orbit?: Orbit) => void) {
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
                if (!!targetFleet && draggedFleet.owner.id == userID && targetFleet.owner.id == userID) {
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

    setOrbits(canvas: Svg, system: StarSystem) {
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

            this.createLocalPolarCoordinateSystem(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate), 50, orbitID);

            this.drawCelestial(orbitDefinition);
        });
    }
}
