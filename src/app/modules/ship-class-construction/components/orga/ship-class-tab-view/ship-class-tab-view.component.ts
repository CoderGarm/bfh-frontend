import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ResourceDeposit, ResourcesApiService, ShipClass} from "../../../../../services/swagger";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {ResourceEmitterService} from "../../../../../services/resource-emitter.service";

@Component({
    selector: 'app-ship-class-tab-view',
    templateUrl: './ship-class-tab-view.component.html',
    styleUrls: ['./ship-class-tab-view.component.scss']
})
export class ShipClassTabViewComponent extends SubscriptionManager implements OnInit {

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

    resourceDeposit?: ResourceDeposit;

    constructor(private resourceApi: ResourcesApiService,
                private resourceEmitter: ResourceEmitterService) {
        super();
    }

    ngOnInit() {
        const sub = this.resourceApi.getResourceDepositForUser().subscribe(resp => this.resourceDeposit = resp);
        this.subscriptions.push(sub);
    }

    emitTabSelectedIndex($event: MatTabChangeEvent) {
        this.selectionEmitter.emit($event.index);
    }

    passOutput(event: ShipClass) {
        this.modifiedShipClassOutput.emit(event);
    }

    indexChanged(event: number) {
        this.resourceEmitter.clear();
    }
}
