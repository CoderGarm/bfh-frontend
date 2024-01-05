import {EnumValueDto} from "../../../../services/swagger";
import {Coords} from "../mission-administration/mission-administration.component";
import EMissionTypesEnum = EnumValueDto.EMissionTypesEnum;

/**
 * just a container to hold the orbit information and if the specified orbit is colonized by someone
 */
export class LocalMapOrbitDefinition {

    readonly celestial: Coords;
    readonly isMain: boolean;
    readonly isColonized: boolean;
    readonly isColonizedByOther: boolean;
    readonly isNpc: boolean;
    readonly isKersey: boolean;
    readonly missionTypes: EMissionTypesEnum[];

    constructor(celestial: Coords,
                isMain: boolean,
                isColonized: boolean,
                isColonizedByOther: boolean,
                isNpc: boolean,
                isKersey: boolean,
                missionTypes: EMissionTypesEnum[]) {
        this.celestial = celestial;
        this.isMain = isMain;
        this.isColonized = isColonized;
        this.isColonizedByOther = isColonizedByOther;
        this.isNpc = isNpc;
        this.isKersey = isKersey;
        this.missionTypes = missionTypes;
    }
}
