import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {
    Building,
    Construction,
    ConstructionApiService,
    EEducationType,
    ERefinementSequence,
    EResourceType,
    HumanResourceAmount,
    Job,
    JobApiService,
    MiningFactors,
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
    planet?: Planet;
    private planetDefinition = "planet";

    @Input()
    sumOfPops: number = 0;

    ignoreExpensiveConstructions: boolean = false;

    @Input()
    resourceDeposit?: ResourceDeposit;

    @Input()
    income?: ResourceDeposit;

    @Input()
    capacity?: ResourceDeposit;

    @Input()
    miningFactors?: MiningFactors;

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

    construction?: Construction;

    runningJobs: Job[] = [];

    constructor(private constructionApi: ConstructionApiService,
                private planetApi: PlanetApiService,
                private jobService: JobApiService,
                private resourceApi: ResourcesApiService,
                private typeService: TypeService,
                private notificationService: SnackbarNotificationService,
                private planetsNotificationService: PlanetsEventService,
                public translate: TranslateService) {
        super();

        let sub = planetsNotificationService.getConstructionStartsEmitter().subscribe(() => this.fetchPlanet());
        this.subscriptions.push(sub);

        this.translations.set('planetary.constructions.build.is-new', 'planetary.constructions.build.is-new');
        this.translate.get('planetary.constructions.build.is-new').subscribe((translated: string) => {
            this.translations.set('planetary.constructions.build.is-new', translated);
        });

        this.translations.set('planetary.constructions.build.has-level', 'planetary.constructions.build.has-level');
        this.translate.get('planetary.constructions.build.has-level').subscribe((translated: string) => {
            this.translations.set('planetary.constructions.build.has-level', translated);
        });

        this.eEducationTypes = this.typeService.educationTypes;
        this.eResourceTypes = this.typeService.eResourceTypes;
        this.eRefinementSequences = this.typeService.eRefinementSequences;
        this.eProductionCategories = this.typeService.eProductionCategories;
        this.eProductionCategoryFC.setValue(this.eProductionCategories);
        this.setResourceTypeFormControlData()
        this.setRefinementSequenceFormControlData()
    }

    ngAfterViewInit(): void {
        this.filterDisplayedConstructions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.planetDefinition]) {
            this.setConstruction(undefined);
            this.fetchPlanet();
        }
    }

    private setRefinementSequenceFormControlData() {
        let typeNames = this.eRefinementSequences.map(r => r.typeName);
        this.eRefinementSequenceFC.setValue(typeNames);
    }

    private setResourceTypeFormControlData() {
        let typeNames = this.eResourceTypes.map(r => r.typeName);
        this.eResourceTypeFC.setValue(typeNames);
    }

    private fetchPlanet() {
        if (!!this.planet) {
            const idPlanet = this.planet.idPlanet;
            let sub = this.constructionApi
                .getPossibleConstructionsByPlanet(idPlanet).subscribe(resp => {
                    this.possibleConstructions = resp;
                    resp.forEach(construction => this.fetchConstructionCosts(construction));
                    this.filterDisplayedConstructions();
                });
            this.subscriptions.push(sub);

            sub = this.planetApi.isConstructionPossibleOnPlanet(idPlanet)
                .subscribe(resp => {
                    this.constructionPossible = resp;
                    this.filterDisplayedConstructions();
                });
            this.subscriptions.push(sub);

            sub = this.jobService.getJobsOnPlanet(idPlanet)
                .subscribe(resp => {
                    this.runningJobs = resp;
                    this.filterDisplayedConstructions();
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

    getCosts(): ResourceDeposit | undefined {
        if (!this.construction) {
            return undefined;
        }
        let key = this.getConstructionKey(this.construction);
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
        }).sort((a, b) => a.building.name.replace(' ', '') < b.building.name.replace(' ', '') ? -1 : 1);

        if (this.filteredConstructions.length > 1) {
            const buildingUnderConstruction = this.runningJobs.filter(j => j.isBuildingJob).map(j => j.buildingTarget!);
            if (!!buildingUnderConstruction && buildingUnderConstruction.length == 1) {
                const underConstruction = this.possibleConstructions.filter(c => c.building.idBuilding === buildingUnderConstruction[0].idBuilding)[0];
                this.setConstruction(underConstruction);
            }
        }
        if (this.filteredConstructions.length === 0) {
            this.setConstruction(undefined);
        }
        if (this.filteredConstructions.length === 1) {
            this.setConstruction(this.filteredConstructions[0]);
        }
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
     * starts the construction of the building at the planet
     */
    startConstruction(construction: Construction) {
        let sub = this.planetApi.buildConstruction(this.planet!.idPlanet, construction!.building.idBuilding)
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

    showCosts() {
        this.setLevelImprovement()
        if (!this.construction) {
            this.costsToDisplay = undefined;
            return;
        }
        let key = this.getConstructionKey(this.construction);
        let costs: ResourceDeposit | undefined = this.knownCosts.get(key)
        if (!costs) {
            this.fetchConstructionCosts(this.construction);
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

    setLevelImprovement() {
        if (!this.construction) {
            this.levelImprovementResources = undefined;
            this.levelImprovementHumanResources = undefined;
            return;
        }

        let valueAtLevel = ResourceHelper.calculateNextOutput(this.construction);
        let productionTarget = this.construction.building.productionTarget;


        let productionCategory = this.construction.building.productionCategory;
        switch (productionCategory) {
            case ProductionCategoryEnum.CAPACITY:
                // do not display capacity because the value is shown by a tooltip
                break;
            case ProductionCategoryEnum.PRODUCE:
                this.levelImprovementHumanResources = undefined;
                const miningFactor = this.miningFactors?.resources
                    .filter(mf => mf.resourceType.typeName === productionTarget.typeName)[0]
                    .amount!;
                this.levelImprovementResources = {
                    resourceType: productionTarget,
                    amount: valueAtLevel * (miningFactor / 100)
                }
                break;
            case ProductionCategoryEnum.REFINEMENT:
                let refinementSequence = this.construction.building.refinementSequence;
                let product = refinementSequence!.product;
                this.levelImprovementResources = undefined;
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

    setConstruction(construction?: Construction) {
        this.construction = construction;
        this.showCosts();
    }
}
