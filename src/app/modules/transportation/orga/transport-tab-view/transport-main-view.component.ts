import {Component, OnInit} from '@angular/core';
import {EEducationType, EResourceType, FleetApiService, Planet, PlanetApiService, ResourceDeposit, ResourcesApiService, WarShip} from "../../../../services/swagger";
import {ResourceHelper} from "../../../../services/helper/resource.helper";
import {TypeService} from "../../../../services/type.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {interval} from "rxjs";

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
        const mothballByPlanet: Map<number, WarShip[]> = new Map<number, WarShip[]>();
        let finished: number = this.planets.length;
        this.planets.forEach(planet => {
            let sub = this.fleetService.getPooledWarships(planet.idPlanet)
                .subscribe(resp => {
                    resp.forEach(w => {
                        let idPlanet = planet.idPlanet;
                        if (!!w.transportJob) {
                            idPlanet = w.transportJob.to.id;
                        }
                        let arr = mothballByPlanet.get(idPlanet);
                        if (!arr) {
                            arr = [];
                        }
                        arr.push(w);
                        mothballByPlanet.set(idPlanet, arr);
                    });
                    finished--;
                });
            this.subscriptions.push(sub);
        });
        const source = interval(500);
        const sub = source.subscribe(() => {
            if (finished == 0) {
                this.planets.map(p => {
                    if (!mothballByPlanet.has(p.idPlanet)) {
                        mothballByPlanet.set(p.idPlanet, []);
                    }
                });
                this.mothballByPlanet = mothballByPlanet;
                sub.unsubscribe();
            }
        });
        this.subscriptions.push(sub);
    }
}
