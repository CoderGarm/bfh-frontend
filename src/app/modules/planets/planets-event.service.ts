import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Planet} from "../../services/swagger";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class PlanetsEventService {

    private constructionStartsEmitter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /**
     * Tell the others that some kind of construction was started.
     */
    public pushStartedConstruction() {
        this.constructionStartsEmitter.next(true);
    }

    /**
     * Ask if you are interested if some construction was started.
     */
    public getConstructionStartsEmitter() {
        return this.constructionStartsEmitter;
    }

    /**
     * communicates a clicked planet in the shipyard section of the sidenav
     */
    private selectedPlanetEmitter: BehaviorSubject<Planet | undefined> = new BehaviorSubject<Planet | undefined>(undefined);

    getSelectedPlanetEmitter() {
        return this.selectedPlanetEmitter;
    }

    selectPlanet(planet?: Planet) {
        this.selectedPlanetEmitter.next(planet);
    }

    /**
     * communicates a created offer and therefore a changed deposit
     */
    private offerCreatedEmitter: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

    getOfferCreatedEmitter() {
        return this.offerCreatedEmitter;
    }

    fireOfferCreated() {
        this.offerCreatedEmitter.next(true);
    }
}
