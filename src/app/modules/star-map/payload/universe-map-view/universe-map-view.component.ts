import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {FleetApiService, FleetMarker, FleetMove, Move, StarSystem} from "../../../../services/swagger";
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
import {ArrayXY, Point} from "@svgdotjs/svg.js";
import {FleetEventService} from "../../../../services/intercom/fleet-event.service";
import {BasicViewHelper} from "../../../../services/svg-view-helper/basic-view-helper";
import {BasicViewHelperData} from "../../../../services/svg-view-helper/basic-view-helper-data";

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

    constructor(private fleetApi: FleetApiService,
                private fleetEventService: FleetEventService,
                private spinnerService: SpinnerService,
                private backgroundService: BackgroundService,
                private translate: TranslateService,
                private change: ChangeDetectorRef) {
        super();

        // just make sure that the key exists
        this.translate.get('star-map.universe-map.loading-spinner-message');

        let sub = this.starMapCommService.getInterstellarMoveEmitter().subscribe(resp => this.moveFleet(resp));
        this.subscriptions.push(sub);

        sub = this.starMapCommService.getConfirmedInterstellarMoveEmitter().subscribe(resp => this.drawPlannedMoves(resp));
        this.subscriptions.push(sub);

        sub = this.starMapCommService.getFleetsDesignatedForMotionEmitter().subscribe(resp => {
            const fleetIDs = resp.map(f => f.idFleet);
            const group = this.getOrCreateFleetConfirmedMoveGroup();
            group
                .children()
                .filter(c => c.hasClass(BasicViewHelperData.COURSE_PLOT_MARKER) || c.hasClass(BasicViewHelperData.WAYPOINT_PLOT_MARKER))
                .forEach(c => {
                    const cssClasses = c.classes().filter(css => css.startsWith(BasicViewHelperData.COURSE_PLOT_MARKER_ID_PREFIX));
                    if (cssClasses.length == 1 && !fleetIDs.includes(Number.parseInt(cssClasses[0].replace(BasicViewHelperData.COURSE_PLOT_MARKER_ID_PREFIX, '')))) {
                        group.removeElement(c);
                    }
                });
        });
        this.subscriptions.push(sub);

        this.filteredCenter = this.centerFormControl.valueChanges.pipe(
            startWith(null),
            map((c: string | null) => (c ? this._filter(c) : this.coords.slice()))
        );
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
        // unfortunately necessary in this constellation - ng destroy is called by ng template in tab view on tab switch
        this.createCanvas("universe-canvas", '#universe');
        this.createUniverseMap();
    }

    selectedCenter(event?: MatAutocompleteSelectedEvent): void {

        if (!!event) {
            this.handleSearchedStarSystem(event.option.value);
        } else {
            this.starMapCommService.selectedStarSystem = undefined;
        }
        if (!!this.starMapCommService.selectedStarSystem) {
            this.centerFormControl.setValue(this.starMapCommService.selectedStarSystem.name);
        } else {
            this.centerFormControl.setValue(null);
        }

    }

    zoomTo() {
        if (!this.starMapCommService.selectedStarSystem) {
            return;
        }
        let x = this.convertToStandardMetric(this.starMapCommService.selectedStarSystem.orbit.xCoordinate);
        let y = this.convertToStandardMetric(this.starMapCommService.selectedStarSystem.orbit.yCoordinate);

        this.canvas!.zoom(0).animate().zoom(2, new Point(x, y));
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
            this.spinnerService.hide('universe-map');
        });
        this.subscriptions.push(sub);
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

    private drawPlannedMoves(moves: Move[]) {
        const group = this.getOrCreateFleetConfirmedMoveGroup();
        moves.forEach(m => {
            const waypoints = m.waypoints
                .filter(w => {
                    const atUniMapLooseWaypoint = !!w.orbit && !w.system;
                    const atUniMapSystemWaypoint = !w.orbit && !!w.system;
                    return atUniMapLooseWaypoint || atUniMapSystemWaypoint;
                }).map(w => !!w.orbit ? w.orbit : w.system!.orbit);

            const idFleet = m.idFleetInMotion;

            for (let i = 0; i < waypoints.length; i++) {
                const orbit = waypoints[i];
                const circle = group.circle()
                    .x(this.convertToStandardMetric(orbit.xCoordinate))
                    .y(this.convertToStandardMetric(orbit.yCoordinate))
                    .id(`waypoint-no-${i}-of-${idFleet}`)
                    .fill(BasicViewHelper.NONE_FILL_COLOR)
                    .addClass(BasicViewHelperData.WAYPOINT_PLOT_MARKER)
                    .addClass(BasicViewHelperData.COURSE_PLOT_MARKER_ID_PREFIX + idFleet)
                    .radius(BasicViewHelper.STAR_RADIUS * 2);

                circle
                    .animate(1600, 0, 'after').transform({scale: [2, 2]}).css('opacity', '0')
                    .animate(1600, 0, 'after').transform({scale: [1, 1]}).css('opacity', '1')
                    .loop(500, true, 300);
            }

            const course = waypoints.map(w => <ArrayXY>[
                this.convertToStandardMetric(w.xCoordinate),
                this.convertToStandardMetric(w.yCoordinate)
            ]);
            const polyline = group.polyline(course)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .addClass(BasicViewHelperData.COURSE_PLOT_MARKER)
                .addClass(BasicViewHelperData.COURSE_PLOT_MARKER_ID_PREFIX + idFleet);

            polyline
                .animate(10000, 0, 'after').css('stroke-dashoffset', '-1000')
                .loop(500, false, 0);
        });
    }
}
