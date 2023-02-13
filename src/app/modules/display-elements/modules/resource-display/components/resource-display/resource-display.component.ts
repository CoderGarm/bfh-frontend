import {AfterViewInit, Component, Input} from '@angular/core';
import {EDepositType, EEducationType, EResourceType, HumanResourceAmount, ResourceAmount, ResourceDeposit} from "../../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../../subscription.manager";
import {TranslateService} from "@ngx-translate/core";
import {ResourceEmitterService} from "../../../../../../services/resource-emitter.service";
import {TypeService} from "../../../../../../services/type.service";
import {StaticResourcesService} from "../../../../../../services/static-resources.service";
import CollectableTypeEnum = EResourceType.CollectableTypeEnum;

@Component({
    selector: 'app-resource-display',
    templateUrl: './resource-display.component.html',
    styleUrls: ['./resource-display.component.scss']
})
export class ResourceDisplayComponent extends SubscriptionManager implements AfterViewInit {

    @Input()
    deposit?: ResourceDeposit;

    @Input()
    costs?: ResourceDeposit;

    @Input()
    income?: ResourceDeposit;

    @Input()
    capacity?: ResourceDeposit;

    @Input()
    levelImprovementResources?: ResourceAmount;

    @Input()
    levelImprovementHumanResources?: HumanResourceAmount;

    @Input()
    showTick: boolean = true;

    resourceTypes: EResourceType[];
    educationTypes: EEducationType[];

    translations: Map<string, string> = new Map<string, string>();

    private readonly depositPopulation = 'resource-overlay.deposit.population';
    private readonly incomePopulation = 'resource-overlay.income.population';
    private readonly costsPopulation = 'resource-overlay.costs.population';
    private readonly capacityPopulationKey = 'resource-overlay.capacity.info.population';
    private readonly capacityResourceKey = 'resource-overlay.capacity.info.resource';


    constructor(private resourceDisplay: ResourceEmitterService,
                private typeService: TypeService,
                public translate: TranslateService) {
        super();

        this.resourceTypes = typeService.eResourceTypes;
        this.educationTypes = typeService.educationTypes;

        let sub = this.resourceDisplay.deposit.subscribe(resp => this.deposit = resp);
        this.subscriptions.push(sub);

        sub = this.resourceDisplay.costs.subscribe(resp => this.costs = resp);
        this.subscriptions.push(sub);

        sub = this.resourceDisplay.income.subscribe(resp => this.income = resp);
        this.subscriptions.push(sub);

        sub = this.resourceDisplay.capacity.subscribe(resp => this.capacity = resp);
        this.subscriptions.push(sub);

        sub = this.resourceDisplay.levelImprovementResources.subscribe(resp => this.levelImprovementResources = resp);
        this.subscriptions.push(sub);

        sub = this.resourceDisplay.levelImprovementHumanResources.subscribe(resp => this.levelImprovementHumanResources = resp);
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

        this.translations.set(this.capacityResourceKey, this.capacityResourceKey);
        sub = this.translate.get('resource-overlay.capacity.info.resource').subscribe((translated: string) => {
            this.translations.set(this.capacityResourceKey, translated);
        });
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
    }


    getTooltip(type: EDepositType, resourceType: EResourceType) {
        let key = 'resource-overlay.' + type.typeName.toLowerCase() + "." + resourceType.typeName.toLowerCase();
        let translation = this.translations.get(key);
        if (!translation) {
            return "";
        }
        return translation;
    }

    getLink(cap: ResourceAmount | HumanResourceAmount): string {
        let folder = cap.resourceType.folder;
        let iconName = cap.resourceType.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
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
            let incoming = this.getResourceAmount(resource, this.income);
            if (!incoming) {
                incoming = 0;
            }
            return (this.levelImprovementResources.amount - incoming);
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
            let incoming = this.getHumans(resource, this.income);
            if (!incoming) {
                incoming = 0;
            }
            return (this.levelImprovementHumanResources.amount - incoming);
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
                        let ticks = Math.ceil(cost / income);
                        if (ticksNeeded < ticks) {
                            ticksNeeded = ticks;
                        }
                    }
                });
            }
        });
        if (ticksNeeded == Number.POSITIVE_INFINITY) {
            console.log("Yeah, you probably want to build something without a facility. Good luck.");
        }
        return ticksNeeded;
    }

    getBase(): ResourceDeposit | undefined {
        if (!!this.deposit) {
            return this.deposit;
        }
        if (!!this.costs) {
            return this.costs;
        }
        if (!!this.income) {
            return this.income;
        }
        return undefined;
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
        if (lastingTicks === Number.MAX_VALUE) {
            lastingTicks = 99;
        }

        translation = translation.replace("AMOUNT", capacityAmount + "");
        translation = translation.replace("RESOURCE_NAME", resourceName);
        translation = translation.replace("TICKS", lastingTicks + "");

        return translation;
    }

    private calculateLastingCapacityTicks(resource: ResourceAmount) {
        const incoming = this.getResourceAmount(resource.resourceType, this.income);
        if (incoming != 0 && !incoming) {
            throw new Error("There should be an incoming if requested.");
        }
        if (incoming === 0) {
            return Number.MAX_VALUE;
        }
        const current = this.getResourceAmount(resource.resourceType, this.deposit);
        const capacity = this.getResourceAmount(resource.resourceType, this.capacity);
        if ((capacity != 0 && !capacity) || (current != 0 && !current)) {
            throw new Error("There should be a capacity or a current if requested.");
        }
        return Math.round((capacity - current) / incoming);
    }

    getCapacityWarningClass(resource: ResourceAmount) {
        const lastingTicks = this.calculateLastingCapacityTicks(resource);
        if (lastingTicks <= 3) {
            return 'uprising';
        }
        if (lastingTicks <= 5) {
            return 'warning';
        }
        return 'fine';
    }

    getIcon(deposit: ResourceDeposit) {
        return StaticResourcesService.getMatIconForDepositType(deposit.subType);
    }
}
