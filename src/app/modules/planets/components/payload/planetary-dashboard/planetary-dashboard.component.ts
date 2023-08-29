import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Fleet, MiningFactors, Planet, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";

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

    @Input()
    fleetsInOrbit?: Fleet[];

    deposit?: ResourceDeposit;
    income?: ResourceDeposit;
    demand?: ResourceDeposit;
    utilization?: ResourceDeposit;
    capacity?: ResourceDeposit;
    miningFactors?: MiningFactors;

    constructor(private resourceService: ResourcesApiService) {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.planetDefinition]) {
            this.fetchData();
        }
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
