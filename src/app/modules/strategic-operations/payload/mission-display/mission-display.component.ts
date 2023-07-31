import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Mission} from "../../../../services/swagger";
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";

@Component({
    selector: 'app-mission-display',
    templateUrl: './mission-display.component.html',
    styleUrls: ['./mission-display.component.scss']
})
export class MissionDisplayComponent extends SubscriptionManager {

    @Input()
    mission?: Mission;

    @Output()
    result: EventEmitter<Mission> = new EventEmitter<Mission>();

    constructor(private missionCommService: MissionCommunicationService) {
        super();
    }

    submit() {
        if (!!this.mission && !!this.mission.idMission) {
            const idMission = this.mission.idMission;
            let sub = this.missionCommService.stopMission(idMission).subscribe(resp => {
                this.missionCommService.dropMission(idMission);
                this.result.emit(this.mission);
                this.mission = undefined;
            });
            this.subscriptions.push(sub);
        }
    }
}
