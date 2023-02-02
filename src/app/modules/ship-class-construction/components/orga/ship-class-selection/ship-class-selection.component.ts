import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ShipClass, ShipyardApiService} from "../../../../../services/swagger";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-ship-class-selection',
    templateUrl: './ship-class-selection.component.html',
    styleUrls: ['./ship-class-selection.component.scss']
})
export class ShipClassSelectionComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    shipClasses: ShipClass[] = [];

    /**
     * The user selected ShipClass.
     */
    @Output()
    selectedShipClassOutput: EventEmitter<ShipClass> = new EventEmitter<ShipClass>();

    /**
     * detects the successful modification of a ship class
     */
    @Input()
    modifiedShipClassInput?: ShipClass;
    modifiedShipClassOutputDefinition: string = "modifiedShipClassInput";

    constructor(private tokenService: TokenStorage,
                private shipyardApi: ShipyardApiService) {
        super();
    }

    ngAfterViewInit(): void {
        this.fetchShipClasses();
    }

    /**
     * fetches all ship classes for the given user
     * @private
     */
    private fetchShipClasses() {
        let sub = this.shipyardApi.getShipClassesByUser().subscribe(resp => this.shipClasses = resp);
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.modifiedShipClassOutputDefinition]) {
            this.fetchShipClasses();
            setTimeout(() => {
                this.selectClass(this.modifiedShipClassInput);
            }, 200);
        }
    }

    selectClass(shipClass?: ShipClass) {
        this.selectedShipClassOutput.emit(shipClass);
    }
}
