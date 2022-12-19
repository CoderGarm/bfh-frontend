import {Distance, FleetMarker} from "../../../services/swagger";
import {OrbitDefinition} from "./orbit-definition";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {BasicViewHelper} from "../../../basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class InterstellarViewHelper extends BasicViewHelper {

    public static readonly STANDARD_METRIC = DistanceMetricEnum.LY;

    constructor(tokenStorage: TokenStorage) {
        super(tokenStorage, InterstellarViewHelper.STANDARD_METRIC);
    }

    setFleetsInInterstellarMotion(fleetsInMotion: FleetMarker[]) {
        fleetsInMotion.forEach(fleetMarker => {
            if (!fleetMarker.move || !fleetMarker.move.startOrbit.orbit || !fleetMarker.move.targetOrbit.orbit
                || !fleetMarker.move.startOrbit.system || !fleetMarker.move.targetOrbit.system) {
                return;
            }
            let arr = this.createInterstellarCoursePlot(fleetMarker.move!);
            let startOrbit = fleetMarker.move.startOrbit.system.orbit;
            let targetOrbit = fleetMarker.move.targetOrbit.system.orbit;
            let pointAt = this.calculatePositionOnTrack(startOrbit, targetOrbit, fleetMarker, arr);
            this.enrichWithVirtualOrbit(pointAt, fleetMarker);
            this.createFleetGroup(fleetMarker, pointAt.x, pointAt.y, fleetMarker.orbit!.orbit!);
        });
    }

    setFleets(fleetMarkers: FleetMarker[]) {
        const moving = fleetMarkers.filter(f => !!f.move);
        this.setFleetsInInterstellarMotion(moving); // fixme fleet group and collection are overlapping and ugly

        const fleetsInSameSystem = new Map<number, FleetMarker[]>();
        const immobile = fleetMarkers.filter(f => !f.move);
        immobile.forEach(fleetMarker => {
            const system = fleetMarker.orbit!.system;
            let markers = fleetsInSameSystem.get(system!.idStarSystem!);
            if (!markers) {
                markers = [];
            }
            markers.push(fleetMarker);
            fleetsInSameSystem.set(system!.idStarSystem!, markers);
        });

        for (let inSameSystem of fleetsInSameSystem.values()) {
            if (inSameSystem.length > 1) {
                this.createFleetCollection(inSameSystem);
            } else {
                const fleetMarker = inSameSystem[0];
                const system = fleetMarker.orbit?.system;
                const orbit = system!.orbit;
                this.createFleetGroup(fleetMarker, orbit.xCoordinate.coordinate, orbit.yCoordinate.coordinate, orbit);
            }
        }
    }

    drawOrbits(orbits: OrbitDefinition[]) {
        this.setOrbits(orbits);
        const homeDef = orbits.filter(od => od.isMain)[0];
        this.setViewBox(homeDef.orbit, 0.2);

        orbits.forEach(orbitDefinition => this.drawCelestial(orbitDefinition));
    }
}
