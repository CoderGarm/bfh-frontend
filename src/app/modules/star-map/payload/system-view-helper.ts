import {Distance, FleetMarker, StarSystem} from "../../../services/swagger";
import {OrbitDefinition} from "./orbit-definition";
import {BasicViewHelper} from "../../../services/svg-view-helper/basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class SystemViewHelper extends BasicViewHelper {

    static readonly STANDARD_METRIC = DistanceMetricEnum.LS;

    constructor() {
        super(SystemViewHelper.STANDARD_METRIC);
    }

    setFleets(fleetMarkers: FleetMarker[]) {
        this.drawFleets(fleetMarkers);
    }

    drawOrbits(system: StarSystem) {
        let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForPlanet(this.tokenStorage.getUserID(), system.planets);

        this.setOrbits(orbitDefinitions);
        this.setViewBox(undefined, 0.7);

        let mainGroup = this.getOrCreateMainCelestialGroup();

        this.hyperLimitRadius = this.calculateHyperLimit(system);
        mainGroup.circle()
            .x(0)
            .y(0)
            .id("hyper-limit-of-" + system.idStarSystem)
            .fill(BasicViewHelper.NONE_FILL_COLOR)
            .addClass(BasicViewHelper.HYPER_LIMIT_MARKER)
            .radius(this.hyperLimitRadius);

        mainGroup.circle()
            .x(0)
            .y(0)
            .id("star-of-" + system.idStarSystem)
            .addClass(BasicViewHelper.STAR_MARKER)
            .addClass(BasicViewHelper.STAR_COLOR_MARKER)
            .addClass(BasicViewHelper.STAR_IN_SYSTEM_MARKER)
            .addClass(BasicViewHelper.RESIZE_ON_ZOOM_MARKER)
            .radius(BasicViewHelper.STAR_RADIUS_IN_SYSTEM);

        orbitDefinitions.forEach(orbitDefinition => {
            const orbit = orbitDefinition.orbit;
            let orbitID = this.getOrbitID(orbit);
            let radius: number = BasicViewHelper.calculateDistance(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate));

            mainGroup.circle()
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
