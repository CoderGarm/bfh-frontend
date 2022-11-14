import {AfterContentInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {
    EHullType,
    Planet,
    PlanetApiService,
    ResourceDeposit,
    ResourcesApiService,
    ShipClass,
    ShipyardApiService,
    ShipyardConstructionOrder,
    ShipyardConstructionSelection
} from "../../../../../services/swagger";
import {FormControl} from "@angular/forms";
import {MatChip, MatChipList} from "@angular/material/chips";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {PlanetsNotificationService} from "../../../planets-notification.service";
import {ResourceHelper} from "../../../../../ResourceHelper";
import {TypeService} from "../../../../../services/type.service";
import {TranslateService} from "@ngx-translate/core";
import {ResourceDisplayManager} from "../../../../display-elements/modules/resource-display/ResourceDisplayManager";

@Component({
    selector: 'app-shipyard',
    templateUrl: './shipyard.component.html',
    styleUrls: ['./shipyard.component.scss']
})
export class ShipyardComponent extends ResourceDisplayManager implements AfterContentInit, OnChanges {

    /**
     * the displayed ship class
     */
    currentlyOpenedItemIndex?: ShipClass;

    /**
     * the producable ship classes
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
    readonly eHullTypes: EHullType[] = [];

    /**
     * some needed form controls to use the mat chip list
     */
    eHullTypeFC: FormControl = new FormControl({});

    /**
     * the EResourceType mat chip list
     */
    @ViewChild('hullTypeChipList')
    hullTypeChipList!: MatChipList;

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

    translations: Map<string, string> = new Map<string, string>();

    constructor(private tokenStorage: TokenStorage,
                private shipyardApi: ShipyardApiService,
                private typeService: TypeService,
                private planetApi: PlanetApiService,
                private resourceApi: ResourcesApiService,
                private notificationService: SnackbarNotificationService,
                private planetsNotificationService: PlanetsNotificationService,
                private translate: TranslateService) {
        super();

        this.eHullTypes = typeService.eHullTypes;

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
        const sub = this.planetsNotificationService.ask().subscribe(() => this.updateDepositsAndIncome());
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
                    this.possibleShipClasses = resp;
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
                    this.planetsNotificationService.push();
                } else {
                    this.notificationService.open("This was not possible.")
                }
            });
            this.subscriptions.push(subscription);
        }
    }

    /**
     * this selects or deselects the clicked chip in the given list and starts the filtering
     *
     * @param chipValue the value of the mat chip
     * @param chipList the chip list which is mused
     */
    clickAChip(chipValue: string, chipList: MatChipList) {
        const selectedChips: MatChip[] | MatChip = chipList.selected;

        const matChips: MatChip[] = chipList.chips.filter(chip => chip.value === chipValue);
        if (matChips.length != 1) {
            throw new Error("There should be only one selectable chip.");
        } else {
            let newlySelected: boolean = true;
            const clickedChip = matChips[0];
            if (selectedChips instanceof Array) {
                if (selectedChips.includes(clickedChip)) {
                    newlySelected = false;
                }
            } else if (selectedChips === clickedChip) {
                newlySelected = false;
            }

            if (newlySelected) {
                clickedChip.select();
            } else {
                clickedChip.deselect();
            }
            this.filterDisplayedShipClasses();
        }
    }

    /**
     * this filters the displayed ship classes by the selected filters
     * @private
     */
    private filterDisplayedShipClasses() {
        if (!this.hullTypeChipList) {
            return;
        }
        const selectedResourceTypes: string[] = this.getStringArrayFromMatChips(this.hullTypeChipList.selected);

        this.filteredShipClasses = this.possibleShipClasses.filter(shipClass => {
            return selectedResourceTypes.includes(shipClass.hull.hullType.typeName);
        });
    }

    /**
     * just fetches every string from the given mat chip list
     * @param matChipList the chip list
     * @private
     */
    private getStringArrayFromMatChips(matChipList: MatChip[] | MatChip): string[] {
        const selectedResourceTypes: string[] = [];
        if (matChipList instanceof Array) {
            matChipList.forEach(chip => selectedResourceTypes.push(chip.value));
        } else {
            selectedResourceTypes.push(matChipList.value);
        }
        return selectedResourceTypes;
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the opened item
     * @param itemIndex
     */
    setOpened(itemIndex: ShipClass) {
        this.currentlyOpenedItemIndex = itemIndex;
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the closed item
     * @param itemIndex
     */
    setClosed(itemIndex: ShipClass) {
        if (this.currentlyOpenedItemIndex === itemIndex) {
            this.currentlyOpenedItemIndex = undefined;
        }
    }

    /**
     * returns true if the description should be displayed, false otherwise
     * @param itemIndex
     */
    showHeader(itemIndex: ShipClass): boolean {
        return this.currentlyOpenedItemIndex != itemIndex;
    }

    getAmountString(shipClass: ShipClass): string {
        return "" + this.getAmount(shipClass);
    }

    getAmount(shipClass: ShipClass): number {
        const selection: ShipyardConstructionSelection[] = this.selection.filter(s => s.idShipClass === shipClass.idShipClass);
        if (!selection || selection.length < 1) {
            return 0;
        }
        let singleSelection: ShipyardConstructionSelection = selection[0];
        return !!singleSelection.amount ? singleSelection.amount : 0;
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
    }

    private checkBalances() {
        if (!this.costsToDisplay || !this.resourceDeposit) {
            this.jobTooExpensive = true;
            return;
        }
        this.jobTooExpensive = !ResourceHelper.canPayTheCollectableBill(this.costsToDisplay, this.resourceDeposit);
    }

    /**
     * subtracts one of the type for the selection
     * @param shipClass
     */
    sub(shipClass: ShipClass) {
        const selection: ShipyardConstructionSelection[] = this.selection.filter(s => s.idShipClass === shipClass.idShipClass);
        if (!selection) {
            return;
        }
        let singleSelection: ShipyardConstructionSelection = selection[0];
        if (!singleSelection.amount || singleSelection.amount <= 0) {
            let indexOf = this.selection.indexOf(singleSelection);
            this.selection.slice(indexOf, indexOf++)
        } else {
            singleSelection.amount--;
        }
        this.getCostsAndCheckBalances();
    }

    /**
     * adds one of the type for the selection
     * @param shipClass
     */
    add(shipClass: ShipClass) {
        const selection: ShipyardConstructionSelection[] = this.selection.filter(s => s.idShipClass === shipClass.idShipClass);
        if (!selection || selection.length < 1) {
            const n: ShipyardConstructionSelection = {
                idShipClass: shipClass.idShipClass!,
                amount: 0
            }
            selection.push(n);
        }
        let singleSelection: ShipyardConstructionSelection = selection[0];
        if (!singleSelection.amount) {
            singleSelection.amount = 0;
        }
        singleSelection.amount++;

        let indexOf = this.selection.indexOf(singleSelection);
        if (indexOf == -1) {
            this.selection.push(singleSelection);
        }
        this.getCostsAndCheckBalances();
    }

    /**
     * toggles all chips depending on the current selected chips
     */
    toggle() {
        if (!!this.hullTypeChipList) {
            let selected = this.hullTypeChipList.chips.filter(chip => chip.selected);
            let unselected = this.hullTypeChipList.chips.filter(chip => !chip.selected);
            if (selected.length > unselected.length) {
                this.hullTypeChipList.chips.forEach(chip => chip.deselect());
            } else {
                this.hullTypeChipList.chips.forEach(chip => chip.select());
            }
            this.filterDisplayedShipClasses();
        }
    }

    hasSomeShipsForBuildSelected() {
        if (!this.order) {
            return false;
        }
        let amount = 0;
        this.selection.forEach(o => amount += o.amount);
        return amount != 0;
    }

    getJobButtonText() {
        if (this.shipyardJobPossible) {
            return this.translations.get('shipyard.constructions.build.already-in-use')!;
        }
        if (this.jobTooExpensive) {
            return this.translations.get('shipyard.constructions.build.too-expensive')!;
        }
        if (!this.hasSomeShipsForBuildSelected()) {
            return this.translations.get('shipyard.constructions.build.nothing-to-do')!;
        }
        return this.translations.get('shipyard.constructions.build.start-building')!;
    }
}
