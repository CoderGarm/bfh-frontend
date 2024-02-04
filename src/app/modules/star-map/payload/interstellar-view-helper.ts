import {Distance, FleetMarker} from "../../../services/swagger";
import {OrbitDefinition} from "./orbit-definition";
import {BasicViewHelper} from "../../../services/svg-view-helper/basic-view-helper";
import {BasicViewHelperData} from "../../../services/svg-view-helper/basic-view-helper-data";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class InterstellarViewHelper extends BasicViewHelper {

    public static readonly STANDARD_METRIC = DistanceMetricEnum.LY;

    constructor() {
        super(InterstellarViewHelper.STANDARD_METRIC, 1);
    }

    setFleets(fleetMarkers: FleetMarker[]) {
        this.drawFleets(fleetMarkers);
    }

    drawOrbits(orbits: OrbitDefinition[]) {
        this.setOrbits(orbits);
        const homeDef = orbits.filter(od => od.isMain)[0];
        this.setViewBox(homeDef.orbit, 0.2);

        orbits.forEach(orbitDefinition => this.drawCelestial(orbitDefinition));
    }

    drawJunctions() {
        let sub = this.assetsService.getAllWormholeJunctions().subscribe(junctions => {
            const subLayerGroup = this.getOrCreateMainSubLayerGroup();
            junctions.forEach(junction => {
                junction.termini.forEach(terminus => {
                    let nexus = this.getBySystemName(junction.nexus.name);
                    let terminal = this.getBySystemName(terminus.name);
                    if (!!nexus && !!terminal) {
                        subLayerGroup
                            .line(nexus.x, nexus.y, terminal.x, terminal.y)
                            .id(this.getIdForWormhole(junction, terminus))
                            .addClass(BasicViewHelperData.RESIZE_ON_ZOOM_MARKER)
                            .addClass(BasicViewHelperData.WORMHOLE_MARKER)
                            .stroke({width: 2, color: 'irrelevant'});
                    }
                });
            });
        });
        this.subscriptions.push(sub);
    }
}
