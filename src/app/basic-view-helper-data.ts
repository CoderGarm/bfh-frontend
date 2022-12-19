import {SubscriptionManager} from "./SubscriptionManager";
import {AbstractId, CounterMissileHit, Distance, Fleet, FleetMarker, MissileMovement, Orbit, Planet, StarSystem, WarShip} from "./services/swagger";
import {Circle, G, Polygon, Shape, Svg, Text} from "@svgdotjs/svg.js";
import {RestrictedFleetArea} from "./modules/star-map/payload/restricted-fleet-area";
import {CelestialAreaDefinition} from "./modules/star-map/payload/celestial-area-definition";
import {AreaDefinition} from "./modules/star-map/area-definition";
import {OrbitDefinition} from "./modules/star-map/payload/orbit-definition";
import {NavigationCalculator} from "./NavigationCalculator";
import {Component} from "@angular/core";
import DistanceMetricEnum = Distance.DistanceMetricEnum;


@Component({
    template: ''
})
export class BasicViewHelperData extends SubscriptionManager {


    protected static readonly ORBIT_ID_MARKER = "orbitId-";
    protected static readonly GROUP_SELECTOR_SUFFIX: string = "-group";
    protected static readonly CYCLING_CIRCLE_SUFFIX = "-circle-cycle";
    protected static readonly MOVE_SUFFIX = "-move";

    protected static readonly CELESTIAL_BODY_SELECTOR_ID_PREFIX: string = "-orbit";
    protected static readonly ORBIT_SELECTOR_ID_PREFIX: string = "-orbit";
    protected static readonly FLEET_SHARK_SELECTOR_ID_PREFIX: string = "-fleet-shark";
    protected static readonly FLEET_COLLECTION_SELECTOR_ID_PREFIX: string = "-fleet-shark-collection";
    protected static readonly WARSHIP_SELECTOR_ID_PREFIX: string = "-warship";
    protected static readonly MISSILE_SALVO_SELECTOR_ID_PREFIX: string = "-missile-salvo";

    protected static readonly ICON_ID_MARKER: string = "iconId-";
    protected static readonly MOVABLE_STATE_DOT_MARKER: string = "movableStateDot";
    protected static readonly TEXT_MARKER: string = "svg-text";
    protected static readonly FLEET_SHARK_POLYGON_MARKER = "fleetSharkIcon";
    protected static readonly ROUND_CAP_MARKER = "colonizableMarker";
    protected static readonly RESIZE_ON_ZOOM_MARKER = "no-resize";
    protected static readonly STAR_MARKER = "star";
    protected static readonly STAR_IN_SYSTEM_MARKER = "star-in-system";
    protected static readonly HYPER_LIMIT_MARKER = "hyper-limit";
    protected static readonly ORBIT_MARKER = "orbit";
    protected static readonly CENTER_COORDINATES_MARKER = "center-";
    protected static readonly CENTER_COORDINATES_SEPARATOR = "|";

    private knownStarSystemByOrbit: Map<Orbit, StarSystem> = new Map<Orbit, StarSystem>();
    private planetByOrbit: Map<Orbit, Planet> = new Map<Orbit, Planet>();

    protected canvas?: Svg;

    private orbits?: Orbit[];

    private smallestXOrbit?: Orbit;
    private biggestXOrbit?: Orbit;
    private smallestYOrbit?: Orbit;
    private biggestYOrbit?: Orbit;

    protected radiusOfCoordinateCross?: number;
    protected hyperLimitRadius?: number;

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

    private areaDefinitions: AreaDefinition[] = [];
    private celestialAreas: CelestialAreaDefinition[] = [];


    constructor(protected standardDistanceMetric: DistanceMetricEnum) {
        super();
    }

    protected clearData() {
        this.celestialBodyById.clear();
        this.celestialOrbitById.clear();
        this.orbitsById.clear();
        this.fleetsById.clear();
        this.restrictedAreasByOrbitId.clear();
        this.groupsByID.clear();
        this.fleetsByText.clear();
        this.areaDefinitions = [];
        this.celestialAreas = [];
    }

    protected clearRestrictedAreas() {
        this.restrictedAreasByOrbitId.clear();
    }

    /**
     * sorts the systems by their orbit's radius
     * @private
     */
    protected sortByOrbit() {
        if (!this.orbits) {
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


    protected getFleetCollectionID(fleetMarkers: FleetMarker[]): string {
        let prefix: string = BasicViewHelperData.FLEET_COLLECTION_SELECTOR_ID_PREFIX;
        let sortedFleetIDs = fleetMarkers.map(f => f.fleet.id).sort((a, b) => a - b);
        let id = '';
        for (let i = 0; i < sortedFleetIDs.length; i++) {
            const fleetID = sortedFleetIDs[i];
            if (i > 0) {
                id += BasicViewHelperData.CENTER_COORDINATES_SEPARATOR;
            }
            id += fleetID;
        }
        return prefix + "-" + id;
    }

    protected getFleetSharkIDsFromCollectionID(collectionID: string): string[] {
        let prefix: string = BasicViewHelperData.FLEET_COLLECTION_SELECTOR_ID_PREFIX;
        if (!collectionID.startsWith(prefix)) {
            return [];
        }
        const payload = collectionID.replace(prefix, '').split("-")[1];
        const fleetIDs = payload.split(BasicViewHelperData.CENTER_COORDINATES_SEPARATOR);
        const fleetSharkIDs: string[] = [];
        fleetIDs.forEach(id => fleetSharkIDs.push(this.getFleetSharkID({id: Number.parseFloat(id)})));
        return fleetSharkIDs;
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
        let prefix: string = BasicViewHelperData.WARSHIP_SELECTOR_ID_PREFIX;
        let id = 'id' in warShip ? warShip.id : warShip.idWarship
        return prefix + "-" + id;
    }

    protected getMissileSalvoID(missileMovement: MissileMovement): string {
        let id: string = BasicViewHelperData.MISSILE_SALVO_SELECTOR_ID_PREFIX;
        return id + "-" + missileMovement.movingMissileSalvo + "-" + missileMovement.combatRoundKey.combatRound.no;
    }

    protected getMissileSalvoIDByHit(hit: CounterMissileHit): string {
        let id: string = BasicViewHelperData.MISSILE_SALVO_SELECTOR_ID_PREFIX;
        return id + "-" + hit.attackedMissileSalvo + "-" + hit.combatRoundKey.combatRound.no;
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

    protected getRestrictedArea(orbitID: string): RestrictedFleetArea[] | undefined {
        return this.restrictedAreasByOrbitId.get(orbitID);
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

    protected addCelestialArea(orbit: Orbit, orbitID: string) {
        this.celestialAreas.push(new CelestialAreaDefinition(orbit, orbitID, 50));
    }

    protected setOrbitById(orbitID: string, orbit: Orbit) {
        this.orbitsById.set(orbitID, orbit);
    }

    protected setOrbits(orbits: OrbitDefinition[]) {
        this.orbits = orbits.map(od => od.orbit);
    }

    protected addAreaDefinition(group: G) {
        this.areaDefinitions.push(new AreaDefinition(group));
    }

    protected setPlanetsByOrbit(system: StarSystem) {
        system.planets.forEach(p => this.planetByOrbit.set(p.orbit, p));
    }

    protected setKnownStarSystemByOrbit(system: StarSystem) {
        this.knownStarSystemByOrbit.set(system.orbit, system);
    }
}
