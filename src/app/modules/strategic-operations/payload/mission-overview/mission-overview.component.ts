import {AfterViewInit, Component} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {Mission} from "../../../../services/swagger";

@Component({
    selector: 'app-mission-overview',
    templateUrl: './mission-overview.component.html',
    styleUrls: ['./mission-overview.component.scss']
})
export class MissionOverviewComponent extends SubscriptionManager implements AfterViewInit {

    constructor(protected missionCommService: MissionCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {

    }

    getMissions(): Mission[] {
        if (!!this.missionCommService.selectedPlanet) {
            return this.missionCommService.activeMissions.filter(m => m.venue.idPlanet === this.missionCommService.selectedPlanet!.idPlanet);
        }
        return this.missionCommService.activeMissions;
    }
}
