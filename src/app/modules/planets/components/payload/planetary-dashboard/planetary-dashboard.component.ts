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

    @Input()
    sumOfPops: number = 0;

    @Input()
    deposit?: ResourceDeposit;

    @Input()
    income?: ResourceDeposit;

    demand?: ResourceDeposit;

    @Input()
    utilization?: ResourceDeposit;

    @Input()
    capacity?: ResourceDeposit;

    @Input()
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

    private fetchData() {
        if (!this.planet) {
            return;
        }

        let sub = this.resourceService.getResourceDemand(this.planet.idPlanet).subscribe(resp => {
            this.demand = resp;
        });
        this.subscriptions.push(sub)
    }

}
