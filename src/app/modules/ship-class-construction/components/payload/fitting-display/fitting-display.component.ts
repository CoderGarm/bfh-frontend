import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ResourceDeposit, ResourcesApiService, ShipClass} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {ShipClassComparator} from "../ShipClassComparator";

@Component({
    selector: 'app-fitting-display',
    templateUrl: './fitting-display.component.html',
    styleUrls: ['./fitting-display.component.scss']
})
export class FittingDisplayComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * The user selected ShipClass.
     */
    @Input()
    selectedShipClassInput?: ShipClass;
    selectedShipClassInputDefinition: string = "selectedShipClassInput";

    /**
     * listens to the parents event which tab is selected
     */
    @Input()
    selectedIndexInput?: EventEmitter<number>;
    selectedIndexInputDefinition: string = "selectedIndexInput";

    /**
     * emits an event if this component was selected in the parent's tab group and was rendered
     */
    @Output()
    isSelectedOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * the css selector which should be used to create the svg div in the svg component
     */
    svgSelector: string = "ship-class-fitting-display";

    /**
     * the displayed ship class name
     */
    shipClassName: string = "";

    resourceDeposit?: ResourceDeposit;

    compareClass?: ShipClass;

    constructor(private resourceApi: ResourcesApiService,
                private tokenStorage: TokenStorage) {
        super();
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedIndexInputDefinition]) {
            if (!!this.selectedIndexInput) {
                let sub = this.selectedIndexInput.subscribe(event => {
                    if (event == 0) {
                        this.isSelectedOutput.emit(true);
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        if (changes[this.selectedShipClassInputDefinition]) {
            if (!!this.selectedShipClassInput) {
                this.shipClassName = this.selectedShipClassInput.name;
            } else {
                this.shipClassName = "";
            }
        }
        this.getCosts();
    }

    /**
     * fetches the costs for the current selected ship class
     * @private
     */
    private getCosts() {
        let userID = this.tokenStorage.getUserID();
        if (!!this.selectedShipClassInput && !!userID && this.idChangePending()) {
            let sub = this.resourceApi.getShipClassCosts(userID, this.selectedShipClassInput)
                .subscribe(resp => this.resourceDeposit = resp);
            this.subscriptions.push(sub);
        } else if (!this.selectedShipClassInput) {
            this.resourceDeposit = undefined;
            this.compareClass = undefined;
        }
    }

    /**
     * detects if there is a change from the last to the current version
     * @private
     */
    private idChangePending() {
        let result: boolean = false;
        if (!!this.compareClass && !!this.selectedShipClassInput) {
            result = !ShipClassComparator.equals(this.compareClass, this.selectedShipClassInput);
        } else if (!this.compareClass && !!this.selectedShipClassInput) {
            result = true;
        }
        this.compareClass = this.selectedShipClassInput;
        return result;
    }
}
