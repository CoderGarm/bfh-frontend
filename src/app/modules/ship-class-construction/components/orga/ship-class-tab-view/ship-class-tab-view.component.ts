import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {SubscriptionManager} from "../../../../../subscription.manager";

@Component({
    selector: 'app-ship-class-tab-view',
    templateUrl: './ship-class-tab-view.component.html',
    styleUrls: ['./ship-class-tab-view.component.scss']
})
export class ShipClassTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'ship-classes';

    /** todo pretty stupid solution -> fix it up
     * emits the index of the selected tab
     */
    @Output()
    selectionEmitter: EventEmitter<number> = new EventEmitter<number>();

    resourceDeposit?: ResourceDeposit;

    constructor(private resourceService: ResourcesApiService) {
        super();
    }

    ngAfterViewInit() {
        let sub = this.resourceService.getResourceDepositForUser().subscribe(resp => this.resourceDeposit = resp);
        this.subscriptions.push(sub);
    }

    emitTabSelectedIndex($event: MatTabChangeEvent) {
        this.selectionEmitter.emit($event.index);
    }
}
