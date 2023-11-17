import {Component, Input} from '@angular/core';
import {EDepositType, EEducationType, EnumValueDto, EResourceType, HumanResourceAmount, ResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {TranslateService} from "@ngx-translate/core";
import {TypeService} from "../../../services/type.service";
import {StaticResourcesService} from "../../../services/static-resources.service";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import CollectableTypeEnum = EResourceType.CollectableTypeEnum;
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;
import EEducationTypeEnum = EnumValueDto.EEducationTypeEnum;

@Component({
    selector: 'app-resource-display',
    templateUrl: './resource-display.component.html',
    styleUrls: ['./resource-display.component.scss']
})
export class ResourceDisplayComponent extends SubscriptionManager {

    @Input()
    deposit?: ResourceDeposit;

    @Input()
    costs?: ResourceDeposit;

    @Input()
    income?: ResourceDeposit;

    @Input()
    capacity?: ResourceDeposit;

    @Input()
    sumOfPops: number = Number.MAX_VALUE;

    @Input()
    levelImprovementResources?: ResourceAmount;

    @Input()
    levelImprovementHumanResources?: HumanResourceAmount;

    @Input()
    showTick: boolean = true;

    // @formatter:off
    @Input()
    get onlyResources() { return this._onlyResources; }
    set onlyResources(value: any) { this._onlyResources = coerceBooleanProperty(value); }
    _onlyResources: boolean = false;

    @Input()
    get onlyCollectables() { return this._onlyCollectables; }
    set onlyCollectables(value: any) { this._onlyCollectables = coerceBooleanProperty(value); }
    _onlyCollectables: boolean = false;

    @Input()
    get shipyardMode() { return this._shipyardMode; }
    set shipyardMode(value: any) { this._shipyardMode = coerceBooleanProperty(value); }
    _shipyardMode: boolean = false;

    @Input()
    get constructionMode() { return this._constructionMode; }
    set constructionMode(value: any) { this._constructionMode = coerceBooleanProperty(value); }
    _constructionMode: boolean = false;
    // @formatter:on

    resourceTypes: EResourceType[] = [];
    educationTypes: EEducationType[] = [];

    translations: Map<string, string> = new Map<string, string>();

    private readonly depositPopulation: string = 'resource-overlay.deposit.population';
    private readonly incomePopulation: string = 'resource-overlay.income.population';
    private readonly costsPopulation: string = 'resource-overlay.costs.population';
    private readonly capacityPopulationKey: string = 'resource-overlay.capacity.info.population';
    private readonly capacityPopulationWarningKey: string = 'resource-overlay.capacity.info.population-growth-warning';
    private readonly capacityResourceKey: string = 'resource-overlay.capacity.info.resource';

    constructor(private typeService: TypeService,
                public translate: TranslateService) {
        super();

        let sub = this.typeService.educationTypes.subscribe(d => this.educationTypes = d);
        this.subscriptions.push(sub);

        sub = this.typeService.eResourceTypes.subscribe(d => this.resourceTypes = d);
        this.subscriptions.push(sub);

        this.translations.set(this.incomePopulation, this.incomePopulation);
        sub = this.translate.get('resource-overlay.income.population').subscribe((translated: string) => {
            this.translations.set(this.incomePopulation, translated);
        });
        this.subscriptions.push(sub);

        this.translations.set(this.costsPopulation, this.costsPopulation);
        sub = this.translate.get('resource-overlay.costs.population').subscribe((translated: string) => {
            this.translations.set(this.costsPopulation, translated);
        });
        this.subscriptions.push(sub);

        this.translations.set(this.depositPopulation, this.depositPopulation);
        sub = this.translate.get('resource-overlay.deposit.population').subscribe((translated: string) => {
            this.translations.set(this.depositPopulation, translated);
        });
        this.subscriptions.push(sub);

        this.translations.set(this.capacityPopulationKey, this.capacityPopulationKey);
        sub = this.translate.get('resource-overlay.capacity.info.population').subscribe((translated: string) => {
            this.translations.set(this.capacityPopulationKey, translated);
        });
        this.subscriptions.push(sub);

        this.translations.set(this.capacityPopulationWarningKey, this.capacityPopulationWarningKey);
        sub = this.translate.get('resource-overlay.capacity.info.population-growth-warning').subscribe((translated: string) => {
            this.translations.set(this.capacityPopulationWarningKey, translated);
        });
        this.subscriptions.push(sub);

        this.translations.set(this.capacityResourceKey, this.capacityResourceKey);
        sub = this.translate.get('resource-overlay.capacity.info.resource').subscribe((translated: string) => {
            this.translations.set(this.capacityResourceKey, translated);
        });
        this.subscriptions.push(sub);
    }

    getTooltip(type: EDepositType, resourceType: EResourceType) {
        let key = 'resource-overlay.' + type.typeName.toLowerCase() + "." + resourceType.typeName.toLowerCase();
        let translation = this.translations.get(key);
        if (!translation) {
            return "";
        }
        return translation;
    }

    getResourceAmount(resource: EResourceType, deposit?: ResourceDeposit): number {
        if (!deposit) {
            return 0;
        }
        let resources: ResourceAmount[] | undefined = deposit.resources
            .filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return 0;
        }
        return resources[0].amount;
    }

    getResourceImprovement(resource: EResourceType): number {
        if (!!this.levelImprovementResources && this.levelImprovementResources.resourceType.typeName === resource.typeName) {
            return this.levelImprovementResources.amount;
        }
        return 0;
    }

    getHumans(resource: EEducationType, costs?: ResourceDeposit): number {
        if (!costs) {
            return 0;
        }
        let resources: HumanResourceAmount[] | undefined = costs.humanResources
            .filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return 0;
        }
        return resources[0].amount;
    }

    getHumanImprovement(resource: EEducationType): number {
        if (!!this.levelImprovementHumanResources && this.levelImprovementHumanResources.resourceType.typeName === resource.typeName) {
            return this.levelImprovementHumanResources.amount;
        }
        return 0;
    }

    getTicksNeeded() {
        if (!!this.costs && !!this.income) {
            return this.getTickCosts();
        }
        return "";
    }

    private getTickCosts() {
        let ticksNeeded = 0;
        this.costs?.resources.forEach(c => {
            if (c.resourceType.collectableType == CollectableTypeEnum.FORFEITABLE) {
                this.income?.resources.forEach(i => {
                    if (i.resourceType.typeName === c.resourceType.typeName) {

                        let income = i.amount;
                        let cost = c.amount;
                        let availablePoints = 0;
                        const fromDeposit = this.deposit?.resources.filter(ra => ra.resourceType.typeName === c.resourceType.typeName);
                        if (!!fromDeposit && fromDeposit.length == 1) {
                            availablePoints = fromDeposit[0].amount;
                        }

                        let ticks = 0;
                        if (cost > availablePoints) {
                            ticks = Math.ceil((cost - availablePoints) / income);
                        }
                        if (ticksNeeded < ticks) {
                            ticksNeeded = ticks;
                        }
                    }
                });
            }
        });
        if (ticksNeeded == Number.POSITIVE_INFINITY) {
            throw new Error("Yeah, you probably want to build something without a facility. Good luck.");
        }
        return ticksNeeded;
    }

    getBase(): ResourceDeposit | undefined {
        let result: ResourceDeposit | undefined = undefined;
        if (!!this.deposit) {
            result = this.deposit;
        } else if (!!this.costs) {
            result = this.costs;
        } else if (!!this.income) {
            result = this.income;
        }
        if (!!result && this._onlyCollectables) {
            result.resources = result.resources.filter(c => c.resourceType.collectableType == CollectableTypeEnum.COLLECTABLE);
        }
        if (!!result && this._shipyardMode) {
            result.resources = result.resources
                .filter(c => c.resourceType.collectableType == CollectableTypeEnum.COLLECTABLE || c.resourceType.typeName === EResourceTypeEnum.ORBITAL_CONSTRUCTION);
            result.humanResources = result.humanResources
                .filter(c => c.resourceType.typeName === EEducationTypeEnum.ENLISTED || c.resourceType.typeName === EEducationTypeEnum.OFFICER);
        }
        if (!!result && this._constructionMode) {
            result.resources = result.resources
                .filter(c => c.resourceType.collectableType == CollectableTypeEnum.COLLECTABLE || c.resourceType.typeName === EResourceTypeEnum.ORBITAL_CONSTRUCTION);
            result.humanResources = result.humanResources
                .filter(c => c.resourceType.typeName === EEducationTypeEnum.COLLEGE || c.resourceType.typeName === EEducationTypeEnum.UNIVERSITY);
        }
        return result;
    }

    isDisplayingPossible() {
        return !!this.getBase();
    }

    getOpeningBracketClass(resource: ResourceAmount) {
        const presentResources = this.getBase()?.resources.length;
        if (!presentResources || presentResources < this.resourceTypes.length) {
            return '';
        }
        let isMatching = resource.resourceType.typeName === 'POPULATION';
        return isMatching ? 'open-bracket' : '';
    }

    getClosingBracketClass(resource: HumanResourceAmount) {
        const presentResources = this.getBase()?.humanResources.length;
        if (!presentResources || presentResources < this.educationTypes.length) {
            return '';
        }
        let isMatching = resource.resourceType.typeName === 'OFFICER';
        return isMatching ? 'close-bracket' : '';
    }

    isCapPresent(resource: ResourceAmount): boolean {
        if (!this.capacity) {
            return false;
        }
        const resourceAmount = this.getResourceAmount(resource.resourceType, this.capacity);
        return !!resourceAmount;
    }

    getCapacityTooltip(resource: ResourceAmount) {
        let key = this.capacityResourceKey;
        if (resource.resourceType.typeName === 'POPULATION') {
            key = this.capacityPopulationKey;
        }
        let translation = this.translations.get(key);
        if (!translation) {
            return "";
        }

        const capacityAmount = this.getResourceAmount(resource.resourceType, this.capacity);
        const resourceName = resource.resourceType.typeName.toLocaleLowerCase(this.translate.getLangs());

        let lastingTicks = this.calculateLastingCapacityTicks(resource);
        if (this.isPopulationGrowthWarning(lastingTicks)) {
            translation = this.translations.get(this.capacityPopulationWarningKey);
        } else {
            translation = translation.replace("AMOUNT", capacityAmount + "");
            translation = translation.replace("RESOURCE_NAME", resourceName);
            translation = translation.replace("TICKS", (lastingTicks === Number.MAX_VALUE ? 999 : lastingTicks) + "");
        }

        return translation;
    }

    private isPopulationGrowthWarning(lastingTicks: number) {
        return lastingTicks === 0;
    }

    private calculateLastingCapacityTicks(resource: ResourceAmount) {
        const incoming = this.getResourceAmount(resource.resourceType, this.income);
        if (incoming != 0 && !incoming) {
            throw new Error("There should be an incoming if requested.");
        }
        if (incoming === 0) {
            return Number.MAX_VALUE;
        }
        const current = this.sumOfPops;
        const capacity = this.getResourceAmount(resource.resourceType, this.capacity);
        if ((capacity != 0 && !capacity) || (current != 0 && !current)) {
            throw new Error("There should be a capacity or a current if requested.");
        }
        const result = Math.round((capacity - current) / incoming);
        return result >= 0 ? result : 0;
    }

    getCapacityWarningClass(resource: ResourceAmount) {
        const lastingTicks = this.calculateLastingCapacityTicks(resource);
        if (lastingTicks <= 5) {
            return 'uprising';
        }
        if (lastingTicks <= 10) {
            return 'warning';
        }
        return 'fine';
    }

    getIcon(deposit: ResourceDeposit) {
        return StaticResourcesService.getMatIconForDepositType(deposit.subType);
    }
}
