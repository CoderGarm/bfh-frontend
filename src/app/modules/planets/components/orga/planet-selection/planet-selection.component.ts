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

    shipYardPossibleByPlanetId: Map<number, boolean> = new Map<number, boolean>();
    groundConstructionPossibleByPlanetId: Map<number, boolean> = new Map<number, boolean>();

    planetsBySystem: Map<number, number[]> = new Map<number, number[]>();

    planets: Map<AbstractId, Planet[]> = new Map<AbstractId, Planet[]>();

    constructor(private planetApi: PlanetApiService,
                private planetsNotificationService: PlanetsEventService) {
        super(NavigationCreationService.getPlanetRoute());

        let sub = planetsNotificationService.getConstructionStartsEmitter()
            .subscribe(idPlanet => this.fetchPlanetaryState(idPlanet));
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
        let sub = this.planetApi.getPlanetByUsers().subscribe(resp => {
            resp.forEach(p => {
                const idStarSystem = p.starSystem.id;
                const idPlanet = p.idPlanet;
                this.fetchPlanetaryState(idPlanet);
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

    private fetchPlanetaryState(idPlanet: number) {
        let sub = this.planetApi.isConstructionPossibleOnPlanet(idPlanet).subscribe(resp => {
            this.groundConstructionPossibleByPlanetId.set(idPlanet, resp);
        });
        this.subscriptions.push(sub);
        sub = this.planetApi.isShipyardJobPossibleOnPlanet(idPlanet).subscribe(resp => {
            this.shipYardPossibleByPlanetId.set(idPlanet, resp);
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
