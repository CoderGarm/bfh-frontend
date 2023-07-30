import {Component} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";

@Component({
    selector: 'app-mission-overview',
    templateUrl: './mission-overview.component.html',
    styleUrls: ['./mission-overview.component.scss']
})
export class MissionOverviewComponent extends SubscriptionManager {

    constructor(protected missionCommService: MissionCommunicationService) {
        super();
    }

    toggle() {
        throw new Error("please implement me") /* fixme hier weiter */
    }
}
