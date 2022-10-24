import {Component, Input, OnInit} from '@angular/core';
import {EModuleType, Fleet} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {SpacecraftCapabilitiesDisplayComponent} from "../../../../display-elements/spacecraft-capabilities-display/spacecraft-capabilities-display.component";
import {TypeService} from "../../../../../services/type.service";

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

    private readonly moduleTypes: EModuleType[] = [];

    constructor(private typeService: TypeService) {
        super();

        this.moduleTypes = typeService.eModuleTypes;
    }

    ngOnInit(): void {
    }

    getCurrentCaps(fleet?: Fleet) {
        return SpacecraftCapabilitiesDisplayComponent.getCurrentCaps(this.moduleTypes, fleet);
    }
}
