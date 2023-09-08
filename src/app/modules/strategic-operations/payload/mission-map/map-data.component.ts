import {Circle, G, Shape, Text} from "@svgdotjs/svg.js";
import {Component} from "@angular/core";
import {SubscriptionManager} from "../../../../subscription.manager";
import {LocalMapOrbitDefinition} from "./local-map-orbit-definition";
import {Coords} from "../mission-administration/mission-administration.component";


@Component({
    template: ''
})
export class MapData extends SubscriptionManager {

    protected static readonly CELESTIAL_MAIN_GROUP = 'celestial-main-group';
    protected static readonly HEAT_MAP_GROUP = 'heatMap-main-group';

    protected static readonly GROUP_SELECTOR_SUFFIX: string = "-group";
    protected static readonly CYCLING_CIRCLE_SUFFIX = "-circle-cycle";
    protected static readonly ORBIT_SUFFIX = "-orbit";

    protected static readonly CELESTIAL_BODY_SELECTOR_ID_PREFIX: string = "-celestial";
    protected static readonly ORBIT_SELECTOR_ID_PREFIX: string = "-orbit";

    protected static readonly CLICKABLE_CSS_CLASS = "clickable";
    protected static readonly OPAQUE_CSS_CLASS = "opaque";
    protected static readonly CYCLING_CIRCLE_MARKER = "circle-cycle";
    protected static readonly ICON_ID_MARKER: string = "iconId-";
    protected static readonly MOVABLE_STATE_DOT_MARKER: string = "movableStateDot";
    protected static readonly TEXT_MARKER: string = "svg-text";
    protected static readonly ROUND_CAP_MARKER = "roundCap";
    protected static readonly ROUND_CAP_SUFFIX = "-roundCapSuffix";
    protected static readonly RESIZE_ON_ZOOM_MARKER = "no-resize";
    protected static readonly WORMHOLE_MARKER = "wormhole";
    protected static readonly STAR_MARKER = "star";
    protected static readonly STAR_IN_SYSTEM_MARKER = "star-in-system";
    protected static readonly HEAT_MAP_MARKER = "heatMap";
    protected static readonly CENTER_COORDINATES_MARKER = "center-";
    protected static readonly CENTER_COORDINATES_SEPARATOR = "|";

    private orbits?: Coords[];

    protected smallestXOrbit?: Coords;
    protected biggestXOrbit?: Coords;
    protected smallestYOrbit?: Coords;
    protected biggestYOrbit?: Coords;

    protected radiusOfCoordinateCross?: number;

    private textById: Map<string, Text> = new Map<string, Text>();
    private celestialObjectById: Map<string, Coords> = new Map<string, Coords>();
    private celestialBodyById: Map<string, Circle> = new Map<string, Circle>();
    private celestialOrbitById: Map<string, Coords> = new Map<string, Coords>();
    private orbitsById: Map<string, Coords> = new Map<string, Coords>();

    private groupsByID: Map<string, G> = new Map<string, G>();

    constructor() {
        super();
    }

    protected clearData() {
        this.textById.clear();
        this.celestialObjectById.clear();
        this.celestialBodyById.clear();
        this.celestialOrbitById.clear();
        this.orbitsById.clear();
        this.groupsByID.clear();
    }

    protected getCelestialBodyIDs(): string[] {
        return Array.from(this.celestialBodyById.keys());
    }

    private sortByOrbit() {
        if (!this.orbits) {
            throw new Error("The orbits must be present to calculate the map view.");
        }
        let sortedByX: Coords[] = this.orbits.sort((a, b) => {
            return a.x < b.x ? -1 : 1;
        });
        this.smallestXOrbit = sortedByX[0];
        this.biggestXOrbit = sortedByX[sortedByX.length - 1];
        let sortedByY: Coords[] = this.orbits.sort((a, b) => {
            return a.y < b.y ? -1 : 1;
        });
        this.smallestYOrbit = sortedByY[0];
        this.biggestYOrbit = sortedByY[sortedByY.length - 1];
    }

    protected getWidestExpanse(): { x: number, y: number } {
        let x = 100;
        let y = 100;
        if (!!this.smallestXOrbit && !!this.smallestYOrbit && !!this.biggestXOrbit && !!this.biggestYOrbit) {
            // getting biggest, absolute coord because
            let minXCoord = Math.abs(this.smallestXOrbit.x);
            let maxXCoord = Math.abs(this.biggestXOrbit.x);
            x = Math.max(minXCoord, maxXCoord);
            let minYCoord = Math.abs(this.smallestYOrbit.y);
            let maxYCoord = Math.abs(this.biggestYOrbit.y);
            y = Math.max(minYCoord, maxYCoord);
        }
        return {x, y};
    }

    protected getOrDefaultZoomFactor(zoomFactor?: number) {
        if (!zoomFactor) {
            zoomFactor = 1;
        }
        return zoomFactor;
    }

    protected getOrbitID(orbit: Coords): string {
        return MapData.ORBIT_SELECTOR_ID_PREFIX + "-" + orbit.x + "-" + orbit.y;
    }

    protected getOrbitOfCelestialByID(id: string): Coords | undefined {
        return this.celestialOrbitById.get(id);
    }

    protected getCelestialByEvent(event: PointerEvent | MouseEvent): Circle | undefined {
        let id = this.getIdFromEvent(event);
        return this.getCelestialByID(id);
    }

    protected getCelestialByID(id: string): Circle | undefined {
        return this.celestialBodyById.get(id);
    }

    protected getCelestialObjectByID(id: string): Coords | undefined {
        return this.celestialObjectById.get(id);
    }

    protected getOrbitOfCelestialByEvent(event: PointerEvent | MouseEvent): Coords | undefined {
        let id = this.getIdFromEvent(event);
        return this.getOrbitOfCelestialByID(id);
    }

    protected getTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let id = this.getIdFromEvent(event);
        return this.getTextById(id);
    }

    protected getTextById(id: string) {
        return this.textById.get(id);
    }

    protected getIdFromEvent(event: PointerEvent | MouseEvent | any): string {
        let target: Shape = event.target as Shape;
        const id = target.id as unknown as string;
        if (!id) {
            const parent = event.composedPath()[1];
            return parent.id;
        }
        return id;
    }

    protected isCelestialId(id: string): boolean {
        return id.startsWith(MapData.CELESTIAL_BODY_SELECTOR_ID_PREFIX);
    }

    protected getCyclingCircleId(id: string) {
        return id + MapData.CYCLING_CIRCLE_SUFFIX;
    }

    protected getCelestialBodyID(orbit: Coords): string {
        return MapData.CELESTIAL_BODY_SELECTOR_ID_PREFIX + "-" + orbit.x + "-" + orbit.y;
    }

    protected setTextById(id: string, text: Text) {
        this.textById.set(id, text);
    }

    protected getGroupById(id: string): G | undefined {
        if (!id.endsWith(MapData.GROUP_SELECTOR_SUFFIX)) {
            id += MapData.GROUP_SELECTOR_SUFFIX;
        }
        return this.groupsByID.get(id);
    }

    protected setCelestialCircleById(celestialBodyID: string, circle: Circle) {
        this.celestialBodyById.set(celestialBodyID, circle);
    }

    protected setCelestialObjectById(celestialBodyID: string, celestial: Coords) {
        this.celestialObjectById.set(celestialBodyID, celestial);
    }

    protected setCelestialOrbitById(celestialBodyID: string, orbit: Coords) {
        this.celestialOrbitById.set(celestialBodyID, orbit);
    }

    protected setOrbitById(orbitID: string, orbit: Coords) {
        this.orbitsById.set(orbitID, orbit);
    }

    protected setOrbits(orbits: LocalMapOrbitDefinition[]) {
        this.orbits = orbits.map(od => od.celestial);
        this.sortByOrbit();
    }
}
