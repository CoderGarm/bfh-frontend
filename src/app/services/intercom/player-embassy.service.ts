import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {SubscriptionManager} from "../../subscription.manager";
import {DialogConfigHelper} from "../helper/dialog-config.helper";
import {PlayerEmbassyComponent} from "../../components/user/player-embassy/player-embassy.component";
import {Player} from "../swagger";

@Injectable()
export class PlayerEmbassyService extends SubscriptionManager {

    constructor(private dialog: MatDialog) {
        super();
    }

    openEmbassy(player: Player) {
        const dialogConfig = DialogConfigHelper.createPlayerEmbassyDialog();
        dialogConfig.data = player;
        dialogConfig.width = '90%';
        (<string[]>dialogConfig.panelClass).push('player-embassy-dialog')
        const dialogRef = this.dialog.open(PlayerEmbassyComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(() => {
            console.log('closed')
        });
    }


    static getPlayerName(player?: Player) {
        if (!player) {
            return '';
        }

        const rpg = player.rolePlayData;
        if (!rpg.surname) {
            return player.username;
        }
        return PlayerEmbassyService.g(rpg.titleAbbreviation) + " " + this.g(rpg.firstname) + " " + this.g(rpg.surname);
    }

    static getPlayerEmpireName(player?: Player) {
        if (!player) {
            return '';
        }

        const rpg = player.rolePlayData;
        if (!rpg.empireName) {
            return PlayerEmbassyService.getPlayerName(player);
        }
        return rpg.empireName;
    }

    private static g(text?: string) {
        return !!text ? text : "";
    }
}
