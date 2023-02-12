import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {
    Building,
    BuildingApiService,
    Construction,
    ConstructionApiService,
    EEducationType,
    ERefinementSequence,
    EResourceType,
    HumanResourceAmount,
    Planet,
    PlanetApiService,
    PlannedConstruction,
    ResourceAmount,
    ResourceDeposit,
    ResourcesApiService
} from "../../../../../services/swagger";
import {MatChip, MatChipListbox} from "@angular/material/chips";
import {UntypedFormControl} from "@angular/forms";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {PlanetsEventService} from "../../../planets-event.service";
import {TranslateService} from "@ngx-translate/core";
import {TypeService} from "../../../../../services/type.service";
import {ResourceHelper} from "../../../../../ResourceHelper";
import {ResourceDisplayManager} from "../../../../display-elements/modules/resource-display/ResourceDisplayManager";
import ProductionCategoryEnum = Building.ProductionCategoryEnum;

@Component({
    selector: 'app-ground-construct',
    templateUrl: './ground-construct.component.html',
    styleUrls: ['./ground-construct.component.scss']
})
export class GroundConstructComponent extends ResourceDisplayManager implements OnChanges, AfterViewInit {

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: Construction;
    activeConstructionKey?: string;

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
     * all EEducationType enum elements
     */
    eEducationTypes: EEducationType[] = [];

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
    income?: ResourceDeposit;
    capacity?: ResourceDeposit;
    levelImprovementResources?: ResourceAmount;
    levelImprovementHumanResources?: HumanResourceAmount;
    costsToDisplay?: ResourceDeposit;
    private knownCosts: Map<String, ResourceDeposit> = new Map<String, ResourceDeposit>();

    /**
     * the EResourceType mat chip list
     */
    @ViewChild('resourceTypeChipList')
    resourceTypeChipList!: MatChipListbox;

    /**
     * the EProductionCategory mat chip list
     */
    @ViewChild('productCategoryChipList')
    productCategoryChipList!: MatChipListbox;

    /**
     * the ERefinementSequence mat chip list
     */
    @ViewChild('refinementSequenceChipList')
    refinementSequenceChipList!: MatChipListbox;

    /**
     * some needed form controls to use the mat chip list
     */
    eResourceTypeFC: UntypedFormControl = new UntypedFormControl({});
    eProductionCategoryFC: UntypedFormControl = new UntypedFormControl({});
    eRefinementSequenceFC: UntypedFormControl = new UntypedFormControl({});

    formControl: UntypedFormControl = new UntypedFormControl({});

    /**
     * if these planets support a new construction
     */
    constructionPossible: boolean = false;

    private readonly newConstruction = 'planetary.constructions.build.is-new';
    private readonly hasConstruction = 'planetary.constructions.build.has-level';

    translations: Map<string, string> = new Map<string, string>();

    constructor(private constructionApi: ConstructionApiService,
                private buildingApi: BuildingApiService,
                private planetApi: PlanetApiService,
                private resourceApi: ResourcesApiService,
                private typeService: TypeService,
                private notificationService: SnackbarNotificationService,
                private planetsNotificationService: PlanetsEventService,
                public translate: TranslateService) {
        super();

        let subscription = planetsNotificationService.getConstructionStartsEmitter().subscribe(() => this.fetchPlanet());
        this.subscriptions.push(subscription);

        this.translations.set(this.newConstruction, this.newConstruction);
        this.translate.get('planetary.constructions.build.is-new').subscribe((translated: string) => {
            this.translations.set(this.newConstruction, translated);
        });

        this.translations.set(this.hasConstruction, this.hasConstruction);
        this.translate.get('planetary.constructions.build.has-level').subscribe((translated: string) => {
            this.translations.set(this.hasConstruction, translated);
        });

        this.eEducationTypes = typeService.educationTypes;
        this.eResourceTypes = typeService.eResourceTypes;
        this.eRefinementSequences = typeService.eRefinementSequences;
        this.eProductionCategories = typeService.eProductionCategories;
        this.eProductionCategoryFC.setValue(this.eProductionCategories);
        this.setResourceTypeFormControlData()
        this.setRefinementSequenceFormControlData()
    }

    ngAfterViewInit(): void {
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
                .subscribe(resp => this.resourceDeposit = resp);
            this.subscriptions.push(sub);

            sub = this.resourceApi.getPlanetaryIncome(this.selectedPlanetInput.idPlanet)
                .subscribe(resp => {
                    this.income = resp;
                });
            this.subscriptions.push(sub);
            sub = this.resourceApi.getPlanetaryCapacity(this.selectedPlanetInput.idPlanet)
                .subscribe(resp => {
                    this.capacity = resp;
                });
            this.subscriptions.push(sub);
        }
    }

    /**
     * this filters the displayed constructions by the selected filters
     * @private
     */
    filterDisplayedConstructions() {
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
    startConstruction(construction: Construction) {
        let sub = this.planetApi.buildConstruction(this.selectedPlanetInput!.idPlanet, construction!.building.idBuilding)
            .subscribe(resp => {
                if (resp) {
                    this.notificationService.open("Construction of " + construction.building.name + " started.");
                    this.constructionPossible = false;
                    this.fetchPlanet();
                    this.planetsNotificationService.pushStartedConstruction();
                } else {
                    this.notificationService.open("This was not possible.");
                }
            });
        this.subscriptions.push(sub);
    }

    showCosts(construction: Construction | null) {
        this.setLevelImprovement(construction)
        if (!construction) {
            this.costsToDisplay = undefined;
            this.activeConstructionKey = undefined;
            return;
        }
        let c: PlannedConstruction = {
            idBuilding: construction.building.idBuilding,
            targetLevel: construction.level + 1
        }
        let key = this.getConstructionKey(construction);
        this.activeConstructionKey = key;
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

    setLevelImprovement(construction: Construction | null) {
        if (!construction) {
            this.levelImprovementResources = undefined;
            this.levelImprovementHumanResources = undefined;
            return;
        }

        let valueAtLevel = ResourceHelper.calculateLevelOutput(construction);
        let productionTarget = construction.building.productionTarget;
        let productionCategory = construction.building.productionCategory;
        switch (productionCategory) {
            case ProductionCategoryEnum.CAPACITY:
                // do not display capacity because the value is shown by a tooltip
                break;
            case ProductionCategoryEnum.PRODUCE:
                this.levelImprovementResources = {
                    resourceType: productionTarget,
                    amount: valueAtLevel
                }
                break;
            case ProductionCategoryEnum.REFINEMENT:
                let refinementSequence = construction.building.refinementSequence;
                let product = refinementSequence!.product;
                this.levelImprovementHumanResources = {
                    resourceType: product,
                    amount: valueAtLevel
                }
                break;
        }
    }

    private getConstructionKey(construction: Construction) {
        let s1 = construction.level + 1;
        return construction.building.idBuilding + "-" + s1;
    }

    /**
     * toggles all chips depending on the current selected chips
     */
    toggle(event: string) {
        let chipList: MatChipListbox | undefined;
        if (event == 'resourceTypeChipList') {
            chipList = this.resourceTypeChipList;
        }
        if (event == 'productCategoryChipList') {
            chipList = this.productCategoryChipList;
        }
        if (event == 'refinementSequenceChipList') {
            chipList = this.refinementSequenceChipList;
        }
        if (!!chipList) {
            let selected = chipList._chips.filter(chip => chip.selected);
            let unselected = chipList._chips.filter(chip => !chip.selected);
            if (selected.length > unselected.length) {
                chipList._chips.forEach(chip => chip.deselect());
            } else {
                chipList._chips.forEach(chip => chip.select());
            }
            this.filterDisplayedConstructions();
        }
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(construction: Construction): string {
        let folder = construction.building.productionTarget.folder;
        let iconName = construction.building.productionTarget.iconName;
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }

    getLinkR(resourceType: EResourceType | EEducationType): string { // fixme unify with above
        let folder = resourceType.folder;
        let iconName = resourceType.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }

    getInvisibility(construction: Construction) {
        return this.currentlyOpenedItemIndex === construction ? 'invisible' : '';
    }
}
