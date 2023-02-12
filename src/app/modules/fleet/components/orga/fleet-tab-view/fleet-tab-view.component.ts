import {AfterViewInit, Component} from '@angular/core';
import {EnumValueDto, Fleet, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {FleetEventService} from "../../../../../services/fleet-event.service";

@Component({
    selector: 'app-fleet-tab-view',
    templateUrl: './fleet-tab-view.component.html',
    styleUrls: ['./fleet-tab-view.component.scss']
})
export class FleetTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'fleet';

    fleet?: Fleet;

    utilization?: ResourceDeposit;

    constructor(private resourceApi: ResourcesApiService,
                private fleetEventService: FleetEventService) {
        super();
    }

    ngAfterViewInit() {
        let sub = this.fleetEventService.getSelectedFleetEmitter().subscribe(fleet => this.fetchCosts(fleet));
        this.subscriptions.push(sub);
    }

    fetchCosts(fleet?: Fleet) {
        this.fleet = fleet;
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
