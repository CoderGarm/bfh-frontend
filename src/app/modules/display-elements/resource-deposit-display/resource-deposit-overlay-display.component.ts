import {AfterViewInit, Component, Inject, Input, Optional} from '@angular/core';
import {EDepositType, EEducationType, EResourceType, HumanResourceAmount, ResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {TranslateService} from "@ngx-translate/core";
import CollectableTypeEnum = EResourceType.CollectableTypeEnum;

@Component({
    selector: 'app-resource-deposit-overlay-display',
    templateUrl: './resource-deposit-overlay-display.component.html',
    styleUrls: ['./resource-deposit-overlay-display.component.scss']
})
export class ResourceDepositOverlayDisplayComponent extends SubscriptionManager implements AfterViewInit {

    @Input()
    resourceDeposit?: ResourceDeposit;

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

    translations: Map<string, string> = new Map<string, string>();

    private readonly depositPopulation = 'resource-overlay.deposit.population';
    private readonly incomePopulation = 'resource-overlay.income.population';
    private readonly costsPopulation = 'resource-overlay.costs.population';
    private readonly capacityPopulationKey = 'resource-overlay.capacity.info.population';
    private readonly capacityResourceKey = 'resource-overlay.capacity.info.resource';

    constructor(@Optional() @Inject('resourceDeposit') resourceDeposit: ResourceDeposit | undefined,
                @Optional() @Inject('costs') costs: ResourceDeposit | undefined,
                @Optional() @Inject('income') income: ResourceDeposit | undefined,
                @Optional() @Inject('levelImprovementResources') levelImprovementResources: ResourceAmount | undefined,
                @Optional() @Inject('levelImprovementHumanResources') levelImprovementHumanResources: HumanResourceAmount | undefined,
                public translate: TranslateService) {
        super();
        this.resourceDeposit = resourceDeposit;
        this.costs = costs;
        this.income = income;
        this.levelImprovementResources = levelImprovementResources;
        this.levelImprovementHumanResources = levelImprovementHumanResources;

        this.translations.set(this.incomePopulation, this.incomePopulation);
        let sub = this.translate.get('resource-overlay.income.population').subscribe((translated: string) => {
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

    /**
     * constructs and returns the url to the icon
     * @param cap
     */
    getLink(cap: ResourceAmount | HumanResourceAmount): string {
        let folder = cap.resourceType.folder;
        let iconName = cap.resourceType.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }

    getResourceAmount(resource: EResourceType, deposit?: ResourceDeposit): number | undefined {
        if (!deposit) {
            return undefined;
        }
        let resources: ResourceAmount[] | undefined = deposit.resources
            .filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return undefined;
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

    getHumans(resource: EEducationType, costs?: ResourceDeposit): number | undefined {
        if (!costs) {
            return undefined;
        }
        let resources: HumanResourceAmount[] | undefined = costs.humanResources
            .filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return undefined;
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

    getBase(): ResourceDeposit {
        let r: ResourceDeposit = {
            resources: [],
            humanResources: [],
            subType: {
                typeName: '',
                calculationType: {
                    typeName: '',
                    multiplier: 1
                }
            }
        };
        if (!!this.resourceDeposit) {
            r = this.resourceDeposit;
        }
        if (!!this.costs) {
            r = this.costs;
        }
        if (!!this.income) {
            r = this.income;
        }
        return r;
    }

    isDisplayingPossible() {
        return !!this.capacity || !!this.resourceDeposit || !!this.costs || !!this.income;
    }

    getOpeningBracketClass(resource: ResourceAmount) {
        let base = this.getBase();
        let length = base.resources.length;
        let indexOf = base.resources.indexOf(resource);

        let isLast = (length - 1) == indexOf;
        return isLast ? 'open-bracket' : '';
    }

    getClosingBracketClass(resource: HumanResourceAmount) {
        let base = this.getBase();
        let length = base.humanResources.length;
        let indexOf = base.humanResources.indexOf(resource);

        return (length - 1) == indexOf ? 'close-bracket' : '';
    }

    isCapPresent(resource: ResourceAmount) {
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

        const lastingTicks = this.calculateLastingCapacityTicks(resource);

        translation = translation.replace("AMOUNT", capacityAmount + "");
        translation = translation.replace("RESOURCE_NAME", resourceName);
        translation = translation.replace("TICKS", lastingTicks + "");

        return translation;
    }

    private calculateLastingCapacityTicks(resource: ResourceAmount) {
        const incoming = this.getResourceAmount(resource.resourceType, this.income);
        if (!incoming) {
            throw new Error("There should be an incoming if requested.");
        }
        const current = this.getResourceAmount(resource.resourceType, this.resourceDeposit);
        const capacity = this.getResourceAmount(resource.resourceType, this.capacity);
        if (!capacity || !current) {
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
}
