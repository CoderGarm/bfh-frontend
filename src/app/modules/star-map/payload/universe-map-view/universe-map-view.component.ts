import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {FleetApiService, FleetMarker, FleetMove, Orbit, StarSystem} from "../../../../services/swagger";
import '@svgdotjs/svg.panzoom.js'
import '@svgdotjs/svg.draggable.js'
import {OrbitDefinition} from "../orbit-definition";
import {InterstellarViewHelper} from "../interstellar-view-helper";
import {SpinnerService} from "../../../../services/spinner.service";
import {TranslateService} from "@ngx-translate/core";
import {BackgroundService} from "../../../../services/prefetch/background.service";
import {Observable, startWith} from "rxjs";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FormControl} from "@angular/forms";
import {map} from "rxjs/operators";
import {Point} from "@svgdotjs/svg.js";
import {FleetEventService} from "../../../../services/intercom/fleet-event.service";
import {DoNotScrollService} from "../../../../services/intercom/do-not-scroll.service";
import {StarMapCommunicationService} from "../../../../services/intercom/star-map-communication.service";

@Component({
    selector: 'app-universe-map-view',
    templateUrl: './universe-map-view.component.html',
    styleUrls: ['./universe-map-view.component.scss']
})
export class UniverseMapViewComponent extends InterstellarViewHelper implements AfterViewInit {

    knownStarSystems: StarSystem[] = [];

    filteredCenter: Observable<StarSystem[]>;
    coords: StarSystem[] = [];

    private distribution: FleetMarker[] = [];

    @ViewChild('centerInput')
    centerInput?: ElementRef<HTMLInputElement>;

    centerFormControl = new FormControl('');

    showLegendBox: boolean = true;
    showPlanetBox: boolean = true;
    showFleetBox: boolean = true;

    ownSystems: StarSystem[] = [];
    ownFleets: FleetMarker[] = [];
    focussedOrbit?: Orbit;

    constructor(private fleetApi: FleetApiService,
                private fleetEventService: FleetEventService,
                private spinnerService: SpinnerService,
                private backgroundService: BackgroundService,
                private translate: TranslateService,
                private noScrollService: DoNotScrollService,
                protected commService: StarMapCommunicationService,
                private change: ChangeDetectorRef) {
        super();

        this.noScrollService.setNoScroll();

        // just make sure that the key exists
        this.translate.get('star-map.universe-map.loading-spinner-message');

        let sub = this.starMapCommService.getInterstellarMoveEmitter().subscribe(resp => this.moveFleet(resp));
        this.subscriptions.push(sub);

        this.filteredCenter = this.centerFormControl.valueChanges.pipe(
            startWith(null),
            map((c: string | null) => (c ? this._filter(c) : this.coords.slice()))
        );

        if (this.isHandheldDisplaySize) {
            this.showLegendBox = false;
            this.showPlanetBox = false;
            this.showFleetBox = false;
        }
    }

    ngOnDestroy() {
        this.noScrollService.clearScrolling();
        super.ngOnDestroy();
    }

    private _filter(value: string): StarSystem[] {
        let filterValue = '';
        try {
            filterValue = value.toLowerCase();
        } catch (e) {
            filterValue = (<StarSystem><unknown>value).name.toLowerCase();
        }
        return this.knownStarSystems!.filter(c => c.name.toLowerCase().includes(filterValue));
    }

    ngAfterViewInit(): void {
        this.createCanvas("universe-canvas", '#universe');
        this.createUniverseMap();
    }

    selectedCenter(event?: MatAutocompleteSelectedEvent): void {
        if (!!event) {
            this.handleSearchedStarSystem(event.option.value);
        } else {
            this.starMapCommService.selectedStarSystem = undefined;
        }
        this.setSearchFieldText();
    }

    private setSearchFieldText() {
        if (!!this.starMapCommService.selectedStarSystem) {
            this.centerFormControl.setValue(this.starMapCommService.selectedStarSystem.name);
        } else {
            this.centerFormControl.setValue(null);
        }
    }

    selectOutlineSystem(starSystem: StarSystem): void {
        if (starSystem.idStarSystem == this.starMapCommService.selectedStarSystem?.idStarSystem) {
            this.starMapCommService.removeSelectedStarSystem();
        } else {
            this.starMapCommService.setSelectedStarSystem(starSystem);
        }
        this.setSearchFieldText();
        this.tidyUpFocussedOrbit();
    }

    private tidyUpFocussedOrbit() {
        if (!this.starMapCommService.selectedStarSystem && this.starMapCommService.getSelectedFleetMarker().length == 0) {
            this.focussedOrbit = undefined;
        }
    }

    selectOutlineFleet(fleet: FleetMarker) {
        if (this.starMapCommService.isSelectedFleetMarker(fleet.fleet.id)) {
            this.starMapCommService.removeSelectedFleetMarker(fleet);
        } else {
            this.starMapCommService.addFleetMarker(fleet);
        }
        this.tidyUpFocussedOrbit();
    }

    zoomToNext() {
        let focussedOrbits: Orbit[] = [];
        if (!!this.starMapCommService.selectedStarSystem) {
            focussedOrbits.push(this.starMapCommService.selectedStarSystem.orbit);
        }
        this.starMapCommService.getSelectedFleetMarker().forEach(fm => focussedOrbits.push(fm.currentOrbit!.system!.orbit!));
        focussedOrbits = focussedOrbits.sort((a, b) => {
            let xA = this.convertToStandardMetric(a.xCoordinate);
            let yA = this.convertToStandardMetric(a.yCoordinate);
            let xB = this.convertToStandardMetric(b.xCoordinate);
            let yB = this.convertToStandardMetric(b.yCoordinate);
            return xA + yA - xB + yB;
        });

        if (focussedOrbits.length == 0) {
            return;
        }

        let orbit: Orbit;
        if (!this.focussedOrbit) {
            orbit = focussedOrbits[0];
        } else {
            const findIndex = focussedOrbits.findIndex(a => {
                let xA = this.convertToStandardMetric(a.xCoordinate);
                let yA = this.convertToStandardMetric(a.yCoordinate);
                let xB = this.convertToStandardMetric(this.focussedOrbit!.xCoordinate);
                let yB = this.convertToStandardMetric(this.focussedOrbit!.yCoordinate);
                return xA == xB && yA == yB;
            });

            if (findIndex == focussedOrbits.length - 1) {
                orbit = focussedOrbits[0];
            } else {
                orbit = focussedOrbits[findIndex + 1];
            }
        }

        if (!!orbit) {
            this.focussedOrbit = orbit;
            let x = this.convertToStandardMetric(orbit.xCoordinate);
            let y = this.convertToStandardMetric(orbit.yCoordinate);
            this.canvas!.zoom(0).animate().zoom(2, new Point(x, y));
        }

    }

    private createUniverseMap() {
        this.spinnerService.show('universe-map');
        this.starMapCommService.clear();
        this.starMapCommService.deselect();
        this.starMapCommService.displayedStarSystem = undefined;
        this.clearData();

        if (this.backgroundService.getStarSystemsAsArray().length > 0) {
            // even not a solution for the strange 'double fetch' phenomena
            this.setUpMap(this.backgroundService.getStarSystemsAsArray());
            return;
        }

        let sub = this.backgroundService.getStarSystems().subscribe(resp => {
            this.setUpMap(resp);
        });
        this.subscriptions.push(sub);
    }

    private setUpMap(starSystems: StarSystem[]) {
        this.knownStarSystems = starSystems;
        this.knownStarSystems.forEach((system) => this.setKnownStarSystemByOrbit(system));
        this.drawJunctions();
        let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForStarSystem(this.userId, this.knownStarSystems);
        this.drawOrbits(orbitDefinitions);
        let sub = this.fleetApi.getFleetDistribution().subscribe(resp => {
            this.distribution = resp;
            this.starMapCommService.galaxyFleetDistribution = resp;
            this.setFleets(this.distribution);
            this.distribution.filter(fm => fm.owner.id == this.userId).forEach(fm => this.ownFleets.push(fm));
            this.spinnerService.hide('universe-map');
        });
        this.subscriptions.push(sub);
        orbitDefinitions.filter(od => od.isColonizedByLoggedInUser).forEach(od => this.ownSystems.push(<StarSystem>od.celestial));
        this.change.detectChanges();
    }

    private moveFleet(plannedMoves: FleetMove[]) {
        let sub = this.fleetApi.moveFleets(plannedMoves).subscribe(resp => {
            resp.forEach(marker => {
                const toRemove = this.distribution.filter(fm => fm.fleet.id === marker.fleet.id)[0];
                const indexToRemove = this.distribution.indexOf(toRemove);
                if (indexToRemove != -1) {
                    this.distribution.splice(indexToRemove, 1, marker);
                }
            });
            this.fleetEventService.reload();
            this.setFleets(this.distribution);
        });
        this.subscriptions.push(sub);
    }
}
