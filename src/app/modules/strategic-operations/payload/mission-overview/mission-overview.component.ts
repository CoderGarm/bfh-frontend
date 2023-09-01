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
        let result: Mission[] = this.missionCommService.activeMissions;
        if (!!this.missionCommService.selectedPlanet) {
            result = result.filter(m => m.venue?.idPlanet === this.missionCommService.selectedPlanet!.idPlanet);
        }
        if (!!this.missionCommService.selectedType) {
            result = result.filter(m => m.missionType === this.missionCommService.selectedType);
        }
        return result;
    }
}
