import {SubscriptionManager} from "./SubscriptionManager";
import {EventEmitter, Injectable} from "@angular/core";
import {StarSystem} from "./services/swagger";

@Injectable()
export class StarMapCommunicationService extends SubscriptionManager {

    starSystemSelectionOutput: EventEmitter<StarSystem> = new EventEmitter<StarSystem>();

    constructor() {
        super();
    }
}