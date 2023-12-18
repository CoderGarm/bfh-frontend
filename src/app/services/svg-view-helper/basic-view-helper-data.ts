import {SubscriptionManager} from "../../subscription.manager";
import {AbstractId, CounterMissileHit, Distance, Fleet, FleetMarker, MissileMovement, Orbit, Planet, StarSystem, WarShip} from "../swagger";
import {ArrayXY, Circle, G, Polygon, Shape, Text} from "@svgdotjs/svg.js";
import {OrbitDefinition} from "../../modules/star-map/payload/orbit-definition";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Component} from "@angular/core";
import {RestrictedFleetArea} from "../../modules/star-map/payload/restricted-fleet-area";
import {Junction, NamedThing, SimpleCoord} from "../assets/assets.service";
import DistanceMetricEnum = Distance.DistanceMetricEnum;


@Component({
    template: ''
})
export class BasicViewHelperData extends SubscriptionManager {

    protected static readonly CELESTIAL_MAIN_GROUP = 'celestial-main-group';
    protected static readonly SUB_LAYER_GROUP = 'sub-layer-group';
    protected static readonly CONFIRMED_MOVE_GROUP = 'confirmed_move_group';

    protected static readonly ORBIT_ID_MARKER = "orbitId-";
    protected static readonly GROUP_SELECTOR_SUFFIX: string = "-group";
    protected static readonly CYCLING_CIRCLE_SUFFIX = "-circle-cycle";
    protected static readonly MOVE_SUFFIX = "-move";
    protected static readonly ORBIT_SUFFIX = "-orbit";

    protected static readonly CELESTIAL_BODY_SELECTOR_ID_PREFIX: string = "-orbit"; // todo strange things happen - needs to be unraveled
    protected static readonly ORBIT_SELECTOR_ID_PREFIX: string = "-orbit"; // todo strange things happen - needs to be unraveled
    protected static readonly FLEET_SHARK_MARKER: string = "fleet-shark";
    protected static readonly FLEET_SHARK_SELECTOR_ID_PREFIX: string = BasicViewHelperData.FLEET_SHARK_MARKER + "-icon";
    protected static readonly WARSHIP_SELECTOR_ID_PREFIX: string = "-warship";
    protected static readonly MISSILE_SALVO_SELECTOR_ID_PREFIX: string = "-missile-salvo";

    protected static readonly CLICKABLE_CSS_CLASS = "clickable";
    protected static readonly CELESTIAL_BODY_CSS_CLASS: string = "celestial";
    protected static readonly CYCLING_CIRCLE_MARKER = "circle-cycle";
    protected static readonly ICON_ID_MARKER: string = "iconId-";
    protected static readonly MOVABLE_STATE_DOT_MARKER: string = "movableStateDot";
    protected static readonly TEXT_MARKER: string = "svg-text";
    protected static readonly FLEET_SHARK_POLYGON_MARKER = "fleetSharkIcon";
    protected static readonly ROUND_CAP_MARKER = "roundCap";
    protected static readonly ROUND_CAP_SUFFIX = "-roundCapSuffix";
    protected static readonly RESIZE_ON_ZOOM_MARKER = "no-resize";
    protected static readonly WORMHOLE_MARKER = "wormhole";
    protected static readonly WORMHOLE_MARKER_ID_PREFIX = "wormholeName-";
    protected static readonly WORMHOLE_MARKER_ID_CONNECTOR = "^id^";
    protected static readonly WORMHOLE_HIGHLIGHT_MARKER = "wormhole-highlight";
    protected static readonly COURSE_PLOT_MARKER_ID_PREFIX = "course-plot-marker-";
    protected static readonly WAYPOINT_PLOT_MARKER = "waypoint-marker";
    protected static readonly COURSE_PLOT_MARKER = "course-plot";
    protected static readonly STAR_MARKER = "star";
    protected static readonly STAR_COLOR_MARKER = "star-color";
    protected static readonly STAR_IN_SYSTEM_MARKER = "star-in-system";
    protected static readonly HYPER_LIMIT_MARKER = "hyper-limit";
    protected static readonly ORBIT_MARKER = "orbit";
    protected static readonly CENTER_COORDINATES_MARKER = "center-";
    protected static readonly CENTER_COORDINATES_SEPARATOR = "|";

    private orbits: Orbit[] = [];
    private orbitDefinitions: OrbitDefinition[] = [];

    private smallestXOrbit?: Orbit;
    private biggestXOrbit?: Orbit;
    private smallestYOrbit?: Orbit;
    private biggestYOrbit?: Orbit;

    protected radiusOfCoordinateCross?: number;
    protected hyperLimitRadius?: number;

    private knownStarSystemByOrbit: Map<Orbit, StarSystem> = new Map<Orbit, StarSystem>();
    private planetByOrbit: Map<Orbit, Planet> = new Map<Orbit, Planet>();
    private textById: Map<String, Text> = new Map<String, Text>();
    private celestialObjectById: Map<String, Planet | StarSystem> = new Map<String, Planet | StarSystem>();
    private celestialBodyById: Map<String, Circle> = new Map<String, Circle>();
    private celestialOrbitById: Map<String, Orbit> = new Map<String, Orbit>();
    private orbitsById: Map<String, Orbit> = new Map<String, Orbit>();

    private fleetsById: Map<String, FleetMarker> = new Map<String, FleetMarker>();
    private fleetsByText: Map<Text, FleetMarker> = new Map<Text, FleetMarker>();
    private fleetPolygonsById: Map<String, Polygon> = new Map<String, Polygon>();

    private restrictedAreasByOrbitId: Map<String, RestrictedFleetArea[]> = new Map<String, RestrictedFleetArea[]>();
    private groupsByID: Map<String, G> = new Map<String, G>();

    constructor(protected standardDistanceMetric: DistanceMetricEnum) {
        super();
    }

    protected clearData() {
        this.knownStarSystemByOrbit.clear();
        this.planetByOrbit.clear();
        this.textById.clear();
        this.celestialObjectById.clear();
        this.celestialBodyById.clear();
        this.celestialOrbitById.clear();
        this.orbitsById.clear();
        this.fleetsById.clear();
        this.fleetsByText.clear();
        this.fleetPolygonsById.clear();
        this.restrictedAreasByOrbitId.clear();
        this.groupsByID.clear();
    }

    protected clearRestrictedAreas() {
        this.restrictedAreasByOrbitId.clear();
    }

    private sortByOrbit() {
        if (this.orbits.length == 0) {
            throw new Error("The orbits must be present to calculate the map view.");
        }
        let sortedByX: Orbit[] = this.orbits.sort((a, b) => {
            return a.xCoordinate.coordinate < b.xCoordinate.coordinate ? -1 : 1;
        });
        this.smallestXOrbit = sortedByX[0];
        this.biggestXOrbit = sortedByX[sortedByX.length - 1];
        let sortedByY: Orbit[] = this.orbits.sort((a, b) => {
            return a.yCoordinate.coordinate < b.yCoordinate.coordinate ? -1 : 1;
        });
        this.smallestYOrbit = sortedByY[0];
        this.biggestYOrbit = sortedByY[sortedByY.length - 1];
    }

    protected convertToStandardMetric(distance: Distance): number {
        return NavigationCalculator.convertDistanceToMetric(distance, this.standardDistanceMetric);
    }

    protected calculateHyperLimit(system: StarSystem) {
        const lightMinutesToHyperLimit = system.starClassType.lightMinutesToHyperLimit;
        const hyperRadius: Distance = {
            coordinate: lightMinutesToHyperLimit,
            distanceMetric: DistanceMetricEnum.LM
        }
        return this.convertToStandardMetric(hyperRadius);
    }

    protected getWidestExpanse(): { x: number, y: number } {
        let x = 100;
        let y = 100;
        if (!!this.smallestXOrbit && !!this.smallestYOrbit && !!this.biggestXOrbit && !!this.biggestYOrbit) {
            // getting biggest, absolute coord because
            let minXCoord = Math.abs(this.convertToStandardMetric(this.smallestXOrbit.xCoordinate));
            let maxXCoord = Math.abs(this.convertToStandardMetric(this.biggestXOrbit.xCoordinate));
            x = Math.max(minXCoord, maxXCoord);
            let minYCoord = Math.abs(this.convertToStandardMetric(this.smallestYOrbit.yCoordinate));
            let maxYCoord = Math.abs(this.convertToStandardMetric(this.biggestYOrbit.yCoordinate));
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

    protected defineFleetSharkPoints(x: number, y: number, zoomFactor?: number) {
        zoomFactor = this.getOrDefaultZoomFactor(zoomFactor);
        x += (10 / zoomFactor);
        let points: ArrayXY[] = [];
        points.push([x, y]);
        points.push([x + (20 / zoomFactor), y - (7.5 / zoomFactor)]);
        points.push([x + (15 / zoomFactor), y]);
        points.push([x + (20 / zoomFactor), y + (5 / zoomFactor)]);
        points.push([x, y]);
        return points;
    }

    protected createFleetSharkPoints(x: number, y: number, orbit: Orbit, zoomFactor?: number): ArrayXY[] {
        zoomFactor = this.getOrDefaultZoomFactor(zoomFactor);
        const xModifier = 20 / zoomFactor;
        const yModifier = 35 / zoomFactor;

        let points = this.defineFleetSharkPoints(x, y, zoomFactor);

        let restrictedArea = new RestrictedFleetArea(points);
        let orbitID = this.getOrbitID(orbit);
        if (!this.isOrbitIdInRestrictedAreas(orbitID)) {
            let areas = [];
            areas.push(restrictedArea);
            this.setRestrictedArea(orbitID, areas);
        } else {
            let areas = this.getRestrictedArea(orbitID)!;
            let restrictedAreas: RestrictedFleetArea[] = areas.filter(area => area.collides(points));
            const length = restrictedAreas.length;
            if (length != 0) {
                if (length % 2 === 0) {
                    x += xModifier * length;
                } else {
                    x += xModifier * (length - 1);
                    y += yModifier;
                }
                points = this.defineFleetSharkPoints(x, y, zoomFactor);
            }
            areas.push(restrictedArea);
        }
        return points;
    }

    protected sortPoints(points: ArrayXY[]) {
        let sortedPointsX = points.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = points.sort((a, b) => a[1] < b[1] ? 1 : -1);
        return {sortedPointsX, sortedPointsY};
    }

    protected getUpperRightCornerPosition(sortedPointsX: ArrayXY[], sortedPointsY: ArrayXY[]) {
        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];
        return {xText, yText};
    }

    protected getOrbitID(orbit: Orbit): string {
        return BasicViewHelperData.ORBIT_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
    }

    protected getOrbitOfCelestialByID(id: string): Orbit | undefined {
        return this.celestialOrbitById.get(id);
    }

    protected getFleetByText(text: Text): FleetMarker | undefined {
        return this.fleetsByText.get(text);
    }

    protected getFleetByID(id: string): FleetMarker | undefined {
        return this.fleetsById.get(id);
    }

    protected getCelestialByEvent(event: PointerEvent | MouseEvent): Circle | undefined {
        let id = this.getIdFromEvent(event);
        return this.getCelestialByID(id);
    }

    protected getCelestialByID(id: string): Circle | undefined {
        return this.celestialBodyById.get(id);
    }

    protected getCelestialObjectByID(id: string): Planet | StarSystem | undefined {
        return this.celestialObjectById.get(id);
    }

    protected getFleetSharkByID(id: string): Polygon | undefined {
        return this.fleetPolygonsById.get(id);
    }

    protected getOrbitOfCelestialByEvent(event: PointerEvent | MouseEvent): Orbit | undefined {
        let id = this.getIdFromEvent(event);
        return this.getOrbitOfCelestialByID(id);
    }

    protected getTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let id = this.getIdFromEvent(event);
        return this.textById.get(id);
    }

    protected getFleetByEvent(event: PointerEvent | MouseEvent | any): FleetMarker | undefined {
        let id = this.getIdFromEvent(event);
        let fleet = this.getFleetByID(id);
        if (!fleet) {
            const text = this.getTextByEvent(event);
            if (!!text) {
                fleet = this.getFleetByText(text);
            }
        }
        return fleet;
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
        return id.startsWith(BasicViewHelperData.CELESTIAL_BODY_SELECTOR_ID_PREFIX);
    }

    protected isFleetSharkId(id: string): boolean {
        return id.startsWith(BasicViewHelperData.FLEET_SHARK_SELECTOR_ID_PREFIX);
    }

    protected getCyclingCircleId(id: string) {
        return id + BasicViewHelperData.CYCLING_CIRCLE_SUFFIX;
    }

    protected getIdForWormhole(junction: Junction, terminus: NamedThing) {
        return BasicViewHelperData.WORMHOLE_MARKER_ID_PREFIX + this.getWormholeTrip(junction) + BasicViewHelperData.WORMHOLE_MARKER_ID_CONNECTOR + terminus.name;
    }

    private getWormholeTrip(junction: Junction) {
        let name = junction.nexus.name;
        junction.termini.forEach(terminus => name += '|' + terminus.name);
        return name;
    }

    protected getFleetSharkID(fleet: Fleet | AbstractId | FleetMarker): string {
        let prefix: string = BasicViewHelperData.FLEET_SHARK_SELECTOR_ID_PREFIX;
        let id;
        if ('fleet' in fleet) {
            id = fleet.fleet.id;
        }
        if ('id' in fleet) {
            id = fleet.id;
        }
        if ('idFleet' in fleet) {
            id = fleet.idFleet;
        }
        return prefix + "-" + id;
    }

    protected getWarshipID(warShip: WarShip | AbstractId): string {
        let id = 'id' in warShip ? warShip.id : warShip.idWarship
        return BasicViewHelperData.WARSHIP_SELECTOR_ID_PREFIX + "-" + id;
    }

    protected getMissileSalvoID(missileMovement: MissileMovement): string {
        return BasicViewHelperData.MISSILE_SALVO_SELECTOR_ID_PREFIX + "-" + missileMovement.movingMissileSalvo + "-" + missileMovement.combatRoundKey.combatRound.no;
    }

    protected getMissileSalvoIDByHit(hit: CounterMissileHit): string {
        return BasicViewHelperData.MISSILE_SALVO_SELECTOR_ID_PREFIX + "-" + hit.attackedMissileSalvo + "-" + hit.combatRoundKey.combatRound.no;
    }

    protected getCelestialBodyID(orbit: Orbit): string {
        return BasicViewHelperData.CELESTIAL_BODY_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
    }

    protected setTextById(id: string, text: Text) {
        this.textById.set(id, text);
    }

    protected setFleetTextByMarker(text: Text, fleetMarker: FleetMarker) {
        this.fleetsByText.set(text, fleetMarker);
    }

    protected setFleetById(fleetSharkID: string, fleetMarker: FleetMarker) {
        this.fleetsById.set(fleetSharkID, fleetMarker);
    }

    protected setFleetPolygonById(fleetSharkID: string, fleetShark: Polygon) {
        this.fleetPolygonsById.set(fleetSharkID, fleetShark);
    }

    protected setGroupById(id: string, group: G) {
        this.groupsByID.set(id, group);
    }

    protected getGroupById(id: string): G | undefined {
        if (!id.endsWith(BasicViewHelperData.GROUP_SELECTOR_SUFFIX)) {
            id += BasicViewHelperData.GROUP_SELECTOR_SUFFIX;
        }
        return this.groupsByID.get(id);
    }

    protected getKnownStarSystemByOrbit(orbitByID: Orbit): StarSystem | undefined {
        return this.knownStarSystemByOrbit.get(orbitByID);
    }

    protected getPlanetByOrbit(orbitByID: Orbit): Planet | undefined {
        return this.planetByOrbit.get(orbitByID);
    }

    protected setRestrictedArea(orbitID: string, areas: any[]) {
        this.restrictedAreasByOrbitId.set(orbitID, areas);
    }

    protected getRestrictedArea(orbitID: string): RestrictedFleetArea[] {
        let areas = this.restrictedAreasByOrbitId.get(orbitID);
        if (!areas) {
            areas = [];
            this.setRestrictedArea(orbitID, areas);
        }
        return areas;
    }

    protected isOrbitIdInRestrictedAreas(orbitID: string) {
        return this.restrictedAreasByOrbitId.has(orbitID);
    }

    protected setCelestialCircleById(celestialBodyID: string, circle: Circle) {
        this.celestialBodyById.set(celestialBodyID, circle);
    }

    protected setCelestialObjectById(celestialBodyID: string, celestial: Planet | StarSystem) {
        this.celestialObjectById.set(celestialBodyID, celestial);
    }

    protected setCelestialOrbitById(celestialBodyID: string, orbit: Orbit) {
        this.celestialOrbitById.set(celestialBodyID, orbit);
    }

    protected setOrbitById(orbitID: string, orbit: Orbit) {
        this.orbitsById.set(orbitID, orbit);
    }

    protected setOrbits(orbits: OrbitDefinition[]) {
        this.orbitDefinitions = orbits;
        this.orbits = orbits.map(od => od.orbit);
        this.sortByOrbit();
    }

    protected setPlanetsByOrbit(system: StarSystem) {
        system.planets.forEach(p => this.planetByOrbit.set(p.orbit, p));
    }

    protected setKnownStarSystemByOrbit(system: StarSystem) {
        this.knownStarSystemByOrbit.set(system.orbit, system);
    }

    protected getFleetGroups() {
        return Array.from(this.groupsByID.values()).filter(g => g.id().startsWith(BasicViewHelperData.FLEET_SHARK_MARKER) && g.id().endsWith(BasicViewHelperData.GROUP_SELECTOR_SUFFIX));
    }

    protected clearFleetGroups() {
        const groups = this.getFleetGroups();
        groups.forEach(g => this.groupsByID.delete(g.id()));
    }

    protected getBySystemName(name: string): SimpleCoord | undefined {
        let filteredByName = this.orbitDefinitions.filter(c => BasicViewHelperData.compareSystemNames(c.name, name));
        if (filteredByName.length == 0) {
            console.log("A system for the name wasn't found: " + name);
            return undefined;
        }
        const o = filteredByName[0];
        return {
            x: this.convertToStandardMetric(o.orbit.xCoordinate),
            y: this.convertToStandardMetric(o.orbit.yCoordinate)
        };
    }

    static compareSystemNames(o1: string, o2: string) {
        return BasicViewHelperData.stripSystemName(o1) === BasicViewHelperData.stripSystemName(o2);
    }

    static stripSystemName(name: string) {
        return name
            .replace('-System', '')
            .replace('_System', '')
            .replace('system', '')
            .replace('System', '')
            .replace('Stern', '')
            .replace('Star', '')
            .replace('Neu', '')
            .replace('New', '')
            .replace('_', '')
            .replace('-', '')
            .replace(' ', '')
            .replace('’', '')
            .replace("'", '')
            .trim()
            .toLowerCase();
    }
}
