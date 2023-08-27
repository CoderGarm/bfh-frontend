import {AfterViewInit, Component} from '@angular/core';
import {AbstractId, Planet, PlanetApiService} from "../../../../../services/swagger";
import {PlanetsEventService} from "../../../planets-event.service";
import {NavigationCreationService} from "../../../../../services/navigation/navigation-creation.service";
import {SidenavSelectionManager} from "../../../../../sidenav-selection-manager";

@Component({
    selector: 'app-planet-selection',
    templateUrl: './planet-selection.component.html',
    styleUrls: ['./planet-selection.component.scss']
})
export class PlanetSelectionComponent extends SidenavSelectionManager implements AfterViewInit {


    planetsBySystem: Map<number, number[]> = new Map<number, number[]>();

    planets: Map<AbstractId, Planet[]> = new Map<AbstractId, Planet[]>();

    constructor(private planetApi: PlanetApiService,
                private planetsNotificationService: PlanetsEventService) {
        super(NavigationCreationService.getPlanetRoute());
    }

    ngAfterViewInit(): void {
        let sub = this.planetApi.getPlanetByUsers().subscribe(resp => {
            resp.forEach(p => {
                const idStarSystem = p.starSystem.id;
                const idPlanet = p.idPlanet;
                let planets = this.planetsBySystem.get(idStarSystem);
                if (!planets) {
                    planets = [];
                }
                planets.push(idPlanet);
                this.planetsBySystem.set(idStarSystem, planets);
            });

            this.planetsBySystem.forEach((planetIDs, idStarSystem) => {
                const planets = resp.filter(p => planetIDs.includes(p.idPlanet));
                const starSystem = planets[0].starSystem;
                this.planets.set(starSystem, planets);
            });
        });
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
