import {EventEmitter, Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs";
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
    private selectedFleetEmitter: ReplaySubject<AbstractId> = new ReplaySubject<AbstractId>();

    getSelectedFleetEmitter() {
        return this.selectedFleetEmitter;
    }

    selectFleet(fleet?: AbstractId) {
        this.selectedFleetEmitter.next(fleet);
    }

    /**
     * communicates a retired fleet in the sidenav
     */
    private retireFleetEmitter: ReplaySubject<AbstractId> = new ReplaySubject<AbstractId>();

    retireFleet(fleet: AbstractId) {
        this.retireFleetEmitter.next(fleet);
        this.selectFleet(undefined);
    }

    getRetireFleetEmitter(): ReplaySubject<AbstractId> {
        return this.retireFleetEmitter;
    }
}
