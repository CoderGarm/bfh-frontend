import {EventEmitter, Injectable} from "@angular/core";
import {FleetName} from "../../modules/display-elements/fleet-display/fleet-display.component";
import {ReplaySubject} from "rxjs";
import {AbstractId} from "../swagger";

@Injectable()
export class FleetEventService {

    /**
     * communicates the change of the fleets name
     */
    nameChange: EventEmitter<FleetName> = new EventEmitter<FleetName>();

    /**
     * communicates a clicked fleet in the sidenav
     */
    private selectedFleetEmitter: ReplaySubject<AbstractId> = new ReplaySubject<AbstractId>();

    getSelectedFleetEmitter() {
        return this.selectedFleetEmitter;
    }

    selectFleet(fleet?: AbstractId) {
        this.selectedFleetEmitter.next(fleet);
    }
}
