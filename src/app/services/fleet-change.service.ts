import {EventEmitter, Injectable} from "@angular/core";
import {SubscriptionManager} from "../SubscriptionManager";
import {FleetName} from "../modules/display-elements/fleet-display/fleet-display.component";

@Injectable()
export class FleetChangeService extends SubscriptionManager {

    nameChange: EventEmitter<FleetName> = new EventEmitter<FleetName>();

    constructor() {
        super();
    }
}