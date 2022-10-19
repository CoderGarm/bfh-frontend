import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-planet-tab-view',
    templateUrl: './planet-tab-view.component.html',
    styleUrls: ['./planet-tab-view.component.scss']
})
export class PlanetTabViewComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * The user selected planet.
     */
    @Input()
    selectedPlanet?: Planet;
    private selectedPlanetDefinition = "selectedPlanet";

    shipyardJobPossible: boolean = false;

    constructor(private planetApi: PlanetApiService) {
        super();
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            let subscription = this.planetApi.isShipyardJobPossibleOnPlanet(this.selectedPlanet!.idPlanet)
                .subscribe(resp => this.shipyardJobPossible = resp);
            this.subscriptions.push(subscription);
        }
    }
}
