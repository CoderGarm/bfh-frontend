import {Component, OnInit} from '@angular/core';
import {EEducationType, EResourceType, Planet, PlanetApiService, ResourceDeposit, ResourcesApiService} from "../../../../services/swagger";
import {ResourceHelper} from "../../../../services/helper/resource.helper";
import {TypeService} from "../../../../services/type.service";
import {SubscriptionManager} from "../../../../subscription.manager";

@Component({
    selector: 'app-transport-tab-view',
    templateUrl: './transport-tab-view.component.html',
    styleUrls: ['./transport-tab-view.component.scss']
})
export class TransportTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'transportation';

    planets: Planet[] = [];

    depositsResources: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();
    depositsPopulation: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();

    resourceTypes: EResourceType[];
    educationTypes: EEducationType[];

    constructor(private planetService: PlanetApiService,
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
                    let copy = ResourceHelper.copy(resp, this.resourceTypes, []);
                    this.depositsResources.set(planet.idPlanet, copy!);

                    copy = ResourceHelper.copy(resp, [], this.educationTypes);
                    this.depositsPopulation.set(planet.idPlanet, copy!);
                });
            this.subscriptions.push(sub);
        });
    }
}
