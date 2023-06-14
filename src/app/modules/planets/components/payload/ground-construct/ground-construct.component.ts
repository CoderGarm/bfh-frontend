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
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {SubscriptionManager} from "../../../../../subscription.manager";
import ProductionCategoryEnum = Building.ProductionCategoryEnum;

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

    sumOfPops: number = 0;

    ignoreExpensiveConstructions: boolean = false;

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

    /**
     * if these planets support a new construction
     */
    constructionPossible: boolean = false;

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

        this.translations.set('planetary.constructions.build.is-new', 'planetary.constructions.build.is-new');
        this.translate.get('planetary.constructions.build.is-new').subscribe((translated: string) => {
            this.translations.set('planetary.constructions.build.is-new', translated);
        });

        this.translations.set('planetary.constructions.build.has-level', 'planetary.constructions.build.has-level');
        this.translate.get('planetary.constructions.build.has-level').subscribe((translated: string) => {
            this.translations.set('planetary.constructions.build.has-level', translated);
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
        if (!!this.selectedPlanetInput) {
            const idPlanet = this.selectedPlanetInput.idPlanet;
            let sub = this.constructionApi
                .getPossibleConstructionsByPlanet(idPlanet).subscribe(resp => {
                    this.possibleConstructions = resp;
                    resp.forEach(construction => this.fetchConstructionCosts(construction));
                    this.filterDisplayedConstructions();
                });
            this.subscriptions.push(sub);

            sub = this.planetApi.isConstructionPossibleOnPlanet(idPlanet)
                .subscribe(resp => this.constructionPossible = resp);
            this.subscriptions.push(sub);

            sub = this.resourceApi.getResourceDeposit(idPlanet)
                .subscribe(resp => {
                    this.resourceDeposit = resp;
                    resp.humanResources.forEach(hr => this.sumOfPops += hr.amount);
                });
            this.subscriptions.push(sub);
            sub = this.resourceApi.getResourceUtilization(this.selectedPlanetInput!.idPlanet).subscribe(utilization => {
                utilization.humanResources.forEach(hr => this.sumOfPops += hr.amount);
            });
            this.subscriptions.push(sub);

            sub = this.resourceApi.getPlanetaryIncome(idPlanet)
                .subscribe(resp => {
                    this.income = resp;
                });
            this.subscriptions.push(sub);
            sub = this.resourceApi.getPlanetaryCapacity(idPlanet)
                .subscribe(resp => {
                    this.capacity = resp;
                });
            this.subscriptions.push(sub);
        }
    }

    checkIfTooExpensive(construction: Construction): boolean {
        if (!this.ignoreExpensiveConstructions) {
            return false;
        }
        let key = this.getConstructionKey(construction);
        if (!this.resourceDeposit || !this.knownCosts.has(key)) {
            return true;
        }
        const costs = this.knownCosts.get(key)!;
        return !ResourceHelper.canPayTheCollectableBill(costs, this.resourceDeposit);
    }

    getCosts(construction: Construction): ResourceDeposit | undefined {
        let key = this.getConstructionKey(construction);
        return this.knownCosts.get(key);
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
        let key = this.getConstructionKey(construction);
        this.activeConstructionKey = key;
        let costs: ResourceDeposit | undefined = this.knownCosts.get(key)
        if (!costs) {
            this.fetchConstructionCosts(construction);
        }
        this.costsToDisplay = costs;
    }

    private fetchConstructionCosts(construction: Construction) {
        let key = this.getConstructionKey(construction);
        let c: PlannedConstruction = {
            idBuilding: construction.building.idBuilding,
            targetLevel: construction.level + 1
        }
        let sub = this.resourceApi.getBuildingCosts(c)
            .subscribe(resp => {
                this.knownCosts.set(key, resp);
            });
        this.subscriptions.push(sub);
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
    getLink(input: Construction | EResourceType | EEducationType): string {
        if ('idConstruction' in input) {
            let folder = input.building.productionTarget.folder;
            let iconName = input.building.productionTarget.iconName;
            return "assets/" + folder + "/png24x/" + iconName + "_c.png";
        }
        let folder = input.folder;
        let iconName = input.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }

    getInvisibility(construction: Construction) {
        return this.currentlyOpenedItemIndex === construction ? 'invisible' : '';
    }
}
