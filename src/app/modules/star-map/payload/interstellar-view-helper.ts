import {Distance, FleetMarker} from "../../../services/swagger";
import {OrbitDefinition} from "./orbit-definition";
import {BasicViewHelper} from "../../../services/svg-view-helper/basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class InterstellarViewHelper extends BasicViewHelper {

    public static readonly STANDARD_METRIC = DistanceMetricEnum.LY;

    constructor() {
        super(InterstellarViewHelper.STANDARD_METRIC);
    }

    enrichFleetsInInterstellarMotion(fleetsInMotion: FleetMarker[]) {

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
        });
    }

    setFleets(fleetMarkers: FleetMarker[]) {

        const moving = fleetMarkers.filter(f => !!f.move);
        this.enrichFleetsInInterstellarMotion(moving);

        this.drawFleets(fleetMarkers);
    }

    drawOrbits(orbits: OrbitDefinition[]) {
        this.setOrbits(orbits);
        const homeDef = orbits.filter(od => od.isMain)[0];
        this.setViewBox(homeDef.orbit, 0.2);

        orbits.forEach(orbitDefinition => this.drawCelestial(orbitDefinition));
    }
}
