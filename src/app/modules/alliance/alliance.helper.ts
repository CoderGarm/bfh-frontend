import {JWT} from "../../services/swagger";
import GameUserRolesEnum = JWT.GameUserRolesEnum;

export class AllianceHelper {

    static isAllianceAdmin(gameRoles: JWT.GameUserRolesEnum[]) {
        const index: number = gameRoles.indexOf(GameUserRolesEnum.ALLIANCE_ADMIN);
        return index != -1;
    }
}
