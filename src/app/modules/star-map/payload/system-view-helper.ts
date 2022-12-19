import {Distance, FleetMarker, FleetOrbit, Orbit, Planet, StarSystem} from "../../../services/swagger";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {OrbitDefinition} from "./orbit-definition";
import {BasicViewHelper} from "../../../basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class SystemViewHelper extends BasicViewHelper {

    static readonly STANDARD_METRIC = DistanceMetricEnum.LS;

    constructor(protected tokenStorage: TokenStorage) {
        super(tokenStorage, SystemViewHelper.STANDARD_METRIC);
    }

    setFleets(fleetMarkers: FleetMarker[]) {
        const moving = fleetMarkers.filter(f => !!f.move);
        this.setFleetsInMotion(moving); // fixme fleet group and collection are overlapping and ugly

        const fleetsAtSameOrbit = new Map<string, FleetMarker[]>();
        const immobile = fleetMarkers.filter(f => !f.move);
        immobile.forEach(fleetMarker => {
            const orbit = fleetMarker.orbit!.orbit!;
            const orbitID = this.getOrbitID(orbit)!;
            let markers = fleetsAtSameOrbit.get(orbitID);
            if (!markers) {
                markers = [];
            }
            markers.push(fleetMarker);
            fleetsAtSameOrbit.set(orbitID, markers);
        });

        for (let atSameOrbit of fleetsAtSameOrbit.values()) {
            if (atSameOrbit.length > 1) {
                this.createFleetCollection(atSameOrbit);
            } else {
                const fleetMarker = atSameOrbit[0];
                const orbit = fleetMarker.orbit!.orbit!;
                this.createFleetGroup(fleetMarker, orbit.xCoordinate.coordinate, orbit.yCoordinate.coordinate, orbit);
            }
        }
    }

    setFleetsInMotion(fleetsInMotion: FleetMarker[]) {

        fleetsInMotion.forEach(fleetMarker => {
            if (!fleetMarker.move || !fleetMarker.move.startOrbit.orbit || !fleetMarker.move.targetOrbit.orbit) {
                return;
            }
            let arr = this.createStellarCoursePlot(fleetMarker.move!);
            let startOrbit = fleetMarker.move.startOrbit.orbit;
            let targetOrbit = fleetMarker.move.targetOrbit.orbit;
            let pointAt = this.calculatePositionOnTrack(startOrbit, targetOrbit, fleetMarker, arr);
            this.enrichWithVirtualOrbit(pointAt, fleetMarker);
            this.createFleetGroup(fleetMarker, pointAt.x, pointAt.y, fleetMarker.orbit!.orbit!);
        });
    }

    setFleetsInOrbits(fleetOrbits: Map<FleetOrbit, FleetMarker>) {

        fleetOrbits.forEach((fleetMarker, fleetOrbit) => {

            let fleetSharkID = this.getFleetSharkID(fleetMarker);
            this.setFleetById(fleetSharkID, fleetMarker);

            let orbit: Orbit = fleetOrbit.orbit!;
            let x: number = this.convertToStandardMetric(orbit.xCoordinate) + 25 + (Array.from(fleetOrbits.keys()).indexOf(fleetOrbit) % 2 == 0 ? 15 : 0);
            let y: number = this.convertToStandardMetric(orbit.yCoordinate) + 25;
            this.createFleetGroup(fleetMarker, x, y, orbit);
        });
    }

    drawOrbits(system: StarSystem) {
        let planetsByOrbit: Map<Orbit, Planet> = new Map<Orbit, Planet>();
        system.planets.forEach((planet) => planetsByOrbit.set(planet.orbit, planet));
        let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForPlanet(this.tokenStorage.getUserID(), system.planets);

        this.setOrbits(orbitDefinitions);
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
            .addClass(BasicViewHelper.RESIZE_ON_ZOOM_MARKER)
            .radius(BasicViewHelper.STAR_RADIUS_IN_SYSTEM);

        orbitDefinitions.forEach(orbitDefinition => {
            const orbit = orbitDefinition.orbit;
            let orbitID = this.getOrbitID(orbit);
            let radius: number = BasicViewHelper.calculateDistance(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate));

            this.canvas!
                .circle()
                .x(0)
                .y(0)
                .id(orbitID + BasicViewHelper.ORBIT_SUFFIX)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .addClass(BasicViewHelper.ORBIT_MARKER)
                .radius(radius);

            this.createLocalPolarCoordinateSystem(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate), 50, orbitID);

            this.drawCelestial(orbitDefinition);
        });
    }
}
