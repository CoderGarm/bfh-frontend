import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {
    Planet,
    PlanetApiService,
    ShipClass,
    ShipyardApiService,
    ShipyardConstructionOrder,
    ShipyardConstructionSelection
} from "../../../../../services/swagger";
import {Subscription} from "rxjs";
import {FormControl} from "@angular/forms";
import {MatChip, MatChipList} from "@angular/material/chips";

@Component({
    selector: 'app-shipyard',
    templateUrl: './shipyard.component.html',
    styleUrls: ['./shipyard.component.scss']
})
export class ShipyardComponent implements AfterViewInit, OnChanges {

    /**
     * the displayed ship class
     */
    currentlyOpenedItemIndex?: ShipClass;

    /**
     * every sub which should be cancelled on destroy
     * @private
     */
    private subscriptions: Subscription[] = [];

    /**
     * the productable ship classes
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

    /**
     * all EResourceType enum elements
     */
    eHullTypes: string[] = [];

    /**
     * some needed form controls to use the mat chip list
     */
    eHullTypeFC: FormControl = new FormControl({});

    /**
     * the EResourceType mat chip list
     */
    @ViewChild('hullTypeChipList')
    hullTypeChipList!: MatChipList;

    /**
     * the ship class which should be build
     * and it's field name
     */
    buildShipClass?: ShipyardConstructionSelection;
    private buildShipClassDefinition: string = "buildShipClass";

    shipyardJobPossible: boolean = false;

    /**
     * the job order which will be used at this planet
     */
    order?: ShipyardConstructionOrder;

    /**
     * the complete selection for the job
     */
    selection: ShipyardConstructionSelection[] = [];

    constructor(private tokenStorage: TokenStorage,
                private shipyardApi: ShipyardApiService,
                private planetApi: PlanetApiService) {
    }

    ngAfterViewInit(): void {
        let subscription = this.shipyardApi
            .getEHullTypes()
            .subscribe((resp: string[]) => {
                this.eHullTypes = resp;
                this.eHullTypeFC.setValue(resp);
                this.filterDisplayedShipClasses();
            });
        this.subscriptions.push(subscription);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            let userID: number = this.tokenStorage.getUserID();
            if (!!userID && this.selectedPlanetInput) {
                let subscription = this.shipyardApi.getShipClassesByUser(userID).subscribe(resp => {
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

    buildConstruction() {
        if (!!this.order) {
            this.order.shipJobPayload = this.selection;
            let subscription = this.planetApi.buildShip(this.order).subscribe(resp => this.shipyardJobPossible = !resp);
            this.subscriptions.push(subscription);
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
        const selectedResourceTypes: string[] = this.getStringArrayFromMatChips(this.hullTypeChipList!.selected);

        this.filteredShipClasses = this.possibleShipClasses.filter(shipClass => {
            return selectedResourceTypes.includes(shipClass.hull.hullType);
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

    getAmount(shipClass: ShipClass): number {
        const selection: ShipyardConstructionSelection[] = this.selection.filter(s => s.idShipClass === shipClass.idShipClass);
        if (!selection || selection.length < 1) {
            return 0;
        }
        let singleSelection: ShipyardConstructionSelection = selection[0];
        return !!singleSelection.amount ? singleSelection.amount : 0;
    }

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
    }

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
    }
}
