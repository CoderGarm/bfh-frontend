import {AfterViewInit, Component, ViewEncapsulation} from '@angular/core';
import {FleetApiService, FleetMove, StarMapApiService, StarSystem} from "../../../../services/swagger";
import '@svgdotjs/svg.panzoom.js'
import '@svgdotjs/svg.draggable.js'
import {OrbitDefinition} from "../orbit-definition";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {InterstellarViewHelper} from "../interstellar-view-helper";
import {SpinnerService} from "../../../../services/spinner.service";
import {TranslateService} from "@ngx-translate/core";
import {BackgroundService} from "../../../../services/background.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-universe-map-view',
    templateUrl: './universe-map-view.component.html',
    styleUrls: ['./universe-map-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UniverseMapViewComponent extends InterstellarViewHelper implements AfterViewInit {

    knownStarSystems: StarSystem[] = [];

    private bloodyHackButDoNotSubscribeMeTwice: Subscription[] = [];

    constructor(private starMapService: StarMapApiService,
                private fleetApi: FleetApiService,
                tokenStorage: TokenStorage,
                private spinnerService: SpinnerService,
                private backgroundService: BackgroundService,
                private translate: TranslateService) {
        super(tokenStorage);

        // just make sure that the key exists
        this.translate.get('star-map.universe-map.loading-spinner-message');

        let sub = this.starMapCommService.getInterstellarMoveEmitter().subscribe(resp => this.moveFleet(resp));
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
        this.createCanvas("universe-canvas", '#universe');
        this.createUniverseMap();
    }


    private createUniverseMap() {
        this.spinnerService.activateSpinner('star-map.universe-map.loading-spinner-message');
        this.starMapCommService.clear();
        this.starMapCommService.deselect();
        this.clearData();
        this.bloodyHackButDoNotSubscribeMeTwice.forEach(sub => sub.unsubscribe())

        let outerSub = this.backgroundService.getStarSystems().subscribe(resp => {
            this.knownStarSystems = resp;
            this.knownStarSystems.forEach((system) => this.setKnownStarSystemByOrbit(system));
            let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForStarSystem(this.tokenStorage.getUserID(), this.knownStarSystems);
            this.drawOrbits(orbitDefinitions);
            let sub = this.fleetApi.getFleetDistribution().subscribe(resp => {
                this.setFleets(resp);
            });
            this.subscriptions.push(sub);
            this.spinnerService.deactivateSpinner();
        });
        this.bloodyHackButDoNotSubscribeMeTwice.push(outerSub)
        this.subscriptions.push(outerSub);
    }

    private moveFleet(plannedMoves: FleetMove[]) {
        let sub = this.fleetApi.moveFleets(plannedMoves).subscribe(resp => {
            if (resp) {
                this.createUniverseMap();
            }
        });
        this.subscriptions.push(sub);
    }
}
