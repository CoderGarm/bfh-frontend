import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {
    AlignedFitting,
    ResourceDeposit,
    ResourcesApiService,
    ShipClass,
    ShipClassMock,
    ShipyardApiService,
    SpacecraftCapabilities,
    SpacecraftCapacityAreas
} from "../../../../../services/swagger";
import {ShipClassNamePatternErrorMessages} from "../../../../../validators/shipNamePatternValidator";
import {UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {ShipClassComparator} from "../ShipClassComparator";
import {ShipClassTabViewComponent} from "../../orga/ship-class-tab-view/ship-class-tab-view.component";
import {ShipyardEventService} from "../../../shipyard-event.service";
import {TypeService} from "../../../../../services/type.service";

@Component({
    selector: 'app-fitting-create',
    templateUrl: './fitting-create.component.html',
    styleUrls: ['./fitting-create.component.scss']
})
export class FittingCreateComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = ShipClassTabViewComponent.path + '/create';

    resourceDeposit?: ResourceDeposit;

    /**
     * forwards the weapon alignments by amount to the svg component
     */
    @Output()
    weaponsAmountByAlignmentOutput: EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>> = new EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>>();

    designedShipClassInput?: ShipClassMock;

    /**
     * the state of the store-button
     */
    disabled: boolean = true;

    /**
     * all possible errors to display
     */
    errors = ShipClassNamePatternErrorMessages;

    /**
     * the form group which defines the name field
     */
    form: UntypedFormGroup = new UntypedFormGroup({
        scName: new UntypedFormControl()
    });

    costs?: ResourceDeposit;

    compareClass?: ShipClassMock;
    capabilities: SpacecraftCapabilities;
    defaultCapabilities: SpacecraftCapabilities = {capabilities: []};
    capacities: SpacecraftCapacityAreas;
    defaultCapacities: SpacecraftCapacityAreas = {
        capacityValues: [
            {capacity: 0, usedCapacity: 0, capacityArea: "OVERALL"},
            {capacity: 0, usedCapacity: 0, capacityArea: "STERN"},
            {capacity: 0, usedCapacity: 0, capacityArea: "BROADSIDE"},
            {capacity: 0, usedCapacity: 0, capacityArea: "BOW"},
            {capacity: 0, usedCapacity: 0, capacityArea: "MODULE"},
        ]
    };

    constructor(private shipYardApi: ShipyardApiService,
                private shipyardService: ShipyardEventService,
                private typeService: TypeService,
                private resourceApi: ResourcesApiService) {
        super();

        const eModuleTypes = this.typeService.eModuleTypes;
        eModuleTypes.forEach(eModuleTypes => this.defaultCapabilities.capabilities.push({value: 0, moduleType: eModuleTypes}));

        this.capabilities = this.defaultCapabilities;
        this.capacities = this.defaultCapacities;
    }

    ngAfterViewInit(): void {
        // just the time-efficient way to provoke drawing the hull outlines in the svg
        this.weaponsAmountByAlignmentOutput.emit(undefined);

        let sub = this.resourceApi.getResourceDepositForUser().subscribe(resp => this.resourceDeposit = resp);
        this.subscriptions.push(sub);
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
            let userID = this.tokenStorage.getUserID();
            let role = this.tokenStorage.getRole();
            let username = this.tokenStorage.getLogin();
            let output: ShipClass = {
                hull: this.designedShipClassInput.hull!,
                fittings: this.designedShipClassInput.fittings,
                ammunitionFittings: this.designedShipClassInput.ammunitionFittings,
                supportFittings: this.designedShipClassInput.supportFittings,
                armor: this.designedShipClassInput.armor,
                electronicWarfare: this.designedShipClassInput.electronicWarfare,
                propulsion: this.designedShipClassInput.propulsion,
                sidewall: this.designedShipClassInput.sidewall,
                mark: 1,
                name: this.form.controls.scName.value,
                owner: {
                    idUser: userID,
                    role: role,
                    username: username
                },
                shipClassCapabilities: {
                    capabilities: []
                },
                spacecraftCapacityAreas: {
                    capacityValues: []
                },
                ammunitionState: {
                    shotsPerMissile: []
                }
            };

            let sub = this.shipYardApi.setShipClass(output)
                .subscribe(resp => this.shipyardService.modifyShipClass(resp));
            this.subscriptions.push(sub);
        }
    }

    /**
     * sets the ship class and defines the state of the store-button
     * @param shipClass
     */
    setShipClass(shipClass?: ShipClassMock) {
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
            this.capabilities = this.defaultCapabilities;
            this.capacities = this.defaultCapacities;
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
