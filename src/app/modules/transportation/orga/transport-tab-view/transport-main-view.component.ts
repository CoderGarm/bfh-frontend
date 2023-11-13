import {Component, OnInit} from '@angular/core';
import {EEducationType, EResourceType, FleetApiService, Planet, PlanetApiService, ResourceDeposit, ResourcesApiService, WarShip} from "../../../../services/swagger";
import {ResourceHelper} from "../../../../services/helper/resource.helper";
import {TypeService} from "../../../../services/type.service";
import {SubscriptionManager} from "../../../../subscription.manager";

@Component({
    selector: 'app-transport-main-view',
    templateUrl: './transport-main-view.component.html',
    styleUrls: ['./transport-main-view.component.scss']
})
export class TransportMainViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'transportation';

    planets: Planet[] = [];

    depositsResources: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();
    depositsPopulation: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();
    mothballByPlanet: Map<number, WarShip[]> = new Map<number, WarShip[]>();

    resourceTypes: EResourceType[];
    educationTypes: EEducationType[];

    constructor(private planetService: PlanetApiService,
                private fleetService: FleetApiService,
                private resourceService: ResourcesApiService,
                private typeService: TypeService) {
        super();

        this.resourceTypes = this.typeService.collectableResourceTypes;
        this.educationTypes = this.typeService.militaryEducationTypes;
    }

    ngOnInit(): void {
        let sub = this.planetService.getPlanetByUsers().subscribe(resp => {
            this.planets = resp;
            this.getDeposits();
            this.getMothball();
        });
        this.subscriptions.push(sub);
    }

    getDeposits() {
        if (this.planets.length == 0) {
            this.depositsResources.clear();
            this.depositsPopulation.clear();
        }
        this.planets.forEach(planet => {
            let sub = this.resourceService.getResourceDeposit(planet.idPlanet)
                .subscribe(resp => {
                    let copy = ResourceHelper.copy(resp, this.resourceTypes, [])!;
                    this.depositsResources.set(planet.idPlanet, copy!);

                    copy = ResourceHelper.copy(resp, [], this.educationTypes)!;
                    this.depositsPopulation.set(planet.idPlanet, copy!);
                });
            this.subscriptions.push(sub);
        });
    }

    private getMothball() {
        if (this.planets.length == 0) {
            this.mothballByPlanet.clear();
        }
        this.planets.forEach(planet => {
            let sub = this.fleetService.getPooledWarships(planet.idPlanet)
                .subscribe(resp => this.mothballByPlanet.set(planet.idPlanet, resp));
            this.subscriptions.push(sub);
        });
    }
}
