import {AfterViewInit, Component} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";

@Component({
    selector: 'app-strat-ops-tab-view',
    templateUrl: './strat-ops-tab-view.component.html',
    styleUrls: ['./strat-ops-tab-view.component.scss']
})
export class StratOpsTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'stratOps';

    constructor(private missionCommService: MissionCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {
        this.missionCommService.fetchMissions();
    }
}
