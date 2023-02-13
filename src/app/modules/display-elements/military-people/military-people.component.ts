import {Component, Input, OnInit} from '@angular/core';
import {EEducationType, HumanResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {TypeService} from "../../../services/type.service";
import {StaticResourcesService} from "../../../services/static-resources.service";
import {SubscriptionManager} from "../../../subscription.manager";

@Component({
    selector: 'app-military-people',
    templateUrl: './military-people.component.html',
    styleUrls: ['./military-people.component.scss']
})
export class MilitaryPeopleComponent extends SubscriptionManager implements OnInit {

    @Input()
    utilization?: ResourceDeposit;

    educationTypes: EEducationType[];

    constructor(private typeService: TypeService) {
        super();

        this.educationTypes = typeService.militaryEducationTypes;
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
                if (StaticResourcesService.isMilitary(dto.resourceType)) {
                    result.push(dto);
                }
            });
        }
        return result;
    }
}
