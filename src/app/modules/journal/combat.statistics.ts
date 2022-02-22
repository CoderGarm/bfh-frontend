import {Fleet} from "../../services/swagger";

export class CombatStatistics {
    constructor(fleet: Fleet, isLoggedInUser: boolean) {
        this.isLoggedInUser = isLoggedInUser;
        this.fleetName = fleet.name;
    }

    isLoggedInUser: boolean;
    fleetName: string;
    losses: number = 0;
    kills: number = 0;
    releasedMissiles: number = 0;
    releasedBeams: number = 0;
}
