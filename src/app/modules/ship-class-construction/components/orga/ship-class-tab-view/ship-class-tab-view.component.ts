import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {ResourceDeposit, ResourcesApiService, ShipClass} from "../../../../../services/swagger";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {ResourceEmitterService} from "../../../../../services/resource-emitter.service";
import {ShipyardEventService} from "../../../shipyard-event.service";

@Component({
    selector: 'app-ship-class-tab-view',
    templateUrl: './ship-class-tab-view.component.html',
    styleUrls: ['./ship-class-tab-view.component.scss']
})
export class ShipClassTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'ship-classes';

    selectedShipClass?: ShipClass;

    /**
     * emits the index of the selected tab
     */
    @Output()
    selectionEmitter: EventEmitter<number> = new EventEmitter<number>();

    resourceDeposit?: ResourceDeposit;

    constructor(private resourceApi: ResourcesApiService,
                private shipyardService: ShipyardEventService,
                private resourceEmitter: ResourceEmitterService) {
        super();

    }

    ngAfterViewInit() {
        let sub = this.shipyardService.getSelectedShipClassEmitter().subscribe(shipClass => this.selectedShipClass = shipClass);
        this.subscriptions.push(sub);

        sub = this.resourceApi.getResourceDepositForUser().subscribe(resp => this.resourceDeposit = resp);
        this.subscriptions.push(sub);
    }

    emitTabSelectedIndex($event: MatTabChangeEvent) {
        this.selectionEmitter.emit($event.index);
    }

    passOutput(event: ShipClass) {
        this.shipyardService.modifyShipClass(event);
    }

    indexChanged(event: number) {
        this.resourceEmitter.clear();
    }
}
