import {AfterViewInit, Component} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
import {PlanetsEventService} from "../../../planets-event.service";
import {NavigationCreationService} from "../../../../../services/navigation/navigation-creation.service";
import {SidenavSelectionManager} from "../../../../../sidenav-selection-manager";

@Component({
    selector: 'app-planet-selection',
    templateUrl: './planet-selection.component.html',
    styleUrls: ['./planet-selection.component.scss']
})
export class PlanetSelectionComponent extends SidenavSelectionManager implements AfterViewInit {

    planets: Planet[] = [];

    constructor(private planetApi: PlanetApiService,
                private planetsNotificationService: PlanetsEventService) {
        super(NavigationCreationService.getPlanetRoute());
    }

    ngAfterViewInit(): void {
        let sub = this.planetApi.getPlanetByUsers().subscribe(resp => this.planets = resp);
        this.subscriptions.push(sub);
    }

    chosePlanet(planet: Planet) {
        this.navService.navigate(NavigationCreationService.getPlanetRoute());
        this.planetsNotificationService.selectPlanet(planet);
        this.selectedItem = {
            id: planet.idPlanet
        };
    }
}
