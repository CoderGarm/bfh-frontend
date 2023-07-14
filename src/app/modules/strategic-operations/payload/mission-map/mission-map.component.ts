import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AssetsService, Coords} from "../../../../services/assets/assets.service";
import {MapData} from "./map-data.component";
import {LocalMapOrbitDefinition} from "./local-map-orbit-definition";
import {BackgroundService} from "../../../../services/prefetch/background.service";
import {Mission, StarSystem} from "../../../../services/swagger";
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {NgxSpinnerService} from "ngx-spinner";
import {MapDataProvider} from "./map-data-provider.component";
import MissionTypeEnum = Mission.MissionTypeEnum;


// noinspection CssConvertColorToRgbInspection
@Component({
    selector: 'mission-map',
    templateUrl: './mission-map.component.html',
    styleUrls: ['./mission-map.component.scss']
})
export class MissionMapComponent extends MapDataProvider implements AfterViewInit, OnChanges {

    public static readonly UN_FOCUSSED_COLOR: string = '#FB8C00';
    public static readonly COLONIZED_COLOR: string = '#556B2F';
    public static readonly COLONIZED_BY_OTHERS_COLOR: string = '#6f1585';
    public static readonly COLONIZED_BY_NPC_COLOR: string = '#8B0000';
    public static readonly PIRATE_HUNT_COLOR: string = '#375a7f';
    public static readonly CONVOY_PROTECTION_COLOR: string = '#6F64AA';
    // noinspection JSUnusedGlobalSymbols
    public static readonly NO_MISSION_COLOR: string = '#FF3336';
    // noinspection JSUnusedGlobalSymbols
    public static readonly MULTI_MISSION_COLOR: string = '#33F9FF';

    readonly message: string = 'loading mission map ...';

    isSpinnerActive: boolean = false;

    @Input()
    orbitDefinitions: LocalMapOrbitDefinition[] = [];

    @Input()
    missionTypes: MissionTypeEnum[] = MissionCommunicationService.missionTypes;

    coords: Coords[] = [];

    center?: Coords;

    hoveredSystem?: Coords;
    starSystem?: StarSystem;

    constructor(private route: ActivatedRoute,
                private spinner: NgxSpinnerService,
                private systemService: BackgroundService,
                private publicResourcesApiService: AssetsService,
                protected missionCommService: MissionCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {
        // unfortunately necessary in this constellation - ng destroy is called by ng template in tab view on tab switch
        const length = document.getElementById('mission-map')!.childNodes.length;
        if (length == 0) {
            // called twice but never cleared why
            const canvas = this.createCanvas("mission-canvas", '#mission-map');
            canvas.mouseover(this.mouseoverForCelestial).mouseout(this.mouseoutForCelestial);
            this.createUniverseMap();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        //if (changes['orbitDefinitions']) { fixme set up mission type change not as a redraw
        this.drawMap();
        //}
    }

    mouseoutForCelestial = () => {
        this.hoveredSystem = this.center;
        this.findStarSystemFromHover();
    }

    mouseoverForCelestial = (event: PointerEvent) => {
        let id = this.getIdFromEvent(event);
        if (!this.isCelestialId(id)) {
            return;
        }
        let celestial = <Coords>this.getCelestialObjectByID(id);
        if (!!celestial) {
            this.hoveredSystem = celestial;
        }
        this.findStarSystemFromHover();
    }

    private findStarSystemFromHover() {
        if (!!this.hoveredSystem) {
            const x = this.hoveredSystem.x;
            const y = this.hoveredSystem.y;
            const systems = this.missionCommService.systems.filter(sys => sys.orbit.xCoordinate.coordinate === x && sys.orbit.yCoordinate.coordinate === y);
            if (systems.length > 0) {
                this.starSystem = systems[0];
            }
        } else {
            this.starSystem = undefined;
        }
    }

    private createUniverseMap() {
        this.activateSpinner();

        let sub = this.systemService.getStarSystems().subscribe(resp => {
            this.coords = resp.map(sys => <Coords>{name: sys.name, x: sys.orbit.xCoordinate.coordinate, y: sys.orbit.yCoordinate.coordinate});
            this.drawMap();
        });
        this.subscriptions.push(sub);
    }

    private drawMap() {
        this.activateSpinner();

        this.clearData();

        if (this.orbitDefinitions.length == 0) {
            return;
        }

        this.center = this.orbitDefinitions.filter(sys => sys.isMain)[0].celestial;
        this.hoveredSystem = this.center;

        this.drawOrbits(this.orbitDefinitions);
        this.drawJunctions();
        this.findStarSystemFromHover();
        this.deactivateSpinner();
    }

    drawOrbits(orbits: LocalMapOrbitDefinition[]) {
        this.setOrbits(orbits);
        const homeDef = orbits.filter(od => od.isMain)[0];
        this.setViewBox(homeDef.celestial, 0.2);

        orbits.forEach(orbitDefinition => this.drawCelestial(orbitDefinition, this.missionTypes));
    }

    private activateSpinner() {
        if (!this.isSpinnerActive) {
            this.spinner.show('mission-map');
            this.isSpinnerActive = true;
        }
    }

    private deactivateSpinner() {
        this.spinner.hide('mission-map');
        this.isSpinnerActive = false;
    }

    private drawJunctions() {
        let sub = this.publicResourcesApiService.getAllWormholeJunctions().subscribe(junctions => {
            junctions.forEach(junction => {
                junction.termini.forEach(terminus => {
                    const mainCelestialGroup = this.getOrCreateMainCelestialGroup();
                    mainCelestialGroup
                        .line(junction.position.x, junction.position.y, terminus.x, terminus.y)
                        .addClass(MapData.RESIZE_ON_ZOOM_MARKER)
                        .addClass(MapData.WORMHOLE_MARKER)
                        .stroke({width: 1, color: 'irrelevant'});
                });
            });
        });
        this.subscriptions.push(sub);
    }
}
