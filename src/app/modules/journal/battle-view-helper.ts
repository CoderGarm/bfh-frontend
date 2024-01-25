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
import {BasicViewHelper} from "../../services/svg-view-helper/basic-view-helper";
import {NavigationCalculator} from "../../services/helper/navigation-calculator.helper";
import {CombatArenaData} from "./combat-arena-data";
import {BasicViewHelperData} from "../../services/svg-view-helper/basic-view-helper-data";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import WeaponTypeEnum = Launcher.WeaponTypeEnum;
import ResultEnum = ShipKillerHit.ResultEnum;

export class BattleViewHelper extends BasicViewHelper {

    private static readonly STANDARD_METRIC = DistanceMetricEnum.LS;

    private readonly BATTLE_COORDINATE_SYSTEM_RADIUS = 50;

    battleReport?: BattleReport;
    combatArenaData?: CombatArenaData;

    private orbitForViewBox: Orbit | undefined;
    private viewBoxForOrbit: string = "0 0 0 0";

    private warshipsById: Map<String, AbstractId> = new Map<String, AbstractId>();
    private latestWarshipPositionById: Map<String, ArrayXY> = new Map<String, ArrayXY>();
    private warshipPolygonById: Map<String, Polygon[]> = new Map<String, Polygon[]>();
    private missileSalvoPolygonsById: Map<String, Polygon> = new Map<String, Polygon>();

    hoveredWarship?: AbstractId;
    clickedFleet?: FleetMarker;

    constructor() {
        super(BattleViewHelper.STANDARD_METRIC);
    }

    protected setBattleReport(report: BattleReport | undefined) {
        this.battleReport = report;
    }

    protected clickForFleet = (event: PointerEvent) => {
        let fleetMarker = this.getFleetByEvent(event);
        if (!fleetMarker) {
            let text = this.getTextByEvent(event);
            if (!!text) {
                fleetMarker = this.getFleetByText(text);
            }
        }
        this.clickedFleet = fleetMarker;
    }

    protected mouseoverForWarship = (event: PointerEvent) => {
        this.hoveredWarship = this.getWarshipByEvent(event);
    }

    setActiveRound(activeRound: number | undefined, starSystem: StarSystem) {
        this.clearData();
        this.drawOrbits(starSystem);
        if (!activeRound || !this.combatArenaData) {
            return;
        }

        const movementByFleet = this.combatArenaData.movementsByRound.get(activeRound);
        if (!!movementByFleet) {
            this.setFleetsInBattle(movementByFleet, activeRound, this.combatArenaData.hitLogsByRound);
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
        this.setShipKillerHits(shipKillerHits);

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

            let icon = this.missileSalvoPolygonsById.get(attackedMissileSalvo);
            if (!icon) {
                return;
            }
            const x = icon.x();
            const y = icon.y();
            let explosionOutlines = this.createExplosionOutlines(x, y, 20);
            this.canvas!.polygon(explosionOutlines).addClass("explosion").fill(color);
        });
    }

    private setShipKillerHits(shipKillerHits?: ShipKillerHit[]) {
        if (!shipKillerHits) {
            return;
        }
        shipKillerHits.forEach((hit) => {

            let result = hit.result;
            let color = "yellow";
            if (result === ResultEnum.DAMAGEAPPLIED) {
                color = "orange";
            }

            hit.hitLogs.forEach(hitLog => {
                let warshipID = this.getWarshipID(hitLog.warShip);
                const pos = this.latestWarshipPositionById.get(warshipID);
                if (!pos) {
                    return;
                }
                const x = pos[0];
                const y = pos[1];
                let explosionOutlines = this.createExplosionOutlines(x, y, 10);
                this.canvas!.polygon(explosionOutlines).addClass("explosion").fill(color);
            });
        });
    }

    private createExplosionOutlines(x: number, y: number, scale: number): ArrayXY[] {
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
            let missileOutlines: ArrayXY[] = this.defineMissileHullPoints(volley, baseOrbit);
            let missileSalvoID = this.getMissileSalvoID(volley);
            this.createMissileHullOutlinesAndPrint(missileSalvoID, missileOutlines, volley);
        });
    }

    private createMissileHullOutlinesAndPrint(missileSalvoId: string,
                                              missileHullPoints: ArrayXY[],
                                              volley: MissileMovement) {
        const missileAmount = volley.missileAmount;
        const fleetOwnerId = volley.actorOwner.id;
        let group = this.canvas!.group()
            .id(missileSalvoId + BasicViewHelper.GROUP_SELECTOR_SUFFIX);

        this.setGroupById(missileSalvoId + BasicViewHelper.GROUP_SELECTOR_SUFFIX, group);

        let userID = this.tokenStorage.getUserID();
        let iconColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (fleetOwnerId == userID) {
            iconColor = this.FLEET_SHARK_COLOR_OWN;
        }
        const stroke = {color: iconColor, width: 1};
        let icon = group.polygon(missileHullPoints)
            .id(missileSalvoId)
            .fill(BasicViewHelper.NONE_FILL_COLOR)
            .stroke(stroke);
        this.missileSalvoPolygonsById.set(missileSalvoId, icon);

        let flipX: boolean = volley.lastPosition.xCoordinate.coordinate < volley.position.xCoordinate.coordinate;
        const xShift: number = icon.width() * (flipX ? -1 : 1);

        group.text(missileAmount + '')
            .fill(iconColor)
            .addClass("missile-salvo-text")
            .cx(icon.cx() + xShift)
            .cy(icon.cy())

        this.canvas!.add(group);
    }

    private defineMissileHullPoints(missileMovement: MissileMovement, centerOrbit: Orbit): ArrayXY[] {
        const missileAmount = missileMovement.missileAmount;

        let lastPosition = missileMovement.lastPosition;
        let position = missileMovement.position;

        let direction: boolean = lastPosition.xCoordinate.coordinate < position.xCoordinate.coordinate;
        position = this.modifyOrbit(position, centerOrbit);

        let x = this.convertToStandardMetric(position.xCoordinate);
        let y = this.convertToStandardMetric(position.yCoordinate);

        return this.createMissileOutlines(x, y, direction, missileAmount);
    }

    private createMissileOutlines(x: number, y: number, flip: boolean, missileAmount: number): ArrayXY[] {
        const amountModifier = missileAmount < 5 ? missileAmount : 6;
        const direction = flip ? -1 : 1;
        let points: ArrayXY[] = [];
        points.push([x, y]);
        points.push([x + (2 * direction * amountModifier), y - (.75 * amountModifier)]);
        points.push([x + (1.5 * direction * amountModifier), y]);
        points.push([x + (2 * direction * amountModifier), y + (.5 * amountModifier)]);
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
            if (weaponType === WeaponTypeEnum.COUNTER_MISSILE) {

            }
            if (weaponType === WeaponTypeEnum.BEAM) {
                this.canvas!
                    .line([[shooterG.cx(), shooterG.cy()], [targetG.cx(), targetG.cy()]])
                    .addClass("beamVolley")
                    .id(damageDealerId);
            }
            if (weaponType === WeaponTypeEnum.POINT_DEFENSE) {

            }
        });
    }

    private setFleetsInBattle(movementActions: MovementAction[],
                              activeRound: number,
                              hitLogsByRound: Map<number, HitLog[]>) {
        const baseOrbit = this.createBaseOrbit();

        movementActions.forEach((move) => {
            let fleet = move.actor;
            let startOrbit = move.origin;
            let targetOrbit = move.destination;
            if (!startOrbit || !targetOrbit) {
                return;
            }
            const angle: number = this.getAngle(startOrbit, targetOrbit);
            // expanding the coordinates by the multiplier but center it at the combat orbit
            startOrbit = this.modifyOrbit(startOrbit, baseOrbit);

            const fightingWarships: AbstractId[] = this.getFightingWarships(fleet, activeRound, hitLogsByRound);
            let warshipHullPoints: Array<Array<ArrayXY[]>> = this.defineWarshipHullPoints(fightingWarships, startOrbit, baseOrbit, -angle);
            this.createHullOutlinesAndPrint(fleet, fightingWarships, warshipHullPoints);
        });
    }

    private getAngle(origin: Orbit, destination: Orbit): number {
        return NavigationCalculator.getAngle(this.convertToStandardMetric(origin.xCoordinate),
            this.convertToStandardMetric(origin.yCoordinate),
            this.convertToStandardMetric(destination.xCoordinate),
            this.convertToStandardMetric(destination.yCoordinate)
        );
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
     * @private
     */
    private modifyOrbit(orbit: Orbit, baseOrbit: Orbit): Orbit {
        let orbX = this.convertToStandardMetric(orbit.xCoordinate);
        let baseX = this.convertToStandardMetric(baseOrbit.xCoordinate);
        let orbY = this.convertToStandardMetric(orbit.yCoordinate);
        let baseY = this.convertToStandardMetric(baseOrbit.yCoordinate);

        if (baseX == 0 && baseY == 0) {
            return orbit;
        }

        return {
            xCoordinate: {
                coordinate: (baseX - orbX) + orbX,
                distanceMetric: this.STANDARD_METRIC
            },
            yCoordinate: {
                coordinate: (baseY - orbY) + orbY,
                distanceMetric: this.STANDARD_METRIC
            }
        };
    }

    private createBaseOrbit() {
        return /*!!this.battleReport ? this.battleReport.battleReportStatistics.orbit!.orbit! :*/ {
            xCoordinate: {coordinate: 0, distanceMetric: DistanceMetricEnum.LS},
            yCoordinate: {coordinate: 0, distanceMetric: DistanceMetricEnum.LS}
        };
    }

    /**
     * creates a fleet shark, a text and groups them in the svg
     */
    private createHullOutlinesAndPrint(fleet: FleetMarker,
                                       warships: AbstractId[],
                                       warshipHullPoints: Array<Array<ArrayXY[]>>) {
        let fleetSharkID = this.getFleetSharkID(fleet);

        let group = this.canvas!.group()
            .id(fleetSharkID + BasicViewHelper.GROUP_SELECTOR_SUFFIX)
            .click(this.clickForFleet);

        this.setFleetById(fleetSharkID, fleet);
        this.setGroupById(fleetSharkID + BasicViewHelper.GROUP_SELECTOR_SUFFIX, group);

        let userID = this.tokenStorage.getUserID();
        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (fleet.owner.id == userID) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }
        // sort by is to display the names in a non-permuting way
        warships = warships.sort((a, b) => a.id > b.id ? 1 : -1);
        for (let i = 0; i < warshipHullPoints.length; i++) {
            let warshipHullPoint: ArrayXY[][] = warshipHullPoints[i];
            let warship = warships[i];
            let warshipID = this.getWarshipID(warship);
            this.warshipsById.set(warshipID, warship);

            const points: ArrayXY[] = [];
            warshipHullPoint.forEach(p => p.forEach(f => points.push([f[0], f[1]])));
            const sortPoints = this.sortPoints(points);
            const x = sortPoints.sortedPointsX[Math.ceil(sortPoints.sortedPointsX.length / 2)];
            const y = sortPoints.sortedPointsY[Math.ceil(sortPoints.sortedPointsY.length / 2)];
            this.latestWarshipPositionById.set(warshipID, [x[0], y[1]]);

            this.setFleetById(warshipID, fleet);

            const warshipGroupId = warshipID + BattleViewHelper.GROUP_SELECTOR_SUFFIX;
            const warShipGroup = group.group()
                .id(warshipGroupId)
                .click(this.clickForFleet)
                .mouseover(this.mouseoverForWarship);

            this.setGroupById(warshipGroupId, warShipGroup);

            warshipHullPoint.forEach(hullElements => {
                let polygon = warShipGroup.polygon(hullElements)
                    .id(warshipID)
                    .fill(fleetSharkColor)
                    .click(this.clickForFleet)
                    .mouseover(this.mouseoverForWarship);
                this.setWarshipPolygonById(warshipID, polygon);
            });
        }
        this.canvas?.add(group);
    }

    private setWarshipPolygonById(id: string, polygon: Polygon) {
        let arr = this.getWarshipPolygons(id);
        if (!arr) {
            arr = [];
        }
        arr.push(polygon);
        this.warshipPolygonById.set(id, arr);
    }

    private getWarshipPolygons(id: string): Polygon[] | undefined {
        return this.warshipPolygonById.get(id);
    }

    private defineWarshipHullPoints(warShips: AbstractId[], orbit: Orbit, centerOrbit: Orbit, angle: number): Array<Array<ArrayXY[]>> {
        const yShift = 7.5;
        const xShift = 37.5;

        const result: Array<Array<ArrayXY[]>> = [];
        let horizontalLift = 0;
        let verticalLift = 0;

        let x = this.convertToStandardMetric(orbit.xCoordinate);
        let y = this.convertToStandardMetric(orbit.yCoordinate);
        let modifiedX = (warShips.length / 2 * xShift);
        let modifiedY = (warShips.length / 2 * yShift) + yShift;
        let upDownY = y < this.convertToStandardMetric(centerOrbit.yCoordinate) ? -1 : 0;
        // todo build groups of three ships (one is a dot, two is a line) and form a triangle
        //  build groups of triangles and place them in a triangle by permuting top and bottom (one or two items in the top)

        let baseX = x - modifiedX;
        let baseY = y + (modifiedY * upDownY);
        for (let i = 0; i < warShips.length; i++) {
            let x: number = baseX + verticalLift;
            let y: number = baseY + horizontalLift;
            let hullOutlines = this.createHullOutlines(x, y, angle);
            result.push(hullOutlines);
            horizontalLift += yShift;
            verticalLift += xShift;
        }
        return result;
    }

    private addAndScale(coord: number, additional: number, scale: number): number {
        return coord + (additional / scale);
    }

    private addAndScaleBoth(x: number, additionalX: number, y: number, additionalY: number, angle: number, scale: number): ArrayXY {
        const p1: ArrayXY = [x, y];
        let p2: ArrayXY = [this.addAndScale(x, additionalX, scale), this.addAndScale(y, additionalY, scale)];
        return NavigationCalculator.rotatePoint(p1, angle + 90, p2);
    }

    private createHullOutlines(x: number, y: number, angle: number): Array<ArrayXY[]> {
        const result: Array<ArrayXY[]> = [];
        let lines: ArrayXY[];
        lines = []; // upper bow
        let scale = 2;
        lines.push(this.addAndScaleBoth(x, 50, y, 2, angle, scale));
        lines.push(this.addAndScaleBoth(x, 55, y, 3, angle, scale));
        lines.push(this.addAndScaleBoth(x, 55, y, 1.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 59, y, 1.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 65, y, 3.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 65, y, 5.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 50, y, 5.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 50, y, 2, angle, scale));
        let upperBowPoints = lines;
        result.push(upperBowPoints);

        lines = [];
        lines.push(this.addAndScaleBoth(x, 35, y, 2, angle, scale));  // upper broadside
        lines.push(this.addAndScaleBoth(x, 50, y, 2, angle, scale));
        lines.push(this.addAndScaleBoth(x, 50, y, 5.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 20, y, 5.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 20, y, 2, angle, scale));
        lines.push(this.addAndScaleBoth(x, 35, y, 2, angle, scale));
        let upperBroadsidePoints = lines;
        result.push(upperBroadsidePoints);

        lines = []; // upper stern
        lines.push(this.addAndScaleBoth(x, 5, y, 5.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 5, y, 3.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 11, y, 1.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 15, y, 1.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 15, y, 3, angle, scale));
        lines.push(this.addAndScaleBoth(x, 20, y, 2, angle, scale));
        lines.push(this.addAndScaleBoth(x, 20, y, 5.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 5, y, 5.5, angle, scale));
        let upperSternPoints = lines;
        result.push(upperSternPoints);

        // todo outline by class?
        lines = []; // lower stern
        lines.push(this.addAndScaleBoth(x, 20, y, 6.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 20, y, 10, angle, scale));
        lines.push(this.addAndScaleBoth(x, 15, y, 9, angle, scale));
        lines.push(this.addAndScaleBoth(x, 15, y, 10.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 11, y, 10.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 5, y, 8.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 5, y, 6.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 20, y, 6.5, angle, scale));
        let lowerSternPoints = lines;
        result.push(lowerSternPoints);

        lines = [];
        lines.push(this.addAndScaleBoth(x, 50, y, 10, angle, scale)); // lower broadside
        lines.push(this.addAndScaleBoth(x, 50, y, 6.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 20, y, 6.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 20, y, 10, angle, scale));
        lines.push(this.addAndScaleBoth(x, 50, y, 10, angle, scale));
        let lowerBroadsidePoints = lines;
        result.push(lowerBroadsidePoints);

        lines = [];
        lines.push(this.addAndScaleBoth(x, 65, y, 6.5, angle, scale)); // lower bow
        lines.push(this.addAndScaleBoth(x, 65, y, 8.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 59, y, 10.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 55, y, 10.5, angle, scale));
        lines.push(this.addAndScaleBoth(x, 55, y, 9, angle, scale));
        lines.push(this.addAndScaleBoth(x, 50, y, 10, angle, scale));
        lines.push(this.addAndScaleBoth(x, 50, y, 6.5, angle, scale));
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
                .addClass(BasicViewHelperData.STAR_COLOR_MARKER)
                .addClass(BasicViewHelper.RESIZE_ON_ZOOM_MARKER)
                .radius(BasicViewHelper.STAR_RADIUS_IN_SYSTEM);

            this.createLocalPolarCoordinateSystem(this.convertToStandardMetric(orbit.xCoordinate), this.convertToStandardMetric(orbit.yCoordinate), this.BATTLE_COORDINATE_SYSTEM_RADIUS, orbitID);

            this.setOrbitById(orbitID, orbit);

            if (orbitDefinition.isColonizable) {
                // to rotate around the center just flip the + and -
                let x1 = (this.convertToStandardMetric(orbit.xCoordinate) - 9);
                let y1 = (this.convertToStandardMetric(orbit.yCoordinate) - 8);
                let x2 = (this.convertToStandardMetric(orbit.xCoordinate) + 9);
                let y2 = (this.convertToStandardMetric(orbit.yCoordinate) + 8);

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
                .id(celestialBodyID)
                .addClass(BasicViewHelper.CELESTIAL_BODY_CSS_CLASS);

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

    private getWarshipByID(id: string): AbstractId | undefined {
        return this.warshipsById.get(id);
    }

    protected getWarshipByEvent(event: PointerEvent | MouseEvent | any): AbstractId | undefined {
        let id = this.getIdFromEvent(event);
        return this.getWarshipByID(id);
    }
}
