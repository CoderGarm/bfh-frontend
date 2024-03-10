import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CombatArenaData} from "../../../combat-arena-data";
import {AbstractId, CounterMissileHit, EnumValueDto, Fleet, HitLog, MissileMovement, MovementAction, ReleasedVolley, ShipKillerHit} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;

export interface RoundData {
    actor: AbstractId;
    movement: MovementAction;
    missileMovements: MissileMovement[];
    volleys: ReleasedVolley[];
    shipKillerHits: ShipKillerHit[];
    counterMissileHits: CounterMissileHit[];
}

export interface CompressedHitLog {
    warShip: AbstractId;
    attackedPart: Map<HitLog.AttackedPartEnum, number>;
    isAlive: boolean;
    isFightingCapable: boolean;
}

@Component({
    selector: 'app-battle-report-combat-log',
    templateUrl: './battle-report-combat-log.component.html',
    styleUrls: ['./battle-report-combat-log.component.scss']
})
export class BattleReportCombatLogComponent extends SubscriptionManager implements OnChanges {

    protected readonly EWeaponTypeEnum = EWeaponTypeEnum;

    @Input()
    fleet?: Fleet;

    @Input()
    combatArenaData?: CombatArenaData;

    @Input()
    activeRound?: number;

    roundData: RoundData[] = [];
    hitLogs: HitLog[] = [];

    ngOnChanges(changes: SimpleChanges) {
        this.setActiveRound();
    }

    setActiveRound() {

        this.roundData = [];
        this.hitLogs = [];
        if (!this.activeRound || !this.combatArenaData) {
            return;
        }

        const movementByFleet = this.combatArenaData.movementsByRound.has(this.activeRound) ? this.combatArenaData.movementsByRound.get(this.activeRound)! : [];
        const missileMovements = this.combatArenaData.missileMovementsByRound.has(this.activeRound) ? this.combatArenaData.missileMovementsByRound.get(this.activeRound)! : [];
        let shipKillerHits = this.combatArenaData.shipKillerHitsByRound.has(this.activeRound) ? this.combatArenaData.shipKillerHitsByRound.get(this.activeRound)! : [];
        let volleys = this.combatArenaData.volleysByRound.has(this.activeRound) ? this.combatArenaData.volleysByRound.get(this.activeRound)! : [];
        let counterMissileHits = this.combatArenaData.counterMissileHitsByRound.has(this.activeRound) ? this.combatArenaData.counterMissileHitsByRound.get(this.activeRound)! : [];

        this.hitLogs = this.combatArenaData.hitLogsByRound.has(this.activeRound) ? this.combatArenaData.hitLogsByRound.get(this.activeRound)! : [];

        this.roundData = movementByFleet
            .filter(ma => ma.actor.id == this.fleet?.idFleet)
            .map(ma => {
                const actor = ma.actor;
                return <RoundData>{
                    actor: actor,
                    movement: ma,
                    missileMovements: missileMovements.filter(mm => mm.actor.id == actor.id),
                    shipKillerHits: shipKillerHits.filter(mm => mm.actor.id == actor.id),
                    volleys: volleys.filter(mm => mm.actor.id == actor.id),
                    counterMissileHits: counterMissileHits.filter(mm => mm.actor.id == actor.id)
                }
            })
            .sort((a, b) => this.userId == a.actor.id ? -1 : 1);
    }

    getFleetName(fleet: AbstractId) {
        return this.combatArenaData?.fleets.get(fleet.id)!.name;
    }

    getShipName(warship: AbstractId) {
        const arrayLike = this.combatArenaData!.fleets.values()!;
        return Array.from(arrayLike)
            .flatMap(f => f.ships)
            .find(s => s.idWarship == warship.id)!.name;

    }

    getCompressedHits(hitLogs: Array<HitLog>): CompressedHitLog[] {

        const result: CompressedHitLog[] = [];
        hitLogs.forEach(log => {

            let chl: CompressedHitLog | undefined = result.find(ll => ll.warShip.id == log.warShip.id);
            if (!chl) {
                chl = {
                    warShip: log.warShip,
                    attackedPart: new Map<HitLog.AttackedPartEnum, number>(),
                    isAlive: true,
                    isFightingCapable: true
                }
                result.push(chl);
            }

            let appliedDamage = chl.attackedPart.get(log.attackedPart);
            if (!appliedDamage) {
                appliedDamage = 0;
            }
            appliedDamage += log.damageValue;
            chl.attackedPart.set(log.attackedPart, appliedDamage);

            const alive = log.isAlive;
            if (!alive) {
                chl.isAlive = false;
            }

            const fightingCapable = log.isFightingCapable;
            if (!fightingCapable) {
                chl.isFightingCapable = false;
            }
        });
        return result;
    }
}
