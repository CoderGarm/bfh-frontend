import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {EModuleType, Fleet} from "../../../services/swagger";
import {SpacecraftCapabilitiesDisplayComponent} from "../spacecraft-capabilities-display/spacecraft-capabilities-display.component";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {TypeService} from "../../../services/type.service";

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

    private readonly moduleTypes: EModuleType[] = [];

    constructor(@Optional() @Inject('fleets') fleets: Fleet[] | undefined,
                private typeService: TypeService) {
        super();
        if (!!fleets) {
            this.fleets = fleets;
        } else {
            this.fleets = [];
        }

        this.moduleTypes = typeService.eModuleTypes;
    }

    ngOnInit(): void {
    }

    getCurrentCaps(fleet?: Fleet) {
        return SpacecraftCapabilitiesDisplayComponent.getCurrentCaps(this.moduleTypes, fleet);
    }
}
