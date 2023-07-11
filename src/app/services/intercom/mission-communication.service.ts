import {Injectable} from "@angular/core";
import {FleetApiService, Mission, MissionApiService} from "../swagger";
import {SubscriptionManager} from "../../subscription.manager";

@Injectable()
export class MissionCommunicationService extends SubscriptionManager {

    activeMissions: Mission[] = [];

    constructor(private missionService: MissionApiService,
                private fleetService: FleetApiService) {
        super();
    }

    fetchMissions() {
        let sub = this.missionService.getMissions().subscribe(resp => this.activeMissions = resp);
        this.subscriptions.push(sub);
    }
}
