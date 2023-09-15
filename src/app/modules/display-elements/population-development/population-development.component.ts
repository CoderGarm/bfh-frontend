import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TypeService} from "../../../services/type.service";
import {SubscriptionManager} from "../../../subscription.manager";
import {EEducationType, EnumValueDto, EResourceType, HumanResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {StaticResourcesService} from "../../../services/static-resources.service";
import {ResourceHelper} from "../../../services/helper/resource.helper";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

@Component({
    selector: 'app-population-development',
    templateUrl: './population-development.component.html',
    styleUrls: ['./population-development.component.scss']
})
export class PopulationDevelopmentComponent extends SubscriptionManager implements OnChanges {

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

    @Input()
    sumOfPops: number = 0;

    @Input()
    capacitySum: number = 0;

    popType: EResourceType = ResourceHelper.getResourceType(EResourceTypeEnum.POPULATION);

    constructor(private typeService: TypeService) {
        super();

        this.resourceTypes = this.typeService.eResourceTypes;
        this.educationTypes = this.typeService.educationTypes;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!!this.capacity) {
            this.capacitySum = this.capacity.resources.filter(r => r.resourceType.typeName === this.popType.typeName)[0].amount;
        }
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

    getSum(resource?: ResourceDeposit) {
        if (!resource) {
            return 0;
        }
        return resource.humanResources.map(c => c.amount).reduce((sum, current) => sum + current, 0);
    }
}
