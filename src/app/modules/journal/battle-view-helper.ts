import {ArrayXY, CurveCommand, LineCommand, Path, PathArrayAlias, Polygon} from "@svgdotjs/svg.js";
import {
    AbstractId,
    BattleReport,
    CounterMissileHit,
    Distance,
    EnumValueDto,
    FleetMarker,
    FleetOrbit,
    HitLog,
    Launcher,
    Maneuver,
    ManeuverElement,
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
import {options} from "@svgdotjs/svg.panzoom.js";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import WeaponTypeEnum = Launcher.WeaponTypeEnum;
import ResultEnum = ShipKillerHit.ResultEnum;

export class BattleViewHelper extends BasicViewHelper {

    private static readonly STANDARD_METRIC = DistanceMetricEnum.LS;

    private static readonly BATTLE_COORDINATE_SYSTEM_RADIUS: number = 50;
    private static readonly MULTIPLIER: number = 500;

    public static readonly PAN_ZOOM_OPTIONS: options = {
        // https://github.com/svgdotjs/svg.panzoom.js/blob/master/readme.md
        zoomFactor: 0.3, // zooming per wheel tick
        zoomMin: 0.001, // zoom max out to display the full svg payload as 20% of the screen
        zoomMax: 4 // zoom max 4 times in
    };

    battleReport?: BattleReport;
    combatArenaData?: CombatArenaData;

    private orbitForViewBox: Orbit | undefined;
    private viewBoxForOrbit: string = "0 0 0 0";

    private warshipsById: Map<String, AbstractId> = new Map<String, AbstractId>();
    private latestWarshipPositionById: Map<String, ArrayXY> = new Map<String, ArrayXY>();
    private warshipPolygonById: Map<String, Polygon[]> = new Map<String, Polygon[]>();
    private missileSalvoPolygonsById: Map<String, Polygon> = new Map<String, Polygon>();
    private maneuverPathByIdFleet: Map<string, Path> = new Map<string, Path>();

    hoveredWarship?: AbstractId;
    clickedFleet?: FleetMarker;

    constructor() {
        super(BattleViewHelper.STANDARD_METRIC, BattleViewHelper.MULTIPLIER);

        this.panZoomOptions = BattleViewHelper.PAN_ZOOM_OPTIONS;
    }

    protected setBattleReport(report: BattleReport | undefined) {
        this.battleReport = report;
    }

    protected drawCourses() {

        const g = this.getOrCreateFleetConfirmedMoveGroup();
        Array.from(this.combatArenaData!.maneuvers.values()).map(m => m.maneuverElements
            .sort((a, b) => a.sequenceNo - b.sequenceNo)
            .forEach(me => {

                const p1 = me.p1;
                const cp1 = me.cp1;
                const cp2 = me.cp2;
                const p2 = me.p2;
                const c1: LineCommand = [
                    'M',
                    this.convertToStandardMetric(p1.xCoordinate), this.convertToStandardMetric(p1.yCoordinate),
                ];
                const c2: CurveCommand = [
                    'C',
                    this.convertToStandardMetric(cp1.xCoordinate), this.convertToStandardMetric(cp1.yCoordinate),
                    this.convertToStandardMetric(cp2.xCoordinate), this.convertToStandardMetric(cp2.yCoordinate),
                    this.convertToStandardMetric(p2.xCoordinate), this.convertToStandardMetric(p2.yCoordinate)
                ];

                const maneuverElementKey = BattleViewHelper.getManeuverElementKey(me);
                const maneuverCurve = g
                    .path([c1, c2])
                    .id(maneuverElementKey)
                    .addClass(BasicViewHelper.COURSE_PLOT_MARKER)
                    .addClass(BasicViewHelper.RELATIVE_STROKE);

                this.maneuverPathByIdFleet.set(maneuverElementKey, maneuverCurve);
            }));
    }

    private static getManeuverElementKey(maneuverElement: ManeuverElement) {
        return maneuverElement.maneuver.id + '-' + maneuverElement.sequenceNo;
    }

    private static getIDsByManeuverSequenceKey(key: string): { idManeuver: number, maneuverSequenceNo: number } | undefined {
        if (!key.includes('-')) {
            return undefined;
        }
        const split = key.split('-');
        return {idManeuver: Number.parseFloat(split[0]), maneuverSequenceNo: Number.parseFloat(split[1])};
    }

    private getManeuverCurveByElement(maneuverElement: ManeuverElement): Path {
        return this.maneuverPathByIdFleet.get(BattleViewHelper.getManeuverElementKey(maneuverElement))!;
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

    clearData() {
        if (!!this.canvas) {
            // remove all elements from canvas a little bit more performant
            this.getOrCreateMainSubLayerGroup().node.innerHTML = '';
        }
    }

    setActiveRound(activeRound: number | undefined) {
        this.clearData();

        if (!activeRound || !this.combatArenaData) {
            return;
        }

        const movementByFleet = this.combatArenaData.movementsByRound.get(activeRound)!;
        if (!!movementByFleet) {
            this.setFleetsInBattle(movementByFleet, activeRound, this.combatArenaData.maneuvers, this.combatArenaData.hitLogsByRound);
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
            this.getOrCreateMainSubLayerGroup().polygon(explosionOutlines).addClass("explosion").fill(color);
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
                this.getOrCreateMainSubLayerGroup().polygon(explosionOutlines).addClass("explosion").fill(color);
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
        let group = this.getOrCreateMainSubLayerGroup().group()
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

        this.getOrCreateMainSubLayerGroup().add(group);
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
                this.getOrCreateMainSubLayerGroup()
                    .line([[shooterG.cx(), shooterG.cy()], [targetG.cx(), targetG.cy()]])
                    .addClass("beamVolley")
                    .addClass(BattleViewHelper.RELATIVE_STROKE)
                    .id(damageDealerId);
            }
            if (weaponType === WeaponTypeEnum.POINT_DEFENSE) {

            }
        });
    }

    private setFleetsInBattle(movementActions: MovementAction[],
                              activeRound: number,
                              maneuvers: Map<FleetMarker, Maneuver>,
                              hitLogsByRound: Map<number, HitLog[]>) {

        movementActions.forEach((move) => {
            let fleet = move.actor;
            let lengthOnTrack = this.convertToStandardMetric(move.lengthOnTrack);
            const maneuver = Array.from(maneuvers.values()).find(m => m.actor.fleet.id === fleet.fleet.id)!;
            const maneuverElements = maneuver.maneuverElements.sort((a, b) => a.sequenceNo - b.sequenceNo);

            const totalLength = maneuverElements.map(me => {
                const curve = this.getManeuverCurveByElement(me);
                return curve.length();
            }).reduce((sum, current) => sum + current, 0);

            let lengthToNow: number = 0;
            let myTrack: Path | undefined;
            for (let me of maneuverElements) {
                const curve = this.getManeuverCurveByElement(me);
                lengthToNow += curve.length();
                if (lengthToNow >= lengthOnTrack) {
                    myTrack = curve;
                    break;
                }
            }

            const position: { x: number, y: number } = myTrack!.pointAt(lengthOnTrack);
            let targetOrbit: { x: number, y: number } = myTrack!.pointAt(lengthOnTrack + 1);

            const g = this.getOrCreateMainSubLayerGroup();
            // fixme replace by fleet marker only on bigger zoom
            g.circle()
                .x(position.x)
                .y(position.y)
                .radius(500)
                .fill('green')

            const angle: number = Math.ceil(this.getAngle(position, targetOrbit));
            const fightingWarships: AbstractId[] = this.getFightingWarships(fleet, activeRound, hitLogsByRound);
            let warshipHullPoints: Array<Array<ArrayXY[]>> = this.defineWarshipHullPoints(fightingWarships, position, angle);
            this.createAuraEllipse(move, position, angle);
            this.createHullOutlinesAndPrint(fleet, fightingWarships, warshipHullPoints);
        });
    }

    private createAuraEllipse(move: MovementAction, position: { x: number, y: number }, angle: number) {
        // fixme create useful methods for it
        let antiShipMissileRangeRadiusX: number = 0;
        let antiShipMissileRangeRadiusY: number = 0;
        let antiMissileMissileRangeRadiusX: number = 0;
        let antiMissileMissileRangeRadiusY: number = 0;
        let weaponRangeRadiusX: number = 0;
        let weaponRangeRadiusY: number = 0;

        let cx = position.x;
        let cy = position.y;

        // fixme modify center pos by angle and check stroke scaling
        move.auraState.auraStates.forEach(aura => {
            const antiShipMissileRange = this.convertToStandardMetric(aura.antiShipMissileRange);
            const antiMissileMissileRange = this.convertToStandardMetric(aura.antiMissileMissileRange);
            const weaponRange = this.convertToStandardMetric(aura.weaponRange);

            const alignment = aura.alignment;
            switch (alignment) {
                case "BOW":
                    antiShipMissileRangeRadiusX += antiShipMissileRange;
                    antiShipMissileRangeRadiusX += antiMissileMissileRange;
                    weaponRangeRadiusX += weaponRange;
                    break;
                case "STERN":
                    antiShipMissileRangeRadiusX += antiShipMissileRange;
                    antiMissileMissileRangeRadiusX += antiMissileMissileRange;
                    antiShipMissileRangeRadiusX += weaponRange;
                    break;
                case "BROADSIDE":
                    antiShipMissileRangeRadiusY += antiShipMissileRange;
                    antiMissileMissileRangeRadiusY += antiMissileMissileRange;
                    weaponRangeRadiusY += weaponRange;
                    break;

            }
        });

        // fixme add text on hover - change fill on hover
        const g = this.getOrCreateMainSubLayerGroup();
        g.ellipse(antiShipMissileRangeRadiusY * 2, antiShipMissileRangeRadiusX * 2)
            .cx(cx)
            .cy(cy)
            .addClass(BasicViewHelper.RELATIVE_STROKE)
            .addClass(move.actor.owner.id == this.userId ? 'friendly-aura' : 'enemy-aura')
            .addClass('missile-aura')
            .rotate(angle, cx, cy);

        g.ellipse(antiMissileMissileRangeRadiusY * 2, antiMissileMissileRangeRadiusX * 2)
            .cx(cx)
            .cy(cy)
            .addClass(BasicViewHelper.RELATIVE_STROKE)
            .addClass(move.actor.owner.id == this.userId ? 'friendly-aura' : 'enemy-aura')
            .addClass('anti-missile-aura')
            .rotate(angle, cx, cy);

        g.ellipse(weaponRangeRadiusY * 2, weaponRangeRadiusX * 2)
            .cx(cx)
            .cy(cy)
            .addClass(BasicViewHelper.RELATIVE_STROKE)
            .addClass(move.actor.owner.id == this.userId ? 'friendly-aura' : 'enemy-aura')
            .addClass('weapon-aura')
            .rotate(angle, cx, cy);
    }

    private getAngle(origin: { x: number, y: number }, destination: { x: number, y: number }): number {
        return NavigationCalculator.getAngleDegrees(
            origin.x,
            origin.y,
            destination.x,
            destination.y, true
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
        let baseX = this.convertToStandardMetric(baseOrbit.xCoordinate);
        let baseY = this.convertToStandardMetric(baseOrbit.yCoordinate);
        let orbX = this.convertToStandardMetric(orbit.xCoordinate);
        let orbY = this.convertToStandardMetric(orbit.yCoordinate);

        if (baseX == 0 && baseY == 0) {
            return orbit;
        }

        return {
            xCoordinate: {
                coordinate: (baseX - orbX) + orbX,
                distanceMetric: this.standardDistanceMetric
            },
            yCoordinate: {
                coordinate: (baseY - orbY) + orbY,
                distanceMetric: this.standardDistanceMetric
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

        let group = this.getOrCreateMainSubLayerGroup().group()
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
        this.getOrCreateMainSubLayerGroup().add(group);
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

    private defineWarshipHullPoints(warShips: AbstractId[], orbit: { x: number, y: number }, angle: number): Array<Array<ArrayXY[]>> {
        const yShift = 7.5;
        const xShift = 37.5;

        const result: Array<Array<ArrayXY[]>> = [];
        let horizontalLift = 0;
        let verticalLift = 0;

        let x = orbit.x;
        let y = orbit.y;
        let modifiedX = (warShips.length / 2 * xShift);
        let modifiedY = (warShips.length / 2 * yShift) + yShift;
        let upDownY = y < 0 ? -1 : 0;
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
            .addClass(BasicViewHelperData.RELATIVE_STROKE)
            .radius(this.hyperLimitRadius);

        celestialGroup.circle()
            .x(0)
            .y(0)
            .id("star-of-" + system.idStarSystem)
            .radius(BasicViewHelper.STAR_RADIUS_IN_SYSTEM * BattleViewHelper.MULTIPLIER)
            .addClass(BasicViewHelper.STAR_MARKER)
            .addClass(BasicViewHelperData.STAR_COLOR_MARKER);

        orbitDefinitions.forEach(orbitDefinition => {
            const orbit = orbitDefinition.orbit;
            let celestialBodyID = this.getCelestialBodyID(orbit);
            let orbitID = this.getOrbitID(orbit);
            let radius: number = BasicViewHelper.calculateDistance(
                this.convertToStandardMetric(orbit.xCoordinate),
                this.convertToStandardMetric(orbit.yCoordinate)
            );

            celestialGroup.circle()
                .x(0)
                .y(0)
                .id(orbitID)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .addClass(BasicViewHelper.ORBIT_MARKER)
                .addClass(BasicViewHelper.RELATIVE_STROKE)
                .radius(radius);

            this.createLocalPolarCoordinateSystem(
                this.convertToStandardMetric(orbit.xCoordinate),
                this.convertToStandardMetric(orbit.yCoordinate),
                BattleViewHelper.BATTLE_COORDINATE_SYSTEM_RADIUS * BattleViewHelper.MULTIPLIER,
                orbitID);

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
                    .addClass(BasicViewHelper.RELATIVE_STROKE)
                    .addClass("roundCap");
            }

            const circle = celestialGroup.circle()
                .x(this.convertToStandardMetric(orbit.xCoordinate))
                .y(this.convertToStandardMetric(orbit.yCoordinate))
                .radius(BasicViewHelper.PLANET_RADIUS * BattleViewHelper.MULTIPLIER)
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
            this.setCelestialCircleById(celestialBodyID, circle);
        });
        this.createDistanceScalingFactor();
    }

    private getWarshipByID(id: string): AbstractId | undefined {
        return this.warshipsById.get(id);
    }

    protected getWarshipByEvent(event: PointerEvent | MouseEvent | any): AbstractId | undefined {
        let id = this.getIdFromEvent(event);
        return this.getWarshipByID(id);
    }
}
