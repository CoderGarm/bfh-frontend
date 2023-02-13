import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {Fleet} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";

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

    constructor(@Optional() @Inject('fleets') fleets: Fleet[] | undefined) {
        super();
        if (!!fleets) {
            this.fleets = fleets;
        } else {
            this.fleets = [];
        }
    }

    ngOnInit(): void {
    }
}
