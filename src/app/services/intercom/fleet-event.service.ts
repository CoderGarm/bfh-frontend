import {EventEmitter, Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {AbstractId} from "../swagger";

@Injectable()
export class FleetEventService {

    /**
     * communicates the change of the fleets name
     */
    private nameChange: EventEmitter<AbstractId> = new EventEmitter<AbstractId>();


    getNameChangeEmitter() {
        return this.nameChange;
    }

    changeName(name: AbstractId) {
        this.nameChange.emit(name);
    }

    /**
     * communicates a clicked fleet in the sidenav
     */
    private selectedFleetEmitter: BehaviorSubject<AbstractId | undefined> = new BehaviorSubject<AbstractId | undefined>(undefined);

    getSelectedFleetEmitter() {
        return this.selectedFleetEmitter;
    }

    selectFleet(fleet?: AbstractId) {
        this.selectedFleetEmitter.next(fleet);
    }

    /**
     * communicates a retired fleet in the sidenav
     */
    private retireFleetEmitter: BehaviorSubject<AbstractId | undefined> = new BehaviorSubject<AbstractId | undefined>(undefined);

    retireFleet(fleet: AbstractId) {
        this.retireFleetEmitter.next(fleet);
        this.selectFleet(undefined);
    }

    getRetireFleetEmitter() {
        return this.retireFleetEmitter;
    }
}
