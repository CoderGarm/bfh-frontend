import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {
    BuildingApiService,
    Construction,
    ConstructionApiService,
    ERefinementSequence,
    EResourceType,
    Planet,
    PlanetApiService,
    PlannedConstruction,
    ResourceDeposit,
    ResourcesApiService
} from "../../../../../services/swagger";
import {MatChip, MatChipList} from "@angular/material/chips";
import {FormControl} from "@angular/forms";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-ground-construct',
    templateUrl: './ground-construct.component.html',
    styleUrls: ['./ground-construct.component.scss']
})
export class GroundConstructComponent extends SubscriptionManager implements OnChanges, AfterViewInit {

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: Construction;

    /**
     * all possible construction which could be build
     */
    possibleConstructions: Construction[] = [];

    /**
     * all possibly constructable building which are filtered to display
     */
    filteredConstructions: Construction[] = [];

    /**
     * all EResourceType enum elements
     */
    eResourceTypes: EResourceType[] = [];

    /**
     * all EProductionCategory enum elements
     */
    eProductionCategories: string[] = [];

    /**
     * all ERefinementSequence enum elements
     */
    eRefinementSequences: ERefinementSequence[] = [];

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    selectedPlanetInput?: Planet;
    private selectedPlanetDefinition = "selectedPlanetInput";

    resourceDeposit?: ResourceDeposit;

    /**
     * the EResourceType mat chip list
     */
    @ViewChild('resourceTypeChipList')
    resourceTypeChipList!: MatChipList;

    /**
     * the EProductionCategory mat chip list
     */
    @ViewChild('productCategoryChipList')
    productCategoryChipList!: MatChipList;

    /**
     * the ERefinementSequence mat chip list
     */
    @ViewChild('refinementSequenceChipList')
    refinementSequenceChipList!: MatChipList;

    /**
     * some needed form controls to use the mat chip list
     */
    eResourceTypeFC: FormControl = new FormControl({});
    eProductionCategoryFC: FormControl = new FormControl({});
    eRefinementSequenceFC: FormControl = new FormControl({});

    /**
     * if this planets support a new construction
     */
    constructionPossible: boolean = false;

    private knownCosts: Map<String, ResourceDeposit> = new Map<String, ResourceDeposit>();
    costsToDisplay?: ResourceDeposit;

    constructor(private constructionApi: ConstructionApiService,
                private buildingApi: BuildingApiService,
                private planetApi: PlanetApiService,
                private resourceApi: ResourcesApiService) {
        super();
    }

    ngAfterViewInit(): void {
        this.fetchPlanet();

        let subscription = this.buildingApi
            .getEProductionCategories()
            .subscribe((resp: string[]) => {
                this.eProductionCategories = resp;
                this.eProductionCategoryFC.setValue(resp);
            });
        this.subscriptions.push(subscription);

        subscription = this.resourceApi
            .getEResourceTypes()
            .subscribe(resp => {
                this.eResourceTypes = resp;
                this.setResourceTypeFormControlData()
            });
        this.subscriptions.push(subscription);

        subscription = this.buildingApi
            .getERefinementSequences()
            .subscribe(resp => {
                this.eRefinementSequences = resp;
                this.setRefinementSequenceFormControlData()
            });
        this.subscriptions.push(subscription);

        this.filterDisplayedConstructions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            this.fetchPlanet();
        }
    }

    /**
     * sets the data as string to the fc
     * @private
     */
    private setRefinementSequenceFormControlData() {
        let typeNames = this.eRefinementSequences.map(r => r.typeName);
        this.eRefinementSequenceFC.setValue(typeNames);
    }

    /**
     * sets the data as string to the fc
     * @private
     */
    private setResourceTypeFormControlData() {
        let typeNames = this.eResourceTypes.map(r => r.typeName);
        this.eResourceTypeFC.setValue(typeNames);
    }

    /**
     * fetches the necessary information for the planet
     * @private
     */
    private fetchPlanet() {
        if (!!this.selectedPlanetInput && !!this.selectedPlanetInput.idPlanet) {
            let sub = this.constructionApi
                .getPossibleConstructionsByPlanet(this.selectedPlanetInput.idPlanet)
                .subscribe(resp => {
                    this.possibleConstructions = resp;
                    this.filterDisplayedConstructions();
                });
            this.subscriptions.push(sub);

            sub = this.planetApi.isConstructionPossibleOnPlanet(this.selectedPlanetInput!.idPlanet)
                .subscribe(resp => this.constructionPossible = resp);
            this.subscriptions.push(sub);

            sub = this.resourceApi.getResourceDeposit(this.selectedPlanetInput.idPlanet)
                .subscribe(resp => {
                    this.resourceDeposit = resp;
                });
            this.subscriptions.push(sub);
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
            this.filterDisplayedConstructions();
        }
    }

    /**
     * this filters the displayed constructions by the selected filters
     * @private
     */
    private filterDisplayedConstructions() {
        const selectedResourceTypes: string[] = this.getStringArrayFromMatChips(this.resourceTypeChipList!.selected);
        const selectedProductCategories: string[] = this.getStringArrayFromMatChips(this.productCategoryChipList!.selected);
        const selectedRefinementSequence: string[] = this.getStringArrayFromMatChips(this.refinementSequenceChipList!.selected);

        this.filteredConstructions = this.possibleConstructions.filter(construction => {
            const building = construction.building;
            const includesResourceType = selectedResourceTypes.includes(building.productionTarget.typeName);
            const includesCategory = selectedProductCategories.includes(building.productionCategory);
            let includesSequence = true;
            if (!!building.refinementSequence) {
                includesSequence = selectedRefinementSequence.includes(building.refinementSequence.typeName);
            }
            return includesResourceType && includesCategory && includesSequence;
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
    setOpened(itemIndex: Construction) {
        this.currentlyOpenedItemIndex = itemIndex;
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the closed item
     * @param itemIndex
     */
    setClosed(itemIndex: Construction) {
        if (this.currentlyOpenedItemIndex === itemIndex) {
            this.currentlyOpenedItemIndex = undefined;
        }
    }

    /**
     * returns true if the description should be displayed, false otherwise
     * @param construction
     */
    showDescription(construction: Construction): boolean {
        return this.currentlyOpenedItemIndex != construction;
    }

    /**
     * starts the construction of the building at the planet
     */
    startConstruction(selectedConstructionInput: Construction) {
        let sub = this.planetApi.buildBuilding(this.selectedPlanetInput!.idPlanet, selectedConstructionInput!.building.idBuilding)
            .subscribe(resp => {
                if (resp) {
                    this.constructionPossible = false;
                }
            });
        this.subscriptions.push(sub);
    }

    showCosts(construction: Construction | null) {
        if (!construction) {
            this.costsToDisplay = undefined;
            return;
        }
        let c: PlannedConstruction = {
            idBuilding: construction.building.idBuilding,
            targetLevel: construction.level + 1
        }
        let key: string = c.idBuilding + "-" + c.targetLevel;
        let costs: ResourceDeposit | undefined = this.knownCosts.get(key)
        if (!costs) {
            let sub = this.resourceApi.getBuildingCosts(c)
                .subscribe(resp => {
                    costs = resp;
                    this.knownCosts.set(key, resp);
                });
            this.subscriptions.push(sub);
        }
        this.costsToDisplay = costs;
    }
}
