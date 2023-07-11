import {Component} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";

@Component({
    selector: 'app-mission-administration',
    templateUrl: './mission-administration.component.html',
    styleUrls: ['./mission-administration.component.scss']
})
export class MissionAdministrationComponent extends SubscriptionManager {

    constructor(private missionCommService: MissionCommunicationService) {
        super();
    }

}
