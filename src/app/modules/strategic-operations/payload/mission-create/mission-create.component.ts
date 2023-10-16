import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {EnumValueDto, Mission, Planet, TradeContract, WarShip} from "../../../../services/swagger";
import {MatSelectionListChange} from "@angular/material/list";
import {SubscriptionManager} from "../../../../subscription.manager";
import MissionTypeEnum = Mission.MissionTypeEnum;
import EMissionTypesEnum = EnumValueDto.EMissionTypesEnum;

@Component({
    selector: 'app-mission-create',
    templateUrl: './mission-create.component.html',
    styleUrls: ['./mission-create.component.scss']
})
export class MissionCreateComponent extends SubscriptionManager implements OnChanges {

    @Input()
    planets: Planet[] = [];

    @Input()
    pooledWarships: WarShip[] = [];

    filteredWarships: WarShip[] = [];

    selectedWarships?: WarShip[];

    availableMissionTypes: MissionTypeEnum[] = MissionCommunicationService.missionTypes;

    @Output()
    result: EventEmitter<Mission> = new EventEmitter<Mission>();

    constructor(protected missionCommService: MissionCommunicationService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges) {
        const isConvoyProtection = this.missionCommService.selectedType === EMissionTypesEnum.CONVOY_PROTECTION;
        this.filteredWarships = this.pooledWarships.filter(w => isConvoyProtection ? w.warshipHealthState.state.isFTLCapable : true);
    }

    isMissionCreateValid() {
        return !!this.missionCommService.selectedType
            && (!!this.missionCommService.selectedPlanet || !!this.missionCommService.selectedTrade)
            && !!this.selectedWarships && this.selectedWarships.length > 0;
    }

    setShips(event: MatSelectionListChange) {
        const selected = event.source.selectedOptions.selected.map(o => <WarShip>o.value);
        const isConvoyProtection = this.missionCommService.selectedType === EMissionTypesEnum.CONVOY_PROTECTION;
        this.selectedWarships = selected.filter(w => isConvoyProtection ? w.warshipHealthState.state.isFTLCapable : true);
    }

    submit() {
        if (this.isMissionCreateValid()) {
            const isConvoyProtection = this.missionCommService.selectedType === EMissionTypesEnum.CONVOY_PROTECTION;
            const warShipIDs = this.selectedWarships!
                .filter(w => isConvoyProtection ? w.warshipHealthState.state.isFTLCapable : true)
                .map(w => w.idWarship);
            let sub = this.missionCommService.createMission({
                venue: this.missionCommService.selectedPlanet,
                idTradedResource: this.missionCommService.selectedTrade?.idTradedResource,
                ships: [],
                started: {
                    tickStarts: new Date(),
                    tickEnds: new Date(),
                    tickNo: 0,
                },
                warShipIDs: warShipIDs,
                missionType: this.missionCommService.selectedType!
            }).subscribe(resp => {
                this.missionCommService.activeMissions.push(resp);
                this.selectedWarships = undefined;
                this.filteredWarships = this.filteredWarships.filter(s => !warShipIDs.includes(s.idWarship));
                this.result.emit(resp);
            });
            this.subscriptions.push(sub);
        }
    }

    setType(event: MatSelectionListChange) {
        this.missionCommService.selectedType = <MissionTypeEnum>event.source!._value![0];
        const isConvoyProtection = this.missionCommService.selectedType === EMissionTypesEnum.CONVOY_PROTECTION;
        this.filteredWarships = this.pooledWarships.filter(w => isConvoyProtection ? w.warshipHealthState.state.isFTLCapable : true);
        if (isConvoyProtection) {
            this.missionCommService.selectedPlanet = undefined;
        }
    }

    setVenue(event: MatSelectionListChange) {
        this.missionCommService.selectedPlanet = <Planet><unknown>event.source!._value![0];
        this.missionCommService.selectedTrade = undefined;
        this.missionCommService.fetchPooledShips();
    }

    setTrade(event: MatSelectionListChange) {
        this.missionCommService.selectedTrade = <TradeContract><unknown>event.source!._value![0];
    }
}
