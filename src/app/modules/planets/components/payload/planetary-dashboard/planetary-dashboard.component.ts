import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, MiningFactors, Planet, PlanetApiService, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-planetary-dashboard',
    templateUrl: './planetary-dashboard.component.html',
    styleUrls: ['./planetary-dashboard.component.scss']
})
export class PlanetaryDashboardComponent extends SubscriptionManager implements OnInit, OnChanges {

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    planet?: Planet;
    private planetDefinition = "planet";

    @Input()
    shipyardJobPossible: boolean = false;

    @Input()
    shipyardExists: boolean = false;

    deposit?: ResourceDeposit;
    income?: ResourceDeposit;
    demand?: ResourceDeposit;
    utilization?: ResourceDeposit;
    capacity?: ResourceDeposit;
    miningFactors?: MiningFactors;
    fleetsInOrbit?: Fleet[];

    constructor(private resourceService: ResourcesApiService,
                private planetApi: PlanetApiService,
                private fleetApi: FleetApiService) {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.planetDefinition]) {
            this.fetchData();
            this.fetchFleetsInOrbit();
        }
    }

    private fetchFleetsInOrbit() {
        if (!this.planet) {
            return;
        }
        const sub = this.fleetApi.getFleetsByPlanet(this.planet?.idPlanet).subscribe(resp => this.fleetsInOrbit = resp);
        this.subscriptions.push(sub);
    }

    /**
     * fetches the mining factors if needed
     */
    private fetchData() {
        if (!this.planet) {
            return;
        }
        let sub = this.resourceService.getMiningFactors(this.planet.idPlanet).subscribe(resp => {
            this.miningFactors = resp;
        });
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceDeposit(this.planet.idPlanet).subscribe(resp => {
            this.deposit = resp;
        });
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceDemand(this.planet.idPlanet).subscribe(resp => {
            this.demand = resp;
        });
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceUtilization(this.planet.idPlanet).subscribe(resp => {
            this.utilization = resp;
        });
        this.subscriptions.push(sub);

        sub = this.resourceService.getPlanetaryCapacity(this.planet.idPlanet).subscribe(resp => {
            this.capacity = resp;
        });
        this.subscriptions.push(sub);

        sub = this.resourceService.getPlanetaryIncome(this.planet.idPlanet).subscribe(resp => {
            this.income = resp;
        });
        this.subscriptions.push(sub);
    }

}
