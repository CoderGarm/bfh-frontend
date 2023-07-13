import {MapDataProvider} from "./map-data-provider.component";
import {LocalMapOrbitDefinition} from "./local-map-orbit-definition";

export class MapElementDrawer extends MapDataProvider {

    constructor() {
        super();
    }

    drawOrbits(orbits: LocalMapOrbitDefinition[]) {
        this.setOrbits(orbits);
        const homeDef = orbits.filter(od => od.isMain)[0];
        this.setViewBox(homeDef.celestial, 0.2);

        orbits.forEach(orbitDefinition => this.drawCelestial(orbitDefinition));
    }
}
