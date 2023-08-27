import {AfterContentInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {
    EnumValueDto,
    EShipClassType,
    Mass,
    Planet,
    PlanetApiService,
    ResourceDeposit,
    ResourcesApiService,
    ShipClass,
    ShipyardApiService,
    ShipyardConstructionOrder,
    ShipyardConstructionSelection
} from "../../../../../services/swagger";
import {UntypedFormControl} from "@angular/forms";
import {MatChip, MatChipListbox} from "@angular/material/chips";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {PlanetsEventService} from "../../../planets-event.service";
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {TypeService} from "../../../../../services/type.service";
import {TranslateService} from "@ngx-translate/core";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {ModuleService} from "../../../../../services/prefetch/module.service";
import ECapacityAreaTypesEnum = EnumValueDto.ECapacityAreaTypesEnum;

@Component({
    selector: 'app-shipyard',
    templateUrl: './shipyard.component.html',
    styleUrls: ['./shipyard.component.scss']
})
export class ShipyardComponent extends SubscriptionManager implements AfterContentInit, OnChanges {

    /**
     * the producible ship classes
     */
    possibleShipClasses: ShipClass[] = [];

    /**
     * all possibly constructable ship classes which are filtered to display
     */
    filteredShipClasses: ShipClass[] = [];

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    selectedPlanetInput?: Planet;
    private selectedPlanetDefinition = "selectedPlanetInput";

    resourceDeposit?: ResourceDeposit;
    income?: ResourceDeposit;

    /**
     * all EResourceType enum elements
     */
    readonly eHullTypes: EShipClassType[] = [];

    /**
     * some needed form controls to use the mat chip list
     */
    eHullTypeFC: UntypedFormControl = new UntypedFormControl({});

    /**
     * the EResourceType mat chip list
     */
    @ViewChild('hullTypeChipList')
    hullTypeChipList!: MatChipListbox;

    buildShipClass?: ShipyardConstructionSelection;
    private buildShipClassDefinition: string = "buildShipClass";

    shipyardJobPossible: boolean = false;
    jobTooExpensive: boolean = false;

    /**
     * the job order which will be used at this planet
     */
    order?: ShipyardConstructionOrder;

    /**
     * the complete selection for the job
     */
    selection: ShipyardConstructionSelection[] = [];

    costsToDisplay?: ResourceDeposit;

    hasSomeShipsForBuildSelected: boolean = false;

    translations: Map<string, string> = new Map<string, string>();

    constructor(private shipyardApi: ShipyardApiService,
                private typeService: TypeService,
                private moduleService: ModuleService,
                private planetApi: PlanetApiService,
                private resourceApi: ResourcesApiService,
                private notificationService: SnackbarNotificationService,
                private planetsNotificationService: PlanetsEventService,
                private translate: TranslateService) {
        super();

        this.eHullTypes = typeService.shipClassTypes;

        this.translations.set('shipyard.constructions.build.already-in-use', 'shipyard.constructions.build.already-in-use');
        let sub = this.translate.get('shipyard.constructions.build.already-in-use').subscribe((translated: string) => {
            this.translations.set('shipyard.constructions.build.already-in-use', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('shipyard.constructions.build.too-expensive', 'shipyard.constructions.build.too-expensive');
        sub = this.translate.get('shipyard.constructions.build.too-expensive').subscribe((translated: string) => {
            this.translations.set('shipyard.constructions.build.too-expensive', translated);
        });
        this.subscriptions.push(sub);
    }

    ngAfterContentInit(): void {
        this.setHullTypeFormControlData();
        this.filterDisplayedShipClasses();
        const sub = this.planetsNotificationService.getConstructionStartsEmitter().subscribe(() => this.updateDepositsAndIncome());
        this.subscriptions.push(sub);
    }

    /**
     * sets the data as string to the fc
     * @private
     */
    private setHullTypeFormControlData() {
        let typeNames = this.eHullTypes.map(r => r.typeName);
        this.eHullTypeFC.setValue(typeNames);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            if (this.selectedPlanetInput) {
                let subscription = this.shipyardApi.getShipClassesByUser().subscribe(resp => {
                    this.possibleShipClasses = resp.filter(s => !(s.name === 'Songbird' && s.mark === 1));
                    this.filterDisplayedShipClasses();
                });
                this.subscriptions.push(subscription);
            }

            if (!!this.selectedPlanetInput && !!this.selectedPlanetInput.idPlanet) {
                let subscription = this.planetApi.isShipyardJobPossibleOnPlanet(this.selectedPlanetInput!.idPlanet)
                    .subscribe(resp => this.shipyardJobPossible = resp);
                this.subscriptions.push(subscription);

                this.order = {
                    idPlanet: this.selectedPlanetInput!.idPlanet,
                    shipJobPayload: []
                }
                this.updateDepositsAndIncome();
            }
        }

        if (changes[this.buildShipClassDefinition]) {
            // fetch change in ship class build selection and set it into overall selection
            if (!this.order) {
                this.order = {
                    idPlanet: this.selectedPlanetInput!.idPlanet,
                    shipJobPayload: []
                }
            }
        }
    }

    private updateDepositsAndIncome() {
        if (!this.selectedPlanetInput) {
            return;
        }
        let sub = this.resourceApi.getResourceDeposit(this.selectedPlanetInput.idPlanet)
            .subscribe(resp => {
                this.resourceDeposit = resp;
            });
        this.subscriptions.push(sub);
        sub = this.resourceApi.getPlanetaryIncome(this.selectedPlanetInput.idPlanet)
            .subscribe(resp => {
                this.income = resp;
            });
        this.subscriptions.push(sub);
    }

    buildConstruction() {
        if (!!this.order) {
            this.order.shipJobPayload = this.selection;
            let subscription = this.planetApi.buildShip(this.order).subscribe(resp => {
                if (resp) {
                    this.notificationService.open("Construction started.")
                    this.shipyardJobPossible = !resp
                    this.planetsNotificationService.pushStartedConstruction();
                } else {
                    this.notificationService.open("This was not possible.")
                }
            });
            this.subscriptions.push(subscription);
        }
    }

    /**
     * this filters the displayed ship classes by the selected filters
     * @private
     */
    filterDisplayedShipClasses() {
        if (!this.hullTypeChipList) {
            return;
        }
        const selectedResourceTypes: string[] = this.getStringArrayFromMatChips(this.hullTypeChipList.selected);

        this.filteredShipClasses = this.possibleShipClasses.filter(shipClass => {
            return selectedResourceTypes.includes(shipClass.shipClassType.typeName);
        });
    }

    /**
     * just fetches every string from the given mat chip list
     * @param MatChipListbox the chip list
     * @private
     */
    private getStringArrayFromMatChips(MatChipListbox: MatChip[] | MatChip): string[] {
        const selectedResourceTypes: string[] = [];
        if (MatChipListbox instanceof Array) {
            MatChipListbox.forEach(chip => selectedResourceTypes.push(chip.value));
        } else {
            selectedResourceTypes.push(MatChipListbox.value);
        }
        return selectedResourceTypes;
    }

    setAmount(amount: number, shipClass: ShipClass) {
        let element: ShipyardConstructionSelection;
        const selection: ShipyardConstructionSelection[] = this.selection.filter(s => s.idShipClass === shipClass.idShipClass);
        if (!!selection && selection.length > 0) {
            element = selection[0];
            const indexOf = this.selection.indexOf(element);
            this.selection.splice(indexOf, 1);
            element.amount = amount;
        } else {
            element = {
                idShipClass: shipClass.idShipClass!,
                amount: amount
            }
        }
        this.selection.push(element);
        if (!!this.order) {
            this.order.shipJobPayload = this.selection;
        }
        this.getCostsAndCheckBalances();
    }

    /**
     * fetches the costs for the current selection
     * @private
     */
    private getCostsAndCheckBalances() {
        if (!!this.order && this.selection.length != 0) {
            let sub = this.resourceApi.getShipyardOrderCosts(this.selection)
                .subscribe(resp => {
                    this.costsToDisplay = resp;
                    this.checkBalances();
                });
            this.subscriptions.push(sub);
        } else {
            this.costsToDisplay = undefined;
            this.jobTooExpensive = false;
        }
        this.detectHasSomeShipsForBuildSelected();
    }

    private checkBalances() {
        if (!this.costsToDisplay || !this.resourceDeposit) {
            this.jobTooExpensive = true;
            return;
        }
        this.jobTooExpensive = !ResourceHelper.canPayTheCollectableBill(this.costsToDisplay, this.resourceDeposit);
    }

    /**
     * toggles all chips depending on the current selected chips
     */
    toggle() {
        if (!!this.hullTypeChipList) {
            let selected = this.hullTypeChipList._chips.filter(chip => chip.selected);
            let unselected = this.hullTypeChipList._chips.filter(chip => !chip.selected);
            if (selected.length > unselected.length) {
                this.hullTypeChipList._chips.forEach(chip => chip.deselect());
            } else {
                this.hullTypeChipList._chips.forEach(chip => chip.select());
            }
            this.filterDisplayedShipClasses();
        }
    }

    private detectHasSomeShipsForBuildSelected() {
        if (!this.order) {
            this.hasSomeShipsForBuildSelected = false;
        } else {
            let amount = 0;
            this.selection.forEach(o => amount += o.amount);
            this.hasSomeShipsForBuildSelected = amount != 0;
        }
    }

    getJobButtonText() {
        if (!this.shipyardJobPossible) {
            return this.translations.get('shipyard.constructions.build.already-in-use')!;
        }
        if (this.jobTooExpensive) {
            return this.translations.get('shipyard.constructions.build.too-expensive')!;
        }
        if (!this.hasSomeShipsForBuildSelected) {
            return this.translations.get('shipyard.constructions.build.nothing-to-do')!;
        }
        return this.translations.get('shipyard.constructions.build.start-building')!;
    }

    getMass(shipClass: ShipClass): Mass {
        return shipClass.spacecraftCapacityAreas.capacityValues.filter(c => c.capacityArea === ECapacityAreaTypesEnum.OVERALL)[0].tonnage;
    }
}
