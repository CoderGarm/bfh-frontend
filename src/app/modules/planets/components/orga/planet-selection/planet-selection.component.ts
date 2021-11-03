import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-planet-selection',
  templateUrl: './planet-selection.component.html',
  styleUrls: ['./planet-selection.component.scss']
})
export class PlanetSelectionComponent implements AfterViewInit {

  private subscriptions: Subscription[] = [];

  planets: Planet[] = [];

  /**
   * The user selected planet.
   */
  @Output()
  selectedPlanetOutput: EventEmitter<Planet> = new EventEmitter<Planet>();

  constructor(private tokenStorage: TokenStorage, private planetApi: PlanetApiService) {
  }

  ngAfterViewInit(): void {
    const userID = this.tokenStorage.getUserID();
    let subscription = this.planetApi.getPlanetByUsers(userID).subscribe(resp => this.planets = resp);
    this.subscriptions.push(subscription);

  }

  chosePlanet(planet: Planet) {
    this.selectedPlanetOutput.emit(planet);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
