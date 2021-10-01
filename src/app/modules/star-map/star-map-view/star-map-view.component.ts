import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EViewBoxType, ViewHelper} from "../ViewHelper";
import {Polygon, SVG} from "@svgdotjs/svg.js";
import {Fleet, FleetApiService, FleetOrbit, Move, Orbit, Planet, StarMapApiService, StarSystem} from "../../../services/swagger";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-star-map-view',
    templateUrl: './star-map-view.component.html',
    styleUrls: ['./star-map-view.component.scss']
})
export class StarMapViewComponent extends ViewHelper implements AfterViewInit, OnChanges {

    private subscriptions: Subscription[] = [];

    @Input()
    starSystemSelectionInput?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystemSelectionInput";

    planets: Planet[] = [];
    private planetsByOrbit: Map<Orbit, Planet> = new Map<Orbit, Planet>();

    private fleets: Fleet[] = [];
    private fleetsInOrbit: Map<FleetOrbit, Fleet> = new Map<FleetOrbit, Fleet>();
    private fleetsInMotion: Map<Move, Fleet> = new Map<Move, Fleet>();

    constructor(private starMapApi: StarMapApiService,
                private fleetApi: FleetApiService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.starSystemSelectionInputDefinition]) {
            if (!!this.starSystemSelectionInput) {

                this.clearCanvas();
                let sub = this.starMapApi.getStarSystem(this.starSystemSelectionInput.idStarSystem)
                    .subscribe(resp => {
                        this.planets = resp;
                        if (!this.canvas) {
                            this.createCanvas()
                        }

                        this.planets.map((system) => this.planetsByOrbit.set(system.orbit, system));
                        this.setOrbits(this.canvas!, EViewBoxType.STAR_SYSTEM, this.planetsByOrbit.keys(), this.clickEventForPlanet);
                    });
                this.subscriptions.push(sub);

                sub = this.fleetApi.getFleetsBySystem(this.starSystemSelectionInput.idStarSystem)
                    .subscribe(resp => {
                        // every fleet in an orbit must have an orbit defined, logical
                        this.fleets = resp;
                        if (!this.canvas) {
                            this.createCanvas()
                        }

                        this.fleets.filter(fleet => !!fleet.orbit && !!fleet.orbit.planet).map((fleet) => this.fleetsInOrbit.set(fleet.orbit!, fleet));
                        this.setFleetsInOrbits(this.canvas!, this.fleetsInOrbit, this.clickForFleetInOrbit);

                        this.fleets.filter(fleet => !!fleet.move).map((fleet) => this.fleetsInMotion.set(fleet.move!, fleet));
                    });
                this.subscriptions.push(sub);
            }
        }
    }

    /**
     * call back function for using a click at an element
     *
     * @param event
     */
    private clickEventForPlanet = (event: PointerEvent) => {
        let orbitOfCelestialByEvent: Orbit | undefined = this.getOrbitOfCelestialByEvent(event);
        console.log(orbitOfCelestialByEvent);
    }

    /**
     * call back function for using a click at an element
     *
     * @param event
     */
    private clickForFleetInOrbit = (event: PointerEvent) => {
        let fleetSharkByEvent: Polygon | undefined = this.getFleetSharkByEvent(event);
        console.log(fleetSharkByEvent);
    }

    /**
     * necessary to create svg after template is rendered
     * @private
     */
    private createCanvas() {
        this.canvas = SVG().addTo('#starsystem').panZoom();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
