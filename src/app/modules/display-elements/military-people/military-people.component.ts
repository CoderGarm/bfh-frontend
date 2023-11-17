import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EEducationType, HumanResourceAmount, ResourceDeposit} from "../../../services/swagger";
import {TypeService} from "../../../services/type.service";
import {StaticResourcesService} from "../../../services/static-resources.service";
import {SubscriptionManager} from "../../../subscription.manager";

@Component({
    selector: 'app-military-people',
    templateUrl: './military-people.component.html',
    styleUrls: ['./military-people.component.scss']
})
export class MilitaryPeopleComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    utilization: ResourceDeposit | undefined | null;

    displayableResources: HumanResourceAmount[] = [];

    // @formatter:off
    @Input()
    get preSelect() { return this._preSelect; }
    set preSelect(value: any) { this._preSelect = this.coerceBooleanProperty(value); }
    _preSelect: boolean = false;
    // @formatter:on

    educationTypes: EEducationType[] = [];

    constructor(private typeService: TypeService) {
        super();

        let sub = this.typeService.militaryEducationTypes.subscribe(d => this.educationTypes = d);
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setDisplayableResources();
    }

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    getHumans(resource: EEducationType, costs: ResourceDeposit | undefined | null): number {
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
        return this._preSelect || !!this.getBase();
    }

    isPresent(resourceDeposit: ResourceDeposit | undefined) {
        return !!resourceDeposit;
    }

    getIcon(deposit: ResourceDeposit) {
        return StaticResourcesService.getMatIconForDepositType(deposit.subType);
    }

    private setDisplayableResources() {
        const base = this.getBase();
        const result: HumanResourceAmount[] = [];
        if (!!base) {
            base.humanResources.forEach(dto => {
                if (StaticResourcesService.isMilitary(dto.resourceType)) {
                    result.push(dto);
                }
            });
        } else if (this._preSelect) {
            this.educationTypes.forEach(dto => result.push({resourceType: dto, amount: 0}));
        }
        this.displayableResources = result;
    }
}
