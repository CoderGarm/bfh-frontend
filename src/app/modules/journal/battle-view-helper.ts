import {ArrayXY, CurveCommand, LineCommand, PathArrayAlias, Polygon} from "@svgdotjs/svg.js";
import {
    AbstractId,
    BattleReport,
    CounterMissileHit,
    Distance,
    FleetMarker,
    FleetOrbit,
    HitLog,
    Launcher,
    MissileMovement,
    MovementAction,
    Orbit,
    Planet,
    ReleasedVolley,
    ShipKillerHit,
    StarSystem
} from "../../services/swagger";
import {OrbitDefinition} from "../star-map/payload/orbit-definition";
import {BasicViewHelper} from "../../basic-view-helper";
import {CombatArenaData} from "./components/payload/combat-arena/combat-arena.component";
import {NavigationCalculator} from "../../NavigationCalculator";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import WeaponTypeEnum = Launcher.WeaponTypeEnum;
import ResultEnum = ShipKillerHit.ResultEnum;

export class BattleViewHelper extends BasicViewHelper {

    private static readonly STANDARD_METRIC = DistanceMetricEnum.LS;

    /**
     * The multiplier is just to make all relevant distances and positions more visible.
     */
    private readonly POSITION_MULTIPLIER = 20;
    private readonly BATTLE_COORDINATE_SYSTEM_RADIUS = 50;

    battleReport?: BattleReport;
    combatArenaData?: CombatArenaData;

    private orbitForViewBox: Orbit | undefined;
    private viewBoxForOrbit: string = "0 0 0 0";

    private warshipsById: Map<String, AbstractId> = new Map<String, AbstractId>();
    private warshipPolygonsById: Map<String, Polygon> = new Map<String, Polygon>();
    private missileSalvoPolygonsById: Map<String, Polygon[]> = new Map<String, Polygon[]>();

    constructor() {
        super(BattleViewHelper.STANDARD_METRIC);
    }

    protected setBattleReport(report: BattleReport | undefined) {
        this.battleReport = report;
    }

    setActiveRound(activeRound: number | undefined,
                   starSystem: StarSystem,
                   clickForFleet: (event: PointerEvent) => void,
                   mouseoverForWarship: (event: PointerEvent) => void) {
        this.clearData();
        this.drawOrbits(starSystem);
        if (!activeRound || !this.combatArenaData) {
            console.log("no active round selected: ", activeRound);
            return;
        }

        const movementByFleet = this.combatArenaData.movementsByRound.get(activeRound);
        if (!!movementByFleet) {
            this.setFleetsInBattle(movementByFleet, activeRound, this.combatArenaData.hitLogsByRound, clickForFleet, mouseoverForWarship);
        }
        let missileMovements = this.combatArenaData.missileMovementsByRound.get(activeRound);
        if (!!missileMovements) {
            this.setMissileMovements(missileMovements);
        }
        let volleys = this.combatArenaData.volleysByRound.get(activeRound);
        if (!!volleys) {
            this.setReleasedVolleys(volleys);
        }
        let shipKillerHits = this.combatArenaData.shipKillerHitsByRound.get(activeRound);
        if (!!shipKillerHits) {
            this.setShipKillerHits(shipKillerHits);
        }
        let counterMissileHits = this.combatArenaData.counterMissileHitsByRound.get(activeRound);
        if (!!counterMissileHits) {
            this.setCounterMissileHits(counterMissileHits);
        }
    }

    private setCounterMissileHits(shipKillerHits: CounterMissileHit[]) {
        shipKillerHits.forEach((hit) => {
            let attackedMissileSalvo = this.getMissileSalvoIDByHit(hit);
            let destroyedMissiles = hit.destroyedMissiles;
            let color = "orange";

            let polygons = this.missileSalvoPolygonsById.get(attackedMissileSalvo);
            if (!polygons) {
                return;
            }
            for (let i = 0; i < destroyedMissiles; i++) {
                // if this is an index out of bound, the backend had failed
                let icon = polygons[i];
                if (!icon) {
                    continue;
                }
                const x = icon.x();
                const y = icon.y();
                let explosionOutlines = this.createExplosionOutlines(x, y, 20);
                this.canvas!.polygon(explosionOutlines).addClass("explosion").fill(color);
            }
        });
    }

    private setShipKillerHits(shipKillerHits: ShipKillerHit[]) {
        shipKillerHits.forEach((hit) => {

            let result = hit.result;
            let color = "yellow";
            if (result === ResultEnum.DAMAGEAPPLIED) {
                color = "orange";
            }

            hit.hitLogs.forEach(hitLog => {
                let warshipID = this.getWarshipID(hitLog.warShip);
                let icon = this.warshipPolygonsById.get(warshipID);
                if (!icon) {
                    return;
                }
                const x = icon.x();
                const y = icon.y();
                let explosionOutlines = this.createExplosionOutlines(x, y, 10);
                this.canvas!.polygon(explosionOutlines).addClass("explosion").fill(color);
            });
        });
    }

    /**
     * Returns an array to represent an explosion icon.
     *
     * @private
     * @param x
     * @param y
     * @param scale
     */
    private createExplosionOutlines(x: number, y: number, scale: number): ArrayXY[] {
        // 500 pixel radius from the orbits coordinate cross
        let points: ArrayXY[] = [];
        points.push([-5, 30]);
        points.push([12, 70]);
        points.push([16, 20]);
        points.push([25, 20]);
        points.push([10, 10]);
        points.push([50, 0]);
        points.push([20, -14]);
        points.push([40, -35]);
        points.push([14, -25]);
        points.push([11, -50]);
        points.push([0, -35]);
        points.push([-19, -60]);
        points.push([-15, -30]);
        points.push([-30, -38]);
        points.push([-20, -10]);
        points.push([-35, -5]);
        points.push([-30, 7]);
        points.push([-50, 30]);
        points.push([-10, 20]);
        points.push([-7, 38]);
        points.push([-5, 30]);
        let result: ArrayXY[] = [];
        points.forEach(p => {
            result.push([
                this.addAndScale(x, p[0], scale),
                this.addAndScale(y, p[1], scale)
            ])
        })
        return result;
    }

    private setMissileMovements(volleys: MissileMovement[]) {
        const baseOrbit = this.createBaseOrbit();

        volleys.forEach((volley) => {
            let missileOutlines: Array<ArrayXY[]> = this.defineMissileHullPoints(volley, baseOrbit);
            let missileSalvoID = this.getMissileSalvoID(volley);
            this.createMissileHullOutlinesAndPrint(missileSalvoID, missileOutlines, volley.actorOwner.id);
        });
    }

    private createMissileHullOutlinesAndPrint(missileSalvoId: string,
                                              missileHullPoints: Array<ArrayXY[]>,
                                              fleetOwnerId: number) {
        let group = this.canvas?.group()
            .id(missileSalvoId + BasicViewHelper.GROUP_SELECTOR_SUFFIX);

        this.setGroupById(missileSalvoId + BasicViewHelper.GROUP_SELECTOR_SUFFIX, group!);

        let userID = this.tokenStorage.getUserID();
        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (fleetOwnerId == userID) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }
        const stroke = {color: fleetSharkColor, width: 1};
        for (let i = 0; i < missileHullPoints.length; i++) {
            let missileHullPoint = missileHullPoints[i];
            let icon = group!.polygon(missileHullPoint).id(missileSalvoId).fill(BasicViewHelper.NONE_FILL_COLOR).stroke(stroke);
            let polygons = this.missileSalvoPolygonsById.get(missileSalvoId);
            if (!polygons) {
                polygons = [];
            }
            polygons.push(icon);
            this.missileSalvoPolygonsById.set(missileSalvoId, polygons);
        }
        this.canvas?.add(group!);
    }

    /**
     * Returns an array per ship with an array of point groups inside.<br>
     * The outer array is a missile - the inner array are for the outline coordinates of the missile itself.
     *
     * @param missileMovement
     * @param centerOrbit the center of the local coordinate system
     * @private
     */
    private defineMissileHullPoints(missileMovement: MissileMovement, centerOrbit: Orbit): Array<ArrayXY[]> {
        // 500 pixel radius from the orbits coordinate cross

        let lastPosition = missileMovement.lastPosition;
        let position = missileMovement.position;

        // determine direction of missile icons
        let flip: boolean = lastPosition.xCoordinate.coordinate < position.xCoordinate.coordinate;

        position = this.modifyOrbit(position, centerOrbit, this.POSITION_MULTIPLIER);
        const yShift = 1.5;
        const xShift = 7.5;


        const result: Array<ArrayXY[]> = [];
        let horizontalLift = 0;
        let verticalLift = 0;

        let x = this.convertToStandardMetric(position.xCoordinate);
        let y = this.convertToStandardMetric(position.yCoordinate);
        let modifiedX = (missileMovement.missileAmount / 2 * xShift);
        let modifiedY = (missileMovement.missileAmount / 2 * yShift) + yShift;
        let upDownY = y < this.convertToStandardMetric(centerOrbit.yCoordinate) ? -1 : 0;
        let baseX = x - modifiedX;
        let baseY = y + (modifiedY * upDownY);
        for (let i = 1; i <= missileMovement.missileAmount; i++) {
            let x: number = baseX + verticalLift;
            let y: number = baseY + horizontalLift;
            let hullOutlines = this.createMissileOutlines(x, y, flip);
            result.push(hullOutlines);
            horizontalLift += yShift;
            verticalLift += xShift;
        }
        return result;
    }

    private createMissileOutlines(x: number, y: number, flip: boolean): ArrayXY[] {
        const direction = flip ? -1 : 1;
        let points: ArrayXY[] = [];
        points.push([x, y]);
        points.push([x + 2 * direction, y - .75]);
        points.push([x + 1.5 * direction, y]);
        points.push([x + 2 * direction, y + .5]);
        points.push([x, y]);
        return points;
    }

    private setReleasedVolleys(volleys: ReleasedVolley[]) {
        volleys.forEach((volley) => {
            let damageDealerId = volley.damageDealer;
            let shooter = volley.actor;
            let shooterID = this.getFleetSharkID(shooter) + BasicViewHelper.GROUP_SELECTOR_SUFFIX;
            let shooterG = this.getGroupById(shooterID);

            let target = volley.target;
            let targetID = this.getFleetSharkID(target) + BasicViewHelper.GROUP_SELECTOR_SUFFIX;
            let targetG = this.getGroupById(targetID);
            if (!shooterG || !targetG) {
                return;
            }

            let weaponType = volley.weaponType;
            if (weaponType === WeaponTypeEnum.MISSILE) {

            }
            if (weaponType === WeaponTypeEnum.COUNTERMISSILE) {

            }
            if (weaponType === WeaponTypeEnum.BEAM || weaponType === WeaponTypeEnum.MISSILE) {
                this.canvas!
                    .line([[shooterG.cx(), shooterG.cy()], [targetG.cx(), targetG.cy()]])
                    .addClass("beamVolley")
                    .id(damageDealerId);
            }
            if (weaponType === WeaponTypeEnum.POINTDEFENSE) {

            }
        });
    }

    private setFleetsInBattle(fleetsInMotion: MovementAction[],
                              activeRound: number,
                              hitLogsByRound: Map<number, HitLog[]>,
                              clickForFleet: (event: PointerEvent) => void,
                              mouseoverForWarship: (event: PointerEvent) => void) {
        const baseOrbit = this.createBaseOrbit();

        fleetsInMotion.forEach((move) => {
            let fleet = move.actor;
            let startOrbit = move.origin;
            let targetOrbit = move.destination;
            if (!startOrbit || !targetOrbit) {
                return;
            }
            // expanding the coordinates by the multiplier but center it at the combat orbit
            startOrbit = this.modifyOrbit(startOrbit, baseOrbit, this.POSITION_MULTIPLIER);
            // todo what to do? targetOrbit = this.modifyOrbit(targetOrbit, baseOrbit, this.POSITION_MULTIPLIER);

            const fightingWarships: AbstractId[] = this.getFightingWarships(fleet, activeRound, hitLogsByRound);
            let warshipHullPoints: Array<Array<ArrayXY[]>> = this.defineWarshipHullPoints(fightingWarships, startOrbit, baseOrbit);
            this.createHullOutlinesAndPrint(fleet, fightingWarships, warshipHullPoints, clickForFleet, mouseoverForWarship);
        });
    }

    private getFightingWarships(fleet: FleetMarker, activeRound: number, hitLogsByRound: Map<number, HitLog[]>) {
        let hitLogs: HitLog[] = [];
        for (let i = 1; i <= activeRound; i++) {
            const logsPerRound = hitLogsByRound.get(i);
            if (!!logsPerRound) {
                logsPerRound.forEach(l => hitLogs.push(l));
            }
        }
        let warShips = fleet.ships;
        let destroyedWarships = warShips.filter(warShip => !!hitLogs.find(value => {
            let isSameShip = warShip.id == value.warShip.id;
            let canFight = value.isFightingCapable && value.isAlive;
            return !canFight && isSameShip;
        }));
        const warshipsToDisplay: AbstractId[] = [];
        warShips.forEach(warShip => {
            if (destroyedWarships.indexOf(warShip) == -1) {
                warshipsToDisplay.push(warShip);
            }
        });
        return warshipsToDisplay;
    }

    /**
     * Centers the given orbit to the base orbit - it's a simple galileo transformation.
     * @param orbit
     * @param baseOrbit
     * @param multiplier
     * @private
     */
    private modifyOrbit(orbit: Orbit, baseOrbit: Orbit, multiplier: number): Orbit {
        let orbX = this.convertToStandardMetric(orbit.xCoordinate);
        let baseX = this.convertToStandardMetric(baseOrbit.xCoordinate);
        let orbY = this.convertToStandardMetric(orbit.yCoordinate);
        let baseY = this.convertToStandardMetric(baseOrbit.yCoordinate);
        return {
            xCoordinate: {
                coordinate: (baseX - orbX) + orbX * multiplier,
                distanceMetric: this.STANDARD_METRIC
            },
            yCoordinate: {
                coordinate: (baseY - orbY) + orbY * multiplier,
                distanceMetric: this.STANDARD_METRIC
            }
        };
    }

    private createBaseOrbit() {
        return !!this.battleReport ? this.battleReport.battleReportStatistics.orbit!.orbit! : {
            xCoordinate: {coordinate: 0, distanceMetric: DistanceMetricEnum.LS},
            yCoordinate: {coordinate: 0, distanceMetric: DistanceMetricEnum.LS}
        };
    }

    /**
     * creates a fleet shark, a text and groups them in the svg
     */
    private createHullOutlinesAndPrint(fleet: FleetMarker,
                                       warships: AbstractId[],
                                       warshipHullPoints: Array<Array<ArrayXY[]>>,
                                       clickForFleet: (event: PointerEvent) => void,
                                       mouseoverForWarship: (event: PointerEvent) => void) {
        let fleetSharkID = this.getFleetSharkID(fleet);

        // set events to canvas to reset effect
        this.canvas?.click(clickForFleet).mouseover(mouseoverForWarship);

        let group = this.canvas?.group()
            .click(clickForFleet)
            .id(fleetSharkID + BasicViewHelper.GROUP_SELECTOR_SUFFIX);

        this.setFleetById(fleetSharkID, fleet);
        this.setGroupById(fleetSharkID + BasicViewHelper.GROUP_SELECTOR_SUFFIX, group!);

        let userID = this.tokenStorage.getUserID();
        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (fleet.owner.id == userID) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }
        // sort by is to display the names in a non-permuting way
        warships = warships.sort((a, b) => a.id > b.id ? 1 : -1);
        for (let i = 0; i < warshipHullPoints.length; i++) {
            let warshipHullPoint = warshipHullPoints[i];
            let warship = warships[i];
            let warshipID = this.getWarshipID(warship);
            this.warshipsById.set(warshipID, warship);

            const mergedPoints: ArrayXY[] = [];
            warshipHullPoint.forEach(p => p.forEach(i => mergedPoints.push(i)));

            this.setFleetById(warshipID, fleet);

            warshipHullPoint.forEach(hullElements => {
                let polygon = group!.polygon(hullElements)
                    .id(warshipID)
                    .fill(fleetSharkColor)
                    .click(clickForFleet)
                    .mouseover(mouseoverForWarship);
                this.warshipPolygonsById.set(warshipID, polygon);

            });
        }
        this.canvas?.add(group!);
    }

    /**
     * Returns an array per ship with an array of point groups inside.<br>
     * The outer array is a ship - the next inner array are for the different hull elements,<br>
     * the array of points is the outline coordinates itself.
     *
     * @param warShips
     * @param orbit
     * @param centerOrbit the center of the local coordinate system
     * @private
     */
    private defineWarshipHullPoints(warShips: AbstractId[], orbit: Orbit, centerOrbit: Orbit): Array<Array<ArrayXY[]>> {
        // 500 pixel radius from the orbits coordinate cross

        const yShift = 15 / 2;
        const xShift = 75 / 2;

        const result: Array<Array<ArrayXY[]>> = [];
        let horizontalLift = 0;
        let verticalLift = 0;

        let x = this.convertToStandardMetric(orbit.xCoordinate);
        let y = this.convertToStandardMetric(orbit.yCoordinate);
        let modifiedX = (warShips.length / 2 * xShift);
        let modifiedY = (warShips.length / 2 * yShift) + yShift;
        let upDownY = y < this.convertToStandardMetric(centerOrbit.yCoordinate) ? -1 : 0;
        let baseX = x - modifiedX;
        let baseY = y + (modifiedY * upDownY);
        for (let i = 0; i < warShips.length; i++) {
            let x: number = baseX + verticalLift;
            let y: number = baseY + horizontalLift;
            let hullOutlines = this.createHullOutlines(x, y);
            result.push(hullOutlines);
            horizontalLift += yShift;
            verticalLift += xShift;
        }
        return result;
    }

    private addAndScale(coord: number, additional: number, scale: number) {
        return coord + (additional / scale);
    }

    private createHullOutlines(x: number, y: number): Array<ArrayXY[]> {
        const result: Array<ArrayXY[]> = [];
        let lines: ArrayXY[];
        lines = []; // upper bow
        let scale = 2;
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 2, scale)]);
        lines.push([this.addAndScale(x, 55, scale), this.addAndScale(y, 3, scale)]);
        lines.push([this.addAndScale(x, 55, scale), this.addAndScale(y, 1.5, scale)]);
        lines.push([this.addAndScale(x, 59, scale), this.addAndScale(y, 1.5, scale)]);
        lines.push([this.addAndScale(x, 65, scale), this.addAndScale(y, 3.5, scale)]);
        lines.push([this.addAndScale(x, 65, scale), this.addAndScale(y, 5.5, scale)]);
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 5.5, scale)]);
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 2, scale)]);
        let upperBowPoints = lines;
        result.push(upperBowPoints);

        lines = [];
        lines.push([this.addAndScale(x, 35, scale), this.addAndScale(y, 2, scale)]);  // upper broadside
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 2, scale)]);
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 5.5, scale)]);
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 5.5, scale)]);
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 2, scale)]);
        lines.push([this.addAndScale(x, 35, scale), this.addAndScale(y, 2, scale)]);
        let upperBroadsidePoints = lines;
        result.push(upperBroadsidePoints);

        lines = []; // upper stern
        lines.push([this.addAndScale(x, 5, scale), this.addAndScale(y, 5.5, scale)]);
        lines.push([this.addAndScale(x, 5, scale), this.addAndScale(y, 3.5, scale)]);
        lines.push([this.addAndScale(x, 11, scale), this.addAndScale(y, 1.5, scale)]);
        lines.push([this.addAndScale(x, 15, scale), this.addAndScale(y, 1.5, scale)]);
        lines.push([this.addAndScale(x, 15, scale), this.addAndScale(y, 3, scale)]);
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 2, scale)]);
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 5.5, scale)]);
        lines.push([this.addAndScale(x, 5, scale), this.addAndScale(y, 5.5, scale)]);
        let upperSternPoints = lines;
        result.push(upperSternPoints);

        // todo outline by class?
        lines = []; // lower stern
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 6.5, scale)]);
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 10, scale)]);
        lines.push([this.addAndScale(x, 15, scale), this.addAndScale(y, 9, scale)]);
        lines.push([this.addAndScale(x, 15, scale), this.addAndScale(y, 10.5, scale)]);
        lines.push([this.addAndScale(x, 11, scale), this.addAndScale(y, 10.5, scale)]);
        lines.push([this.addAndScale(x, 5, scale), this.addAndScale(y, 8.5, scale)]);
        lines.push([this.addAndScale(x, 5, scale), this.addAndScale(y, 6.5, scale)]);
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 6.5, scale)]);
        let lowerSternPoints = lines;
        result.push(lowerSternPoints);

        lines = [];
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 10, scale)]); // lower broadside
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 6.5, scale)]);
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 6.5, scale)]);
        lines.push([this.addAndScale(x, 20, scale), this.addAndScale(y, 10, scale)]);
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 10, scale)]);
        let lowerBroadsidePoints = lines;
        result.push(lowerBroadsidePoints);

        lines = [];
        lines.push([this.addAndScale(x, 65, scale), this.addAndScale(y, 6.5, scale)]); // lower bow
        lines.push([this.addAndScale(x, 65, scale), this.addAndScale(y, 8.5, scale)]);
        lines.push([this.addAndScale(x, 59, scale), this.addAndScale(y, 10.5, scale)]);
        lines.push([this.addAndScale(x, 55, scale), this.addAndScale(y, 10.5, scale)]);
        lines.push([this.addAndScale(x, 55, scale), this.addAndScale(y, 9, scale)]);
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 10, scale)]);
        lines.push([this.addAndScale(x, 50, scale), this.addAndScale(y, 6.5, scale)]);
        let lowerBowPoints = lines;
        result.push(lowerBowPoints);
        return result;
    }

    /**
     * returns the view box string for the svg
     */
    public setViewBoxByFleetOrbit(orbit: FleetOrbit) {
        if (!!this.radiusOfCoordinateCross) {
            let viewBoxDef: string = "0 0 0 0";
            // translate the center coords basically to the planetary center*
            let c = orbit.orbit;
            if (!c) {
                this.setViewBox(undefined, 0.7);
                return;
            }
            if (!!this.orbitForViewBox && NavigationCalculator.isSameOrbit(this.orbitForViewBox, c)) {
                // no change needed
                return;
            }

            let x = this.convertToStandardMetric(c.xCoordinate);
            let y = this.convertToStandardMetric(c.yCoordinate);

            let width = this.radiusOfCoordinateCross! * 0.9;
            let height = this.radiusOfCoordinateCross! * 0.9;
            let startX = -width + x;
            let startY = (-height / this.aspectRatio) + y;
            viewBoxDef = startX + " " + startY + " " + width * 2 + " " + height * 2;
            this.orbitForViewBox = c;
            this.viewBoxForOrbit = viewBoxDef;
            this.canvas!.viewbox(viewBoxDef);
        }
    }

    drawOrbits(system: StarSystem) {
        let planetsByOrbit: Map<Orbit, Planet> = new Map<Orbit, Planet>();
        system.planets.forEach((planet) => planetsByOrbit.set(planet.orbit, planet));
        let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForPlanet(this.tokenStorage.getUserID(), system.planets);

        this.setOrbits(orbitDefinitions);

        this.hyperLimitRadius = this.calculateHyperLimit(system);

        const celestialGroup = this.getOrCreateMainCelestialGroup();

        celestialGroup.circle()
            .x(0)
            .y(0)
            .id("hyper-limit-of-" + system.idStarSystem)
            .fill(BasicViewHelper.NONE_FILL_COLOR)
            .addClass(BasicViewHelper.HYPER_LIMIT_MARKER)
            .radius(this.hyperLimitRadius);

        orbitDefinitions.forEach(orbitDefinition => {
            const orbit = orbitDefinition.orbit;
            let celestialBodyID = this.getCelestialBodyID(orbit);
            let orbitID = this.getOrbitID(orbit);
            let radius: number = BasicViewHelper.calculateDistance(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate));

            celestialGroup.circle()
                .x(0)
                .y(0)
                .id(orbitID)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .addClass("orbit")
                .radius(radius);

            celestialGroup.circle()
                .x(0)
                .y(0)
                .id("star-of-" + system.idStarSystem)
                .addClass(BasicViewHelper.STAR_MARKER)
                .addClass(BasicViewHelper.RESIZE_ON_ZOOM_MARKER)
                .radius(BasicViewHelper.STAR_RADIUS_IN_SYSTEM);

            let multiplier = this.getScalingMultiplierForOrbit(orbit);

            this.createLocalPolarCoordinateSystem(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate), this.BATTLE_COORDINATE_SYSTEM_RADIUS, orbitID);

            this.setOrbitById(orbitID, orbit);

            if (orbitDefinition.isColonizable) {
                // to rotate around the center just flip the + and -
                let x1 = (this.convertToStandardMetric(orbit.xCoordinate) - 9) * multiplier;
                let y1 = (this.convertToStandardMetric(orbit.yCoordinate) - 8) * multiplier;
                let x2 = (this.convertToStandardMetric(orbit.xCoordinate) + 9) * multiplier;
                let y2 = (this.convertToStandardMetric(orbit.yCoordinate) + 8) * multiplier;

                let p1: LineCommand = ["M", x1, y1];
                let p2: CurveCommand = ["A", 1, 1, 1, 1, 1, x2, y2];

                let arr: PathArrayAlias = [p1, p2];
                celestialGroup.path(arr)
                    .fill(BasicViewHelper.NONE_FILL_COLOR)
                    .addClass(BasicViewHelper.COLONIZABLE_SYSTEM_MARKER_CSS_CLASS)
                    .addClass("roundCap");
            }

            const circle = celestialGroup.circle()
                .x(this.convertToStandardMetric(orbit.xCoordinate))
                .y(this.convertToStandardMetric(orbit.yCoordinate))
                .radius(5)
                .id(celestialBodyID);

            if (orbitDefinition.isColonizedByLoggedInUser) {
                circle.addClass(BasicViewHelper.IS_COLONIZED_BY_USER_COLOR_CSS_CLASS);
            } else if (orbitDefinition.isColonizedByOtherUser) {
                circle.addClass(BasicViewHelper.COLONIZED_BY_OTHERS_COLOR_CSS_CLASS);
            } else {
                circle.addClass(BasicViewHelper.NOT_COLONIZED_COLOR_CSS_CLASS);
            }

            this.setCelestialOrbitById(celestialBodyID, orbit);
        });
    }

    private getScalingMultiplierForOrbit(orbit: Orbit) {
        if (this.isBattleOrbit(orbit)) {
            // if the orbit is for the one which is part of the battle, increase all relevant geometric points
            return this.POSITION_MULTIPLIER;
        }
        return 1;
    }

    private isBattleOrbit(orbit: Orbit) {
        return !!this.battleReport && NavigationCalculator.isSameOrbit(this.battleReport.battleReportStatistics.orbit!.orbit!, orbit);
    }

    private getWarshipByID(id: string): AbstractId | undefined {
        return this.warshipsById.get(id);
    }

    protected getWarshipByEvent(event: PointerEvent | MouseEvent | any): AbstractId | undefined {
        let id = this.getIdFromEvent(event);
        return this.getWarshipByID(id);
    }
}
