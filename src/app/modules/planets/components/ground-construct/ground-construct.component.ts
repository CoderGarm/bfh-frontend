import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {BuildingApiService, Construction, ConstructionApiService, Planet, PlanetApiService} from "../../../../services/swagger";
import {Subscription} from "rxjs";
import {MatChip, MatChipList} from "@angular/material/chips";
import {FormControl} from "@angular/forms";

@Component({
    selector: 'app-ground-construct',
    templateUrl: './ground-construct.component.html',
    styleUrls: ['./ground-construct.component.scss']
})
export class GroundConstructComponent implements OnChanges, AfterViewInit {

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: Construction;

    /**
     * every sub which should be cancelled on destroy
     * @private
     */
    private subscriptions: Subscription[] = [];

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
    eResourceTypes: string[] = [];

    /**
     * all EProductionCategory enum elements
     */
    eProductionCategories: string[] = [];

    /**
     * all ERefinementSequence enum elements
     */
    eRefinementSequences: string[] = [];

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    selectedPlanetInput?: Planet;
    private selectedPlanetDefinition = "selectedPlanetInput";

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

    constructor(private constructionApi: ConstructionApiService,
                private buildingApi: BuildingApiService,
                private planetApi: PlanetApiService) {
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

        subscription = this.buildingApi
            .getEResourceTypes()
            .subscribe((resp: string[]) => {
                this.eResourceTypes = resp;
                this.eResourceTypeFC.setValue(resp);
            });
        this.subscriptions.push(subscription);

        subscription = this.buildingApi
            .getERefinementSequences()
            .subscribe((resp: string[]) => {
                this.eRefinementSequences = resp;
                this.eRefinementSequenceFC.setValue(resp);
            });
        this.subscriptions.push(subscription);

        this.filterDisplayedConstructions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            this.fetchPlanet();
        }
    }

    private fetchPlanet() {
        if (!!this.selectedPlanetInput && !!this.selectedPlanetInput.idPlanet) {
            let subscription = this.constructionApi
                .getPossibleConstructionsByPlanet(this.selectedPlanetInput.idPlanet)
                .subscribe(resp => {
                    this.possibleConstructions = resp;
                    this.filterDisplayedConstructions();
                });
            this.subscriptions.push(subscription);

            let sub = this.planetApi.isConstructionPossibleOnPlanet(this.selectedPlanetInput!.idPlanet)
                .subscribe(resp => this.constructionPossible = resp);
            this.subscriptions.push(sub);
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
            const includesResourceType = selectedResourceTypes.includes(building.productionTarget);
            const includesCategory = selectedProductCategories.includes(building.productionCategory);
            let includesSequence = true;
            if (!!building.refinementSequence) {
                includesSequence = selectedRefinementSequence.includes(building.refinementSequence);
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
}
