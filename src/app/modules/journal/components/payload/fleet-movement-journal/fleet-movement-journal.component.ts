import {Component, OnInit} from '@angular/core';
import {EModuleType, Fleet, FleetApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {SpacecraftCapabilitiesDisplayComponent} from "../../../../display-elements/spacecraft-capabilities-display/spacecraft-capabilities-display.component";
import {TypeService} from "../../../../../services/type.service";

@Component({
    selector: 'app-fleet-movement-journal',
    templateUrl: './fleet-movement-journal.component.html',
    styleUrls: ['./fleet-movement-journal.component.scss']
})
export class FleetMovementJournalComponent extends SubscriptionManager implements OnInit {

    movingFleets: Fleet[] = [];

    private readonly moduleTypes: EModuleType[] = [];

    constructor(private fleetService: FleetApiService,
                private typeService: TypeService) {
        super();

        this.moduleTypes = typeService.eModuleTypes;
    }

    ngOnInit(): void {
        this.loadData();
    }

    private loadData() {
        let sub = this.fleetService.getMovingFleetsForUser().subscribe(resp => this.movingFleets = resp);
        this.subscriptions.push(sub);
    }

    getCurrentCaps(fleet?: Fleet) {
        return SpacecraftCapabilitiesDisplayComponent.getCurrentCaps(this.moduleTypes, fleet);
    }
}
