import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-planet-selection',
    templateUrl: './planet-selection.component.html',
    styleUrls: ['./planet-selection.component.scss']
})
export class PlanetSelectionComponent extends SubscriptionManager implements AfterViewInit {

    planets: Planet[] = [];

    /**
     * The user selected planet.
     */
    @Output()
    selectedPlanetOutput: EventEmitter<Planet> = new EventEmitter<Planet>();

    constructor(private planetApi: PlanetApiService) {
        super();
    }

    ngAfterViewInit(): void {
        let subscription = this.planetApi.getPlanetByUsers().subscribe(resp => {
            this.planets = resp
            this.selectFirst();
        });
        this.subscriptions.push(subscription);
    }

    private selectFirst() {
        let sortedPlanets = this.planets.sort((a, b) => a.idPlanet - b.idPlanet);
        this.chosePlanet(sortedPlanets[0]);
    }

    chosePlanet(planet: Planet) {
        this.selectedPlanetOutput.emit(planet);
    }
}
