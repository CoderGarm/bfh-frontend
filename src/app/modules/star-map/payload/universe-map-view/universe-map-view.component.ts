import {AfterViewInit, Component, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import {Orbit, StarMapApiService, StarSystem} from "../../../../services/swagger";
import {Subscription} from "rxjs";
import {SVG} from "@svgdotjs/svg.js";
import '@svgdotjs/svg.panzoom.js'
import '@svgdotjs/svg.draggable.js'
import {EViewBoxType, ViewHelper} from "../ViewHelper";

@Component({
    selector: 'app-universe-map-view',
    templateUrl: './universe-map-view.component.html',
    styleUrls: ['./universe-map-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UniverseMapViewComponent extends ViewHelper implements AfterViewInit {

    private subscriptions: Subscription[] = [];

    /**
     * all known star systems
     */
    knownStarSystems: StarSystem[] = [];

    private knownStarSystemsByOrbit: Map<Orbit, StarSystem> = new Map<Orbit, StarSystem>();

    @Output()
    starSystemSelectionOutput: EventEmitter<StarSystem> = new EventEmitter<StarSystem>();

    constructor(private starMapApi: StarMapApiService) {
        super();
    }

    ngAfterViewInit(): void {
        this.canvas = SVG().id("universe-canvas").addTo('#universe').panZoom();
        let subscription = this.starMapApi.getStarSystems().subscribe(resp => {
            this.knownStarSystems = resp;

            this.clearCanvas();
            this.knownStarSystems.map((system) => this.knownStarSystemsByOrbit.set(system.orbit, system));
            this.setOrbits(this.canvas!, EViewBoxType.UNIVERSE, this.knownStarSystemsByOrbit.keys(), this.clickEventForStarSystem);
        });
        this.subscriptions.push(subscription);
    }

    /**
     * call back function for using a click at an element
     *
     * @param event
     */
    private clickEventForStarSystem = (event: PointerEvent) => {
        let orbitByID = this.getOrbitOfCelestialByEvent(event);
        if (!!orbitByID) {
            let system = this.knownStarSystemsByOrbit.get(orbitByID);
            this.starSystemSelectionOutput.emit(system);
        }
    };

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
