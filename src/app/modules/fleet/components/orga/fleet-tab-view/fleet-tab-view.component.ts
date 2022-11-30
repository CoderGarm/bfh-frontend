import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EnumValueDto, Fleet, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-fleet-tab-view',
    templateUrl: './fleet-tab-view.component.html',
    styleUrls: ['./fleet-tab-view.component.scss']
})
export class FleetTabViewComponent extends SubscriptionManager implements OnInit, OnChanges {

    /**
     * the user selected fleet
     */
    @Input()
    fleet?: Fleet;

    utilization?: ResourceDeposit;

    constructor(private resourceApi: ResourcesApiService) {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.fetchCosts();
    }

    fetchCosts() {
        if (!this.fleet) {
            this.utilization = undefined;
            return;
        }
        let sub = this.resourceApi.getCostsForFleet(this.fleet!.idFleet!).subscribe(resp => {
            resp.subType.typeName = EnumValueDto.EDepositTypeEnum.UTILIZATION
            this.utilization = resp;
        });
        this.subscriptions.push(sub);
    }
}
