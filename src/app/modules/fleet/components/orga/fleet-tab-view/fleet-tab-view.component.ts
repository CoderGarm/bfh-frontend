import {AfterViewInit, Component} from '@angular/core';
import {AbstractId, EnumValueDto, Fleet, FleetApiService, Planet, PlanetApiService, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import {FleetDetachmentComponent} from "../../payload/fleet-split/fleet-detachment.component";

@Component({
    selector: 'app-fleet-tab-view',
    templateUrl: './fleet-tab-view.component.html',
    styleUrls: ['./fleet-tab-view.component.scss']
})
export class FleetTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'fleet';

    fleet?: Fleet;

    utilization?: ResourceDeposit;

    // if true the mothball is selected in order to create a new fleet
    onlyAllowDetachment: boolean = false;

    index = 0;

    isShipyardAvailable: boolean = false;
    planet?: Planet;

    constructor(private resourceApi: ResourcesApiService,
                private fleetService: FleetApiService,
                private planetService: PlanetApiService,
                private fleetEventService: FleetEventService) {
        super();
    }

    ngAfterViewInit() {
        let sub = this.fleetEventService.getSelectedFleetEmitter().subscribe(fleet => {
            if (!!fleet && fleet.id === FleetDetachmentComponent.POOL_FLEET_ID) {
                setTimeout(() => {
                    this.fleet = undefined;
                    this.index = 2;
                    this.onlyAllowDetachment = true;
                }, 100);
                return;
            }
            this.index = 0;
            this.fetchCosts(fleet);
        });
        this.subscriptions.push(sub);
    }

    fetchCosts(fleet?: AbstractId) {
        if (!fleet) {
            this.utilization = undefined;
            this.fleet = undefined;
            return;
        }
        this.onlyAllowDetachment = false;
        let sub = this.fleetService.getFleet(fleet.id).subscribe(resp => {
            this.fleet = resp;
            this.checkYard();
        });
        this.subscriptions.push(sub);
        sub = this.resourceApi.getCostsForFleet(fleet.id).subscribe(resp => {
            resp.subType.typeName = EnumValueDto.EDepositTypeEnum.UTILIZATION
            this.utilization = resp;
        });
        this.subscriptions.push(sub);
    }

    private checkYard() {
        if (!!this.fleet && !!this.fleet.orbit && !!this.fleet.orbit.orbit && !!this.fleet.orbit.system && !!this.fleet.orbit.system.idStarSystem) {
            let sub = this.planetService.getPlanetByCoordinates(this.fleet.orbit.orbit, this.fleet.orbit.system.idStarSystem)
                .subscribe(resp => {
                    if (!!resp) {
                        this.planet = resp;
                        sub = this.planetService.isShipyardExistsOnPlanet(resp.idPlanet).subscribe(resp => {
                            this.isShipyardAvailable = resp;
                        });
                        this.subscriptions.push(sub);
                    } else {
                        this.noYardPresent();
                    }
                });
            this.subscriptions.push(sub);
        } else {
            this.noYardPresent();
        }
    }

    private noYardPresent() {
        if (this.index == 1) {
            this.index = 0;
        }
        this.planet = undefined;
        this.isShipyardAvailable = false;
    }
}
