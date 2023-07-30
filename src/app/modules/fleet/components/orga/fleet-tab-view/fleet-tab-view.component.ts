import {AfterViewInit, Component} from '@angular/core';
import {AbstractId, EnumValueDto, Fleet, FleetApiService, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import EModuleTypesEnum = EnumValueDto.EModuleTypesEnum;

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
                private fleetService: FleetApiService,
                private fleetEventService: FleetEventService) {
        super();
    }

    ngAfterViewInit() {
        let sub = this.fleetEventService.getSelectedFleetEmitter().subscribe(fleet => this.fetchCosts(fleet));
        this.subscriptions.push(sub);
    }

    fetchCosts(fleet?: AbstractId) {
        if (!fleet) {
            this.utilization = undefined;
            this.fleet = undefined;
            return;
        }
        let sub = this.fleetService.getFleet(fleet.id).subscribe(resp => {
            // todo display-suppression for propulsion stuff is done somewhere else in the same way - a pretty uglified solution
            let capabilityValues = resp.spacecraftCapabilities.capabilities.filter(cap => !cap.moduleType.typeName.includes(EModuleTypesEnum.PROPULSION));
            resp.spacecraftCapabilities = {
                capabilities: capabilityValues
            }
            capabilityValues = resp.baseSpacecraftCapabilities.capabilities.filter(cap => !cap.moduleType.typeName.includes(EModuleTypesEnum.PROPULSION));
            resp.baseSpacecraftCapabilities = {
                capabilities: capabilityValues
            }
            this.fleet = resp;
        });
        this.subscriptions.push(sub);
        sub = this.resourceApi.getCostsForFleet(fleet.id).subscribe(resp => {
            resp.subType.typeName = EnumValueDto.EDepositTypeEnum.UTILIZATION
            this.utilization = resp;
        });
        this.subscriptions.push(sub);
    }
}
