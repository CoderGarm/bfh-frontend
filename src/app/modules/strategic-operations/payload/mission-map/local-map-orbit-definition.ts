import {MissionMapComponent} from "./mission-map.component";
import {Coords} from "../../../../services/assets/assets.service";

/**
 * just a container to hold the orbit information and if the specified orbit is colonized by someone
 */
export class LocalMapOrbitDefinition {

    readonly celestial: Coords;

    color: string;

    readonly isMain: boolean;

    constructor(celestial: Coords,
                isMain: boolean,
                color: string) {
        this.celestial = celestial;
        this.color = color;
        this.isMain = isMain;
    }

    public static getOrbitDefinitionsForExternalStarMap(center: Coords, systems: Coords[], colors: Map<string, string>): LocalMapOrbitDefinition[] {
        const od: LocalMapOrbitDefinition[] = [];
        systems.forEach(system => {
            let id = MissionMapComponent.getStarSystemCircleID(system);
            let isMain: boolean = system.name === center.name;
            od.push(new LocalMapOrbitDefinition(system, isMain, colors.get(id)!));
        });
        return od;
    }
}
