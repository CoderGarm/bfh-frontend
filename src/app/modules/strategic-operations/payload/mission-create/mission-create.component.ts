import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {Mission, Planet, WarShip} from "../../../../services/swagger";
import {MatSelectionListChange} from "@angular/material/list";
import {SubscriptionManager} from "../../../../subscription.manager";
import MissionTypeEnum = Mission.MissionTypeEnum;

@Component({
    selector: 'app-mission-create',
    templateUrl: './mission-create.component.html',
    styleUrls: ['./mission-create.component.scss']
})
export class MissionCreateComponent extends SubscriptionManager {

    @Input()
    planets: Planet[] = [];

    @Input()
    pooledWarships: WarShip[] = [];

    selectedType?: MissionTypeEnum;
    selectedWarships?: WarShip[];

    availableMissionTypes: MissionTypeEnum[] = MissionCommunicationService.missionTypes;

    @Output()
    result: EventEmitter<Mission> = new EventEmitter<Mission>();

    constructor(protected missionCommService: MissionCommunicationService) {
        super();
    }

    isMissionCreateValid() {
        return !!this.selectedType && !!this.missionCommService.selectedPlanet && !!this.selectedWarships && this.selectedWarships.length > 0;
    }

    setShips(event: MatSelectionListChange) {
        this.selectedWarships = event.options.filter(o => o.selected).map(o => o.value);
    }

    submit() {
        if (this.isMissionCreateValid()) {
            const warShipIDs = this.selectedWarships!.map(w => w.idWarship);
            let sub = this.missionCommService.createMission({
                venue: this.missionCommService.selectedPlanet!,
                ships: [],
                warShipIDs: warShipIDs,
                missionType: this.selectedType!
            }).subscribe(resp => {
                this.missionCommService.activeMissions.push(resp);
                this.missionCommService.selectedPlanet = undefined;
                this.selectedType = undefined;
                this.selectedWarships = undefined;
                this.pooledWarships = this.pooledWarships.filter(s => !warShipIDs.includes(s.idWarship));
                this.result.emit(resp);
            });
            this.subscriptions.push(sub);
        }
    }
}
