import {Distance, EnumValueDto, FleetMarker} from "../../../services/swagger";
import {OrbitDefinition} from "./orbit-definition";
import {BasicViewHelper} from "../../../services/svg-view-helper/basic-view-helper";
import {RadialGroup} from "../external-map-manager/external-map-manager.component";
import {ExternalMapComponent} from "../external-map/external-map.component";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import EDistanceMetricsEnum = EnumValueDto.EDistanceMetricsEnum;

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

    drawRadialGroups(radialGroups: RadialGroup[]) {
        if (radialGroups.length == 0) {
            return;
        }

        let mainGroup = this.getOrCreateMainCelestialGroup();
        radialGroups.forEach(rg => {
            const coord = rg.coord;
            const id = ExternalMapComponent.getStarSystemCircleID(coord);
            const x = this.convertToStandardMetric({coordinate: coord.x, distanceMetric: EDistanceMetricsEnum.LY});
            const y = this.convertToStandardMetric({coordinate: coord.y, distanceMetric: EDistanceMetricsEnum.LY});
            const radius = this.convertToStandardMetric({coordinate: rg.radius, distanceMetric: EDistanceMetricsEnum.LY});
            const circle = mainGroup.circle()
                .x(x)
                .y(y)
                .id("radius-" + id)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .addClass(BasicViewHelper.HYPER_LIMIT_MARKER)
                .radius(radius);
        });
    }
}
