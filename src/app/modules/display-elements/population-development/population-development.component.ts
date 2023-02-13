import {Component, Input, OnInit} from '@angular/core';
import {TypeService} from "../../../services/type.service";
import {SubscriptionManager} from "../../../subscription.manager";
import {EEducationType, EResourceType, HumanResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {StaticResourcesService} from "../../../services/static-resources.service";

@Component({
    selector: 'app-population-development',
    templateUrl: './population-development.component.html',
    styleUrls: ['./population-development.component.scss']
})
export class PopulationDevelopmentComponent extends SubscriptionManager implements OnInit {

    @Input()
    workforceOnly: boolean = false;

    @Input()
    militaryOnly: boolean = false;

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

    getBase(): ResourceDeposit | undefined {
        if (!!this.utilization) {
            return this.utilization;
        }
        if (!!this.deposit) {
            return this.deposit;
        }
        if (!!this.demand) {
            return this.demand;
        }
        if (!!this.income) {
            return this.income;
        }
        return undefined;
    }

    isDisplayingPossible() {
        return !!this.getBase();
    }

    isPresent(resourceDeposit: ResourceDeposit | undefined) {
        return !!resourceDeposit;
    }

    getIcon(deposit: ResourceDeposit) {
        return StaticResourcesService.getMatIconForDepositType(deposit.subType);
    }

    getDisplayableResources(): HumanResourceAmount[] {
        const base = this.getBase();
        const result: HumanResourceAmount[] = [];
        if (!!base) {
            base.humanResources.forEach(dto => {
                if (this.militaryOnly) {
                    if (StaticResourcesService.isMilitary(dto.resourceType)) {
                        result.push(dto);
                    }
                } else if (this.workforceOnly) {
                    if (dto.resourceType.isWorkforce) {
                        result.push(dto);
                    }
                } else {
                    result.push(dto);
                }
            });
        }
        return result;
    }
}
