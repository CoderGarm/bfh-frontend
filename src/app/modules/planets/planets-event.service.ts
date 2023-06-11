import {EventEmitter, Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs";
import {Planet} from "../../services/swagger";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class PlanetsEventService {

    private constructionStartsEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * Tell the others that some kind of construction was started.
     */
    public pushStartedConstruction() {
        this.constructionStartsEmitter.emit(true);
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
    private selectedPlanetEmitter: ReplaySubject<Planet> = new ReplaySubject<Planet>();

    getSelectedPlanetEmitter() {
        return this.selectedPlanetEmitter;
    }

    selectPlanet(planet?: Planet) {
        this.selectedPlanetEmitter.next(planet);
    }

    /**
     * communicates a created offer and therefore a changed deposit
     */
    private offerCreatedEmitter: ReplaySubject<any> = new ReplaySubject<any>();

    getOfferCreatedEmitter() {
        return this.offerCreatedEmitter;
    }

    fireOfferCrated() {
        this.offerCreatedEmitter.next();
    }
}
