import {ArrayXY, Svg} from "@svgdotjs/svg.js";
import {Distance, FleetMarker, FleetOrbit, Orbit, Planet, StarSystem} from "../../../services/swagger";
import {AreaDefinition} from "../area-definition";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {OrbitDefinition} from "./orbit-definition";
import {BasicViewHelper} from "../../../basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class SystemViewHelper extends BasicViewHelper {

    static readonly STANDARD_METRIC = DistanceMetricEnum.LS;

    constructor(protected tokenStorage: TokenStorage) {
        super(tokenStorage, SystemViewHelper.STANDARD_METRIC);
    }

    setFleetsInMotion(canvas: Svg,
                      fleetsInMotion: FleetMarker[],
                      dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void) {

        fleetsInMotion.forEach(fleetMarker => {
            if (!fleetMarker.move!.startOrbit.orbit || !fleetMarker.move!.targetOrbit.orbit) {
                return;
            }
            let {color, arr} = this.createStellarCoursePlot(fleetMarker.move!);

            let path = this.canvas!.path(arr).fill(BasicViewHelper.NONE_FILL_COLOR).stroke({color: color, width: 1});
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

            this.createFleetGroup(fleetMarker, fleetSharkPoints, dblClickForFleet, fleetOrbit);
        });
    }

    setFleetsInOrbits(canvas: Svg,
                      fleetOrbits: Map<FleetOrbit, FleetMarker>,
                      dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void) {
        this.setCanvas(canvas);

        fleetOrbits.forEach((fleetMarker, fleetOrbit) => {

            let fleetSharkID = this.getFleetSharkID(fleetMarker);
            this.fleetsById.set(fleetSharkID, fleetMarker);

            let orbit: Orbit = fleetOrbit.orbit!;
            let x: number = this.convertToStandardMetric(orbit.xCoordinate) + 25 + (Array.from(fleetOrbits.keys()).indexOf(fleetOrbit) % 2 == 0 ? 15 : 0);
            let y: number = this.convertToStandardMetric(orbit.yCoordinate) + 25;
            let fleetSharkPoints: ArrayXY[] = this.createFleetSharkPoints(x, y, orbit);

            let group = this.createFleetGroup(fleetMarker, fleetSharkPoints, dblClickForFleet, fleetOrbit);
            this.areaDefinitions.push(new AreaDefinition(group!));
        });
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

        this.hyperLimitRadius = this.calculateHyperLimit(system);
        this.canvas!
            .circle()
            .x(0)
            .y(0)
            .id("hyper-limit-of-" + system.idStarSystem)
            .fill(BasicViewHelper.NONE_FILL_COLOR)
            .addClass(BasicViewHelper.HYPER_LIMIT_MARKER)
            .radius(this.hyperLimitRadius);

        this.canvas!
            .circle()
            .x(0)
            .y(0)
            .id("star-of-" + system.idStarSystem)
            .addClass(BasicViewHelper.STAR_MARKER)
            .addClass(BasicViewHelper.STAR_IN_SYSTEM_MARKER)
            .addClass(BasicViewHelper.NO_RESIZE_MARKER)
            .radius(BasicViewHelper.STAR_RADIUS_IN_SYSTEM);

        orbitDefinitions.forEach(orbitDefinition => {
            const orbit = orbitDefinition.orbit;
            let orbitID = this.getOrbitID(orbit);
            let radius: number = BasicViewHelper.calculateDistance(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate));

            this.canvas!
                .circle()
                .x(0)
                .y(0)
                .id(orbitID)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .addClass(BasicViewHelper.ORBIT_MARKER)
                .radius(radius);

            this.createLocalPolarCoordinateSystem(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate), 50, orbitID);

            this.drawCelestial(orbitDefinition);
        });
    }
}
