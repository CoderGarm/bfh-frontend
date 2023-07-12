import {Injectable} from "@angular/core";
import {FleetApiService, Mission, MissionApiService, WarShip} from "../swagger";
import {SubscriptionManager} from "../../subscription.manager";
import MissionTypeEnum = Mission.MissionTypeEnum;

@Injectable()
export class MissionCommunicationService extends SubscriptionManager {

    activeMissions: Mission[] = [];

    pooledShips: WarShip[] = [];

    playerMissions: MissionTypeEnum[] = [MissionTypeEnum.PIRATE_HUNT, MissionTypeEnum.CONVOY_PROTECTION];

    constructor(private missionService: MissionApiService,
                private fleetService: FleetApiService) {
        super();
    }

    fetchMissions() {
        let sub = this.missionService.getMissions().subscribe(resp => this.activeMissions = resp);
        this.subscriptions.push(sub);
    }

    fetchPooledShips() {
        let sub = this.fleetService.getPooledWarships().subscribe(resp =>
            this.pooledShips = resp
        );
        this.subscriptions.push(sub);
    }
}
