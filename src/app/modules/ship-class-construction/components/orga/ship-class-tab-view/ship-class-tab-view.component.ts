import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShipClass} from "../../../../../services/swagger";
import {MatTabChangeEvent} from "@angular/material/tabs";

@Component({
    selector: 'app-ship-class-tab-view',
    templateUrl: './ship-class-tab-view.component.html',
    styleUrls: ['./ship-class-tab-view.component.scss']
})
export class ShipClassTabViewComponent implements OnInit {

    actionTabTitles: string[] = ['View fitting', 'Modify fitting'];

    /**
     * The user selected ShipClass.
     */
    @Input()
    selectedShipClassInput?: ShipClass;

    /**
     * emits the index of the selected tab
     */
    @Output()
    selectionEmitter: EventEmitter<number> = new EventEmitter<number>();

    /**
     * the event emitter that communicates the successful modification of a ship class
     */
    @Output()
    modifiedShipClassOutput: EventEmitter<ShipClass> = new EventEmitter<ShipClass>();

    constructor() {
    }

    ngOnInit() {
    }

    emitTabSelectedIndex($event: MatTabChangeEvent) {
        this.selectionEmitter.emit($event.index);
    }

    passOutput(event: ShipClass) {
        this.modifiedShipClassOutput.emit(event);
    }
}
