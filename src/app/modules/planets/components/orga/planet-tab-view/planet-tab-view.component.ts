import {AfterViewInit, Component} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {ResourceEmitterService} from "../../../../../services/resource-emitter.service";
import {PlanetsEventService} from "../../../planets-event.service";

@Component({
    selector: 'app-planet-tab-view',
    templateUrl: './planet-tab-view.component.html',
    styleUrls: ['./planet-tab-view.component.scss']
})
export class PlanetTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'planets';

    selectedPlanet?: Planet;

    shipyardJobPossible: boolean = false;
    shipyardExists: boolean = false;

    constructor(private planetApi: PlanetApiService,
                private planetsNotificationService: PlanetsEventService,
                private resourceEmitter: ResourceEmitterService) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.planetsNotificationService.getSelectedPlanetEmitter().subscribe(selected => this.fetchData(selected));
        this.subscriptions.push(sub);
    }

    fetchData(planet: Planet) {
        this.selectedPlanet = planet;
        let subscription = this.planetApi.isShipyardJobPossibleOnPlanet(this.selectedPlanet!.idPlanet)
            .subscribe(resp => this.shipyardJobPossible = resp);
        this.subscriptions.push(subscription);

        subscription = this.planetApi.isShipyardExistsOnPlanet(this.selectedPlanet!.idPlanet)
            .subscribe(resp => this.shipyardExists = resp);
        this.subscriptions.push(subscription);
    }

    indexChanged(event: number) {
        this.resourceEmitter.clear();
    }
}
