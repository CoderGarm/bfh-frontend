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
    levelImprovementResources?: ResourceAmount;

    @Input()
    levelImprovementHumanResources?: HumanResourceAmount;

    translations: Map<string, string> = new Map<string, string>();

    private readonly depositPopulation = 'resource-overlay.deposit.population';
    private readonly incomePopulation = 'resource-overlay.income.population';
    private readonly costsPopulation = 'resource-overlay.costs.population';

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
        this.translate.get('resource-overlay.income.population').subscribe((translated: string) => {
            this.translations.set(this.incomePopulation, translated);
        });
        this.translations.set(this.costsPopulation, this.costsPopulation);
        this.translate.get('resource-overlay.costs.population').subscribe((translated: string) => {
            this.translations.set(this.costsPopulation, translated);
        });
        this.translations.set(this.depositPopulation, this.depositPopulation);
        this.translate.get('resource-overlay.deposit.population').subscribe((translated: string) => {
            this.translations.set(this.depositPopulation, translated);
        });
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

    getResource(resource: EResourceType, costs?: ResourceDeposit): string {
        if (!costs) {
            return "";
        }
        let resources: ResourceAmount[] | undefined = costs.resources
            .filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return "";
        }
        return "" + resources[0].amount;
    }

    getResourceImprovement(resource: EResourceType): string {
        let perNextLevelIncome = "";
        if (!!this.levelImprovementResources && this.levelImprovementResources.resourceType.typeName === resource.typeName) {
            perNextLevelIncome = " " + this.levelImprovementResources.amount;
        }
        return perNextLevelIncome;
    }

    getHumans(resource: EEducationType, costs?: ResourceDeposit): string {
        if (!costs) {
            return "";
        }
        let resources: HumanResourceAmount[] | undefined = costs.humanResources
            .filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return "";
        }
        return "" + resources[0].amount;
    }

    getHumanResourceImprovement(resource: EEducationType): string {
        let perNextLevelIncome = "";
        if (!!this.levelImprovementHumanResources && this.levelImprovementHumanResources.resourceType.typeName === resource.typeName) {
            perNextLevelIncome = " " + this.levelImprovementHumanResources.amount;
        }
        return perNextLevelIncome;
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
        return !!this.resourceDeposit || !!this.costs || !!this.income;
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
}
