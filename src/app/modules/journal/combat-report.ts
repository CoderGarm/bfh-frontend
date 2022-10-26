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
                if (hitLog.warShip.id === lossRole.warship.id) {
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
                    if (!hitLog.isAlive) {
                        this.destroyedBy = report.participatingFleets.filter(f => f.idFleet === releasedVolley!.actor.id)[0].name;
                    }
                    if (!hitLog.isFightingCapable) {
                        this.finalHitBy = report.participatingFleets.filter(f => f.idFleet === releasedVolley!.actor.id)[0].name;
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
