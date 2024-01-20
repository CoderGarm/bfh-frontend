import {Fleet} from "../../services/swagger";

export class CombatStatistics {
    constructor(fleet: Fleet, isLoggedInUser: boolean) {
        this.isLoggedInUser = isLoggedInUser;
        this.fleetName = fleet.name;
    }

    isLoggedInUser: boolean;
    fleetName: string;
    losses: Set<number> = new Set<number>();
    kills: Set<number> = new Set<number>();
    releasedMissiles: number = 0;
    releasedBeams: number = 0;
}
