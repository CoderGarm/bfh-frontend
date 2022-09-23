import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {SpinnerService} from "../../../../../services/spinner.service";
import {TranslateService} from "@ngx-translate/core";
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

    constructor(private tokenStorage: TokenStorage,
                private planetApi: PlanetApiService,
                private spinnerService: SpinnerService,
                public translate: TranslateService) {
        super();

        // just make sure that the key exists
        this.translate.get('planetary.load.wait-for-load');
    }

    ngAfterViewInit(): void {
        // todo not displayed?
        this.spinnerService.activateSpinner('planetary.load.wait-for-load');
        const userID = this.tokenStorage.getUserID();
        let subscription = this.planetApi.getPlanetByUsers(userID).subscribe(resp => {
            this.planets = resp
            this.selectFirst();
            this.spinnerService.deactivateSpinner();
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
