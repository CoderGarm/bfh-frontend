import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MiningFactors, Planet, ResourcesApiService} from "../../../../../services/swagger";
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

    miningFactors?: MiningFactors;

    constructor(private resourceApi: ResourcesApiService) {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.planetDefinition]) {
            this.getMiningFactors();
        }
    }

    /**
     * fetches the mining factors if needed
     */
    private getMiningFactors() {
        if (!this.planet) {
            return;
        }
        let sub = this.resourceApi.getMiningFactors(this.planet.idPlanet).subscribe(resp => {
            this.miningFactors = resp;
        });
        this.subscriptions.push(sub);
    }

}
