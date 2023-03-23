import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {
    AlignedFitting,
    ResourceDeposit,
    ResourcesApiService,
    ShipClass,
    ShipyardApiService,
    SpacecraftCapabilities,
    SpacecraftCapacityAreas
} from "../../../../../services/swagger";
import {ShipClassComparator} from "../ship-class.comparator";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {ShipyardEventService} from "../../../shipyard-event.service";
import {ShipClassValidator} from "../ship-class.validator";

@Component({
    selector: 'app-fitting-modify',
    templateUrl: './fitting-modify.component.html',
    styleUrls: ['./fitting-modify.component.scss']
})
export class FittingModifyComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * The user selected ShipClass.
     */
    @Input()
    shipClass?: ShipClass;
    selectedShipClassInputDefinition: string = "shipClass";

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

    @Input()
    resourceDeposit?: ResourceDeposit;

    /**
     * the css selector which should be used to create the svg div in the svg component
     */
    svgSelector: string = "ship-class-fitting-selection";

    /**
     * forwards the weapon alignments by amount to the svg component
     */
    @Output()
    weaponsAmountByAlignmentEmitter: EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>> = new EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>>();

    /**
     * if the ship class which was created by the user is valid, it will appear here
     */
    @Output()
    designedShipClassEmitter: EventEmitter<ShipClass> = new EventEmitter<ShipClass>();

    designedShipClass?: ShipClass;

    /**
     * the state of the store-button
     */
    disabled: boolean = true;

    costs?: ResourceDeposit;

    compareClass?: ShipClass;
    capabilities?: SpacecraftCapabilities;
    capacities?: SpacecraftCapacityAreas;

    constructor(private shipYardApi: ShipyardApiService,
                private change: ChangeDetectorRef,
                private shipyardService: ShipyardEventService,
                private resourceApi: ResourcesApiService) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.designedShipClassEmitter.subscribe(event => {
            this.designedShipClass = event;
            this.setShipClass(this.designedShipClass);
            this.change.detectChanges();
        });
        this.subscriptions.push(sub!);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedIndexInputDefinition]) {
            if (!!this.selectedIndexInput) {
                let sub = this.selectedIndexInput.subscribe(event => {
                    if (event == 1) {
                        this.isSelectedOutput.emit(true);
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        if (changes[this.selectedShipClassInputDefinition]) {
            this.setShipClass(this.shipClass)
        }
    }

    /**
     * forwards the weapon alignments by amount to the svg component
     * @param event
     */
    setWeaponsAmountByAlignmentInput(event: Map<AlignedFitting.WeaponAlignmentEnum, number>) {
        this.weaponsAmountByAlignmentEmitter.emit(event);
    }

    /**
     * stores the designed class to the database
     */
    storeClass() {
        if (!!this.designedShipClass) {
            this.designedShipClass.idPredecessor = this.shipClass!.idShipClass;
            this.designedShipClass.idShipClass = undefined;
            let sub = this.shipYardApi.updateShipClass(this.designedShipClass)
                .subscribe(resp => this.shipyardService.modifyShipClass(resp));
            this.subscriptions.push(sub);
        }
    }

    /**
     * sets the ship class and defines the state of the store-button
     * @param shipClass
     */
    setShipClass(shipClass?: ShipClass) {
        this.designedShipClass = shipClass;
        if (this.disabled != !this.designedShipClass) {
            setTimeout(() => {
                this.disabled = !ShipClassValidator.isValid(this.designedShipClass);
            }, 100);
        }
        this.getCosts();
    }

    /**
     * deletes the stored ship class
     */
    deleteClass() {
        if (!!this.designedShipClass) {
            let idShipClass = this.designedShipClass.idShipClass;
            if (!idShipClass) {
                return;
            }
            let sub = this.shipYardApi.deleteShipClass(idShipClass).subscribe(resp => this.shipyardService.modifyShipClass(resp));
            this.subscriptions.push(sub);
        }
    }

    /**
     * fetches the costs for the current ship class selection
     * @private
     */
    private getCosts() {
        if (!!this.designedShipClass && ShipClassValidator.isValid(this.designedShipClass) && this.idChangePending()) {
            let sub = this.resourceApi.getShipClassCosts(this.designedShipClass)
                .subscribe(resp => this.costs = resp);
            this.subscriptions.push(sub);

            sub = this.resourceApi.getShipClassCapabilities(this.designedShipClass)
                .subscribe(resp => this.capabilities = resp);
            this.subscriptions.push(sub);

            sub = this.resourceApi.getShipClassCapacities(this.designedShipClass)
                .subscribe(resp => this.capacities = resp);
            this.subscriptions.push(sub);
        } else if (!this.designedShipClass) {
            this.costs = undefined;
            this.capabilities = undefined;
            this.capacities = undefined;
            this.compareClass = undefined;
        }
    }

    /**
     * detects if there is a change from the last to the current version
     * @private
     */
    private idChangePending() {
        let result: boolean = false;
        if (!!this.compareClass && !!this.designedShipClass) {
            result = !ShipClassComparator.equals(this.compareClass, this.designedShipClass);
        } else if (!this.compareClass && !!this.designedShipClass) {
            result = true;
        }
        this.compareClass = this.designedShipClass;
        return result;
    }
}
