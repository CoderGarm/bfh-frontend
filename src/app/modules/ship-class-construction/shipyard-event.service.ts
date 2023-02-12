import {EventEmitter, Injectable} from "@angular/core";
import {ShipClass} from "../../services/swagger";
import {ReplaySubject} from "rxjs";

@Injectable()
export class ShipyardEventService {

    /**
     * communicates a clicked ship class in the shipyard section of the sidenav
     */
    private selectedShipClassEmitter: ReplaySubject<ShipClass> = new ReplaySubject<ShipClass>();

    getSelectedShipClassEmitter() {
        return this.selectedShipClassEmitter;
    }

    selectShipClass(shipClass?: ShipClass) {
        this.selectedShipClassEmitter.next(shipClass);
    }

    /**
     * communicates the successful modification of a ship class
     */
    private modifiedShipClassEmitter: EventEmitter<ShipClass> = new EventEmitter<ShipClass>();

    getModifiedShipClassEmitter() {
        return this.modifiedShipClassEmitter;
    }

    modifyShipClass(shipClass: ShipClass) {
        this.modifiedShipClassEmitter.emit(shipClass);
    }
}