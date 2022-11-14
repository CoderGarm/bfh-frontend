import {Component, Input, OnInit} from '@angular/core';
import {TypeService} from "../../../services/type.service";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {EEducationType, EResourceType, HumanResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {StaticResourcesService} from "../../../StaticResourcesService";

@Component({
    selector: 'app-population-development',
    templateUrl: './population-development.component.html',
    styleUrls: ['./population-development.component.scss']
})
export class PopulationDevelopmentComponent extends SubscriptionManager implements OnInit {

    @Input()
    utilization?: ResourceDeposit;

    @Input()
    deposit?: ResourceDeposit;

    @Input()
    demand?: ResourceDeposit;

    @Input()
    income?: ResourceDeposit;

    @Input()
    capacity?: ResourceDeposit;

    resourceTypes: EResourceType[];
    educationTypes: EEducationType[];

    constructor(private typeService: TypeService) {
        super();

        this.resourceTypes = typeService.eResourceTypes;
        this.educationTypes = typeService.educationTypes;
    }

    ngOnInit(): void {
    }

    getLink(cap: HumanResourceAmount): string {
        let folder = cap.resourceType.folder;
        let iconName = cap.resourceType.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
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

    isDisplayingPossible() {
        return !!this.utilization && !!this.deposit && !!this.demand && !!this.income;
    }

    getIcon(deposit: ResourceDeposit) {
        return StaticResourcesService.getMatIconForDepositType(deposit.subType);
    }
}
