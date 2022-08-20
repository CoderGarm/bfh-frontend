import {AfterViewInit, Component, Inject, Input, Optional} from '@angular/core';
import {EEducationType, EResourceType, HumanResourceAmount, ResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";
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

    constructor(@Optional() @Inject('resourceDeposit') resourceDeposit: ResourceDeposit | undefined,
                @Optional() @Inject('costs') costs: ResourceDeposit | undefined,
                @Optional() @Inject('income') income: ResourceDeposit | undefined) {
        super();
        this.resourceDeposit = resourceDeposit;
        this.costs = costs;
        this.income = income;
    }

    ngAfterViewInit(): void {
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

    getResourceAsString(resource: EResourceType, costs?: ResourceDeposit): string {
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

    getHRCostsAsString(resource: EEducationType, costs?: ResourceDeposit): string {
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

        return (length - 1) == indexOf ? 'open-bracket' : '';
    }

    getClosingBracketClass(resource: HumanResourceAmount) {
        let base = this.getBase();
        let length = base.humanResources.length;
        let indexOf = base.humanResources.indexOf(resource);

        return (length - 1) == indexOf ? 'close-bracket' : '';
    }

    getUnderlineClass(resource: ResourceAmount) {
        let base = this.getBase();
        let length = base.resources.length;
        let indexOf = base.resources.indexOf(resource);

        return (length - 1) == indexOf ? 'underline' : '';
    }
}
