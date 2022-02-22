import {BattleReport, LossRole, ReleasedVolley} from "../../services/swagger";

export class CombatReport {
    constructor(report: BattleReport, lossRole: LossRole) {
        this.lossRole = lossRole;

        const releasedVolleysByDamageDealerId: Map<string, ReleasedVolley> = new Map<string, ReleasedVolley>();
        report.releasedVolleys.map(volley => {
            releasedVolleysByDamageDealerId.set(volley.damageDealer, volley);
        })
        report.shipKillerHits.forEach(hit => {
            hit.hitLogs.forEach(hitLog => {
                if (hitLog.warShip.name === lossRole.warShipName) {
                    let releasedVolley = releasedVolleysByDamageDealerId.get(hit.damageDealer);
                    if (!releasedVolley) {
                        throw new Error("It seems that you was hit by a ghost missile. Please call the administrator.")
                    }
                    if (releasedVolley!.weaponType === ReleasedVolley.WeaponTypeEnum.BEAM) {
                        this.beamHits++;
                    }
                    if (releasedVolley!.weaponType === ReleasedVolley.WeaponTypeEnum.MISSILE) {
                        this.missileHits++;
                    }
                    if (!hitLog.alive) {
                        this.destroyedBy = releasedVolley.actor.name;
                    }
                    if (!hitLog.fightingCapable) {
                        this.finalHitBy = releasedVolley.actor.name;
                    }
                }
            });
        });
    }

    destroyedBy: string = "";
    finalHitBy: string = "";
    beamHits = 0;
    missileHits = 0;
    lossRole: LossRole;
}
