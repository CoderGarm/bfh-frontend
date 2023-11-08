import {Component, Input} from '@angular/core';
import {Fleet} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";

@Component({
    selector: 'app-fleet-movement-list',
    templateUrl: './fleet-movement-list.component.html',
    styleUrls: ['./fleet-movement-list.component.scss']
})
export class FleetMovementListComponent extends SubscriptionManager {

    @Input()
    movingFleets: Fleet[] = [];

}
