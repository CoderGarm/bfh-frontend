import {Component, Input, OnInit} from '@angular/core';
import {Fleet} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

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

    constructor() {
        super();
    }

    ngOnInit(): void {
    }
}
