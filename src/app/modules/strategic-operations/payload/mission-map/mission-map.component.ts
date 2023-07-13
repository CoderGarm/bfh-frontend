import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {MapElementDrawer} from "./map-element-drawer";
import {ColorGroup, CoordsBlob, SimpleCoord} from "../mission-administration/mission-administration.component";
import {AssetsService, Coords} from "../../../../services/assets/assets.service";
import {MapData} from "./map-data.component";
import {LocalMapOrbitDefinition} from "./local-map-orbit-definition";
import {BackgroundService} from "../../../../services/prefetch/background.service";
import {StarSystem} from "../../../../services/swagger";
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";


@Component({
    selector: 'mission-map',
    templateUrl: './mission-map.component.html',
    styleUrls: ['./mission-map.component.scss']
})
export class MissionMapComponent extends MapElementDrawer implements AfterViewInit, OnChanges {

    public static readonly UN_FOCUSSED_COLOR: string = '#FB8C00';

    @Input()
    highlight?: ColorGroup[];

    colorByCircle: Map<string, string> = new Map<string, string>();

    @Input()
    highlightedCenter?: SimpleCoord;

    coords?: CoordsBlob;

    center?: Coords;

    hoveredSystem?: Coords;
    starSystem?: StarSystem;

    constructor(private route: ActivatedRoute,
                private systemService: BackgroundService,
                private publicResourcesApiService: AssetsService,
                protected missionCommService: MissionCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {
        // unfortunately necessary in this constellation - ng destroy is called by ng template in tab view on tab switch
        const length = document.getElementById('universe')!.childNodes.length;
        if (length == 0) {
            // called twice but never cleared why
            const canvas = this.createCanvas("universe-canvas", '#universe', 'ext-');
            canvas.mouseover(this.mouseoverForCelestial).mouseout(this.mouseoutForCelestial);
            this.createUniverseMap();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.detectHighlight();
    }

    private detectHighlight() {
        if (!!this.highlight) {
            this.highlight!.forEach(cg => {
                cg.simpleCoords.forEach(coord => {
                    const id = MissionMapComponent.getStarSystemCircleID(coord);
                    this.colorByCircle.set(id, cg.color);
                });
            });
        }
    }

    static getStarSystemCircleID(orbit: SimpleCoord): string {
        return MapData.CELESTIAL_BODY_SELECTOR_ID_PREFIX + "-" + orbit.x + "-" + orbit.y;
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
        this.clearData();

        let sub = this.systemService.getStarSystems().subscribe(resp => {
            this.coords = resp.map(sys => <Coords>{name: sys.name, x: sys.orbit.xCoordinate.coordinate, y: sys.orbit.yCoordinate.coordinate});
            const colors: Map<string, string> = new Map<string, string>();
            this.coords.forEach(coord => {
                let id = MissionMapComponent.getStarSystemCircleID(coord);
                const color = this.colorByCircle.has(id) ? this.colorByCircle.get(id) : MissionMapComponent.UN_FOCUSSED_COLOR;
                colors.set(id, color!);
            });

            if (!!this.highlightedCenter) {
                this.center = this.coords.filter(sys => MissionMapComponent.matches(this.highlightedCenter!, sys))[0];
            } else {
                this.center = this.coords.filter(sys => sys.name === 'Sol')[0];
            }
            this.hoveredSystem = this.center;

            let orbitDefinitions: LocalMapOrbitDefinition[] = LocalMapOrbitDefinition.getOrbitDefinitionsForExternalStarMap(this.center, this.coords, colors);
            this.drawOrbits(orbitDefinitions);
            this.drawJunctions();
            this.findStarSystemFromHover();
        });
        this.subscriptions.push(sub);
    }

    private adaptColorMap() {
        /* fixme hier weiter */
    }

    static matches(o1: Coords | SimpleCoord, o2: Coords | SimpleCoord) {
        return o1.x === o2.x && o1.y === o2.y;
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
