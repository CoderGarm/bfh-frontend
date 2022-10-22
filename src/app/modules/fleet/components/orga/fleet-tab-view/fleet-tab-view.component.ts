import {Component, Input, OnInit} from '@angular/core';
import {EModuleType, Fleet, ShipyardApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {SpacecraftCapabilitiesDisplayComponent} from "../../../../display-elements/spacecraft-capabilities-display/spacecraft-capabilities-display.component";

@Component({
    selector: 'app-fleet-tab-view',
    templateUrl: './fleet-tab-view.component.html',
    styleUrls: ['./fleet-tab-view.component.scss']
})
export class FleetTabViewComponent extends SubscriptionManager implements OnInit {

    /**
     * the user selected fleet
     */
    @Input()
    fleet?: Fleet;

    private moduleTypes: EModuleType[] = [];

    constructor(private shipyardApi: ShipyardApiService) {
        super();

        const sub = shipyardApi.getEModuleTypes().subscribe(resp => this.moduleTypes = resp);
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    getCurrentCaps(fleet?: Fleet) {
        return SpacecraftCapabilitiesDisplayComponent.getCurrentCaps(this.moduleTypes, fleet);
    }
}
