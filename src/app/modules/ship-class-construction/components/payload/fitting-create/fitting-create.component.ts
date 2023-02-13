import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {
    AlignedFitting,
    ResourceDeposit,
    ResourcesApiService,
    ShipClass,
    ShipyardApiService,
    SpacecraftCapabilities,
    SpacecraftCapacityAreas
} from "../../../../../services/swagger";
import {ShipClassNamePatternErrorMessages} from "../../../../../validators/shipNamePatternValidator";
import {UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {ShipClassComparator} from "../ShipClassComparator";
import {ShipClassTabViewComponent} from "../../orga/ship-class-tab-view/ship-class-tab-view.component";

@Component({
    selector: 'app-fitting-create',
    templateUrl: './fitting-create.component.html',
    styleUrls: ['./fitting-create.component.scss']
})
export class FittingCreateComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    static path: string = ShipClassTabViewComponent.path + '/create';

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
     * the displayed ship class name
     */
    @Output()
    shipClassNameOutput?: string;

    /**
     * forwards the weapon alignments by amount to the svg component
     */
    @Output()
    weaponsAmountByAlignmentOutput: EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>> = new EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>>();

    /**
     * if the ship class which was created by the user is valid, it will appear here
     */
    @Output()
    designedShipClassOutputEmitter: EventEmitter<ShipClass> = new EventEmitter<ShipClass>();

    designedShipClassInput?: ShipClass;

    /**
     * the state of the store-button
     */
    disabled: boolean = true;

    /**
     * the event emitter that communicates the successful creation of a new class
     */
    @Output()
    modifiedShipClassOutput: EventEmitter<ShipClass> = new EventEmitter<ShipClass>();

    /**
     * all possible errors to display
     */
    errors = ShipClassNamePatternErrorMessages;

    /**
     * the form group which defines the name field
     */
    form: UntypedFormGroup = new UntypedFormGroup({
        scName: new UntypedFormControl({value: '', disabled: !!this.shipClass})
    });

    costs?: ResourceDeposit;

    compareClass?: ShipClass;
    capabilities?: SpacecraftCapabilities;
    capacities?: SpacecraftCapacityAreas;

    constructor(private shipYardApi: ShipyardApiService,
                private resourceApi: ResourcesApiService) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.form.controls.scName.valueChanges.subscribe(value => {
            if (this.shipClassNameOutput != value) {
                this.shipClassNameOutput = value;
            }
        });
        this.subscriptions.push(sub);

        sub = this.designedShipClassOutputEmitter.subscribe(event => {
            this.designedShipClassInput = event;
            this.setShipClass(this.designedShipClassInput)
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
            // detecting ship class name
            if (!!this.shipClass) {
                this.shipClassNameOutput = this.shipClass.name;
            } else {
                this.shipClassNameOutput = '';
            }
            // setting detected name
            this.form.controls.scName.setValue(this.shipClassNameOutput);
            // enable or disable input depending on if the name could be changed or is fixed
            if (!!this.shipClass) {
                this.form.controls.scName.disable();
            } else {
                this.form.controls.scName.enable();
            }
            this.setShipClass(this.shipClass)
        }
    }

    /**
     * forwards the weapon alignments by amount to the svg component
     * @param event
     */
    setWeaponsAmountByAlignmentInput(event: Map<AlignedFitting.WeaponAlignmentEnum, number>) {
        this.weaponsAmountByAlignmentOutput.emit(event);
    }

    /**
     * stores the designed class to the database
     */
    storeClass() {
        if (!!this.designedShipClassInput) {
            let sub = this.shipYardApi.setShipClass(this.designedShipClassInput)
                .subscribe(resp => this.modifiedShipClassOutput.emit(resp));
            this.subscriptions.push(sub);
        }
    }

    /**
     * sets the ship class and defines the state of the store-button
     * @param shipClass
     */
    setShipClass(shipClass?: ShipClass) {
        this.designedShipClassInput = shipClass;
        if (this.disabled != !this.designedShipClassInput) {
            setTimeout(() => {
                this.disabled = !this.designedShipClassInput;
            }, 100);
        }
        this.getCosts();
    }

    private getCosts() {
        if (!!this.designedShipClassInput && this.isChangePending()) {
            let sub = this.resourceApi.getShipClassCosts(this.designedShipClassInput)
                .subscribe(resp => this.costs = resp);
            this.subscriptions.push(sub);

            sub = this.resourceApi.getShipClassCapabilities(this.designedShipClassInput)
                .subscribe(resp => this.capabilities = resp);
            this.subscriptions.push(sub);

            sub = this.resourceApi.getShipClassCapacities(this.designedShipClassInput)
                .subscribe(resp => this.capacities = resp);
            this.subscriptions.push(sub);
        } else if (!this.designedShipClassInput) {
            this.costs = undefined;
            this.capabilities = undefined;
            this.capacities = undefined;
            this.compareClass = undefined;
        }
    }

    private isChangePending() {
        let result: boolean = false;
        if (!!this.compareClass && !!this.designedShipClassInput) {
            result = !ShipClassComparator.equals(this.compareClass, this.designedShipClassInput);
        } else if (!this.compareClass && !!this.designedShipClassInput) {
            result = true;
        }
        this.compareClass = this.designedShipClassInput;
        return result;
    }
}
