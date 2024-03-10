import {
    BattleReport,
    CounterMissileHit,
    Fleet,
    FleetMarker,
    HitLog,
    Maneuver,
    MissileMovement,
    MovementAction,
    ReleasedVolley,
    ShipClass,
    ShipKillerHit
} from "../../services/swagger";

export class CombatArenaData {

    combatRounds: number[] = [];
    fleets: Map<number, Fleet> = new Map<number, Fleet>();
    movementsByRound: Map<number, MovementAction[]> = new Map<number, MovementAction[]>();
    missileMovementsByRound: Map<number, MissileMovement[]> = new Map<number, MissileMovement[]>();
    volleysByRound: Map<number, ReleasedVolley[]> = new Map<number, ReleasedVolley[]>();
    shipKillerHitsByRound: Map<number, ShipKillerHit[]> = new Map<number, ShipKillerHit[]>();
    counterMissileHitsByRound: Map<number, CounterMissileHit[]> = new Map<number, CounterMissileHit[]>();
    hitLogsByRound: Map<number, HitLog[]> = new Map<number, HitLog[]>();
    shipClasses: Map<number, ShipClass> = new Map<number, ShipClass>();
    maneuvers: Map<FleetMarker, Maneuver> = new Map<FleetMarker, Maneuver>();

    constructor(report: BattleReport) {
        report.movementActions.forEach(ma => this.setMovementMapValue(ma));
        report.missileMovements.forEach(rv => this.setMissileMovementMapValue(rv));
        report.releasedVolleys.forEach(rv => this.setReleasedVolleyMapValue(rv));
        report.shipKillerHits.forEach(rv => this.setShipKillerHitsMapValue(rv));
        report.counterMissileHits.forEach(rv => this.setCounterMissileHitsMapValue(rv));
        report.participatingFleets.forEach(fleet => this.setShipClasses(fleet));
        report.maneuvers.forEach(m => this.maneuvers.set(m.actor, m));
        this.mergeCombatRounds();
    }

    private setCounterMissileHitsMapValue(volley: CounterMissileHit) {
        const combatRound = volley.combatRoundKey;
        let valueMap = this.counterMissileHitsByRound.get(combatRound);
        if (!valueMap) {
            valueMap = [];
            this.counterMissileHitsByRound.set(combatRound, valueMap);
        }
        valueMap.push(volley);
    }

    private setShipKillerHitsMapValue(volley: ShipKillerHit) {
        const combatRound = volley.combatRoundKey;
        let valueMap = this.shipKillerHitsByRound.get(combatRound);
        if (!valueMap) {
            valueMap = [];
            this.shipKillerHitsByRound.set(combatRound, valueMap);
        }
        valueMap.push(volley);
        this.setHitLogMapValue(combatRound, volley.hitLogs);
    }

    private setHitLogMapValue(combatRound: number, volley: HitLog[]) {

        let valueMap = this.hitLogsByRound.get(combatRound);
        if (!valueMap) {
            valueMap = [];
            this.hitLogsByRound.set(combatRound, valueMap);
        }
        volley.forEach(hitLog => valueMap!.push(hitLog));
    }

    private setMissileMovementMapValue(volley: MissileMovement) {
        const combatRound = volley.combatRoundKey;
        let valueMap = this.missileMovementsByRound.get(combatRound);
        if (!valueMap) {
            valueMap = [];
            this.missileMovementsByRound.set(combatRound, valueMap);
        }
        valueMap.push(volley);
    }

    private setReleasedVolleyMapValue(volley: ReleasedVolley) {
        const combatRound = volley.combatRoundKey;
        let valueMap = this.volleysByRound.get(combatRound);
        if (!valueMap) {
            valueMap = [];
            this.volleysByRound.set(combatRound, valueMap);
        }
        valueMap.push(volley);
    }

    private setMovementMapValue(movementAction: MovementAction) {
        const combatRound = movementAction.combatRoundKey;
        let valueMap = this.movementsByRound.get(combatRound);
        if (!valueMap) {
            valueMap = [];
            this.movementsByRound.set(combatRound, valueMap);
        }
        valueMap.push(movementAction);
    }

    private setShipClasses(fleet: Fleet) {
        this.fleets.set(fleet.idFleet, fleet);
        fleet.ships.forEach(warShip => {
            let idShipClass = warShip.shipClass.idShipClass;
            this.shipClasses.set(idShipClass!, warShip.shipClass);
        });
    }

    private mergeCombatRounds() {
        const combatRounds: Set<number> = new Set<number>();
        Array.from(this.movementsByRound.keys()).forEach(cr => combatRounds.add(cr));
        Array.from(this.volleysByRound.keys()).forEach(cr => combatRounds.add(cr));
        this.combatRounds = Array.from(combatRounds).sort((a, b) => a - b);
    }

}
