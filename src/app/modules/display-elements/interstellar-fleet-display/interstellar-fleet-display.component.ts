import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {EModuleType, Fleet, ShipyardApiService} from "../../../services/swagger";
import {SpacecraftCapabilitiesDisplayComponent} from "../spacecraft-capabilities-display/spacecraft-capabilities-display.component";
import {SubscriptionManager} from "../../../SubscriptionManager";

@Component({
    selector: 'app-interstellar-fleet-display',
    templateUrl: './interstellar-fleet-display.component.html',
    styleUrls: ['./interstellar-fleet-display.component.scss']
})
export class InterstellarFleetDisplayComponent extends SubscriptionManager implements OnInit {

    /**
     * the fleets to display
     */
    @Input()
    fleets: Fleet[] = [];

    private moduleTypes: EModuleType[] = [];

    constructor(@Optional() @Inject('fleets') fleets: Fleet[] | undefined,
                private shipyardApi: ShipyardApiService) {
        super();
        if (!!fleets) {
            this.fleets = fleets;
        } else {
            this.fleets = [];
        }

        const sub = shipyardApi.getEModuleTypes().subscribe(resp => this.moduleTypes = resp);
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    getCurrentCaps(fleet?: Fleet) {
        return SpacecraftCapabilitiesDisplayComponent.getCurrentCaps(this.moduleTypes, fleet);
    }
}
