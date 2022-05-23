import {AfterViewInit, Component, Inject, Input, Optional} from '@angular/core';
import {EEducationType, EResourceType, HumanResourceAmount, ResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";

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

    constructor(@Optional() @Inject('resourceDeposit') resourceDeposit: ResourceDeposit | undefined,
                @Optional() @Inject('costs') costs: ResourceDeposit | undefined) {
        super();
        this.resourceDeposit = resourceDeposit;
        this.costs = costs;
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
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }

    getReducerStringForResources(resource: EResourceType): string {
        if (!this.costs) {
            return "";
        }
        let resources: ResourceAmount[] | undefined = this.costs.resources.filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return "";
        }
        let multiplier = this.costs.subType.calculationType.multiplier;
        let result;
        if (multiplier > 0) {
            result = "+";
        } else {
            result = "-";
        }
        return result + " " + resources[0].amount;
    }

    getReducerStringForHumans(resource: EEducationType): string {
        if (!this.costs) {
            return "";
        }
        let resources: HumanResourceAmount[] | undefined = this.costs.humanResources.filter(r => r.resourceType.typeName == resource.typeName);
        if (resources.length != 1) {
            return "";
        }
        let multiplier = this.costs.subType.calculationType.multiplier;
        let result;
        if (multiplier > 0) {
            result = "+";
        } else {
            result = "-";
        }
        return result + " " + resources[0].amount;
    }
}
