import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {SubscriptionManager} from "../../subscription.manager";
import {DialogConfigHelper} from "../helper/dialog-config.helper";
import {PlayerEmbassyComponent} from "../../components/user/player-embassy/player-embassy.component";
import {FileUpload, Player, RolePlayApiService, RolePlayData, RPGTextBlocks} from "../swagger";
import {Observable} from "rxjs";
import {HttpClient, HttpEvent, HttpResponse} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Injectable()
export class PlayerEmbassyService extends SubscriptionManager {

    protected basePath = environment.backendServer;

    constructor(private dialog: MatDialog,
                private rpgService: RolePlayApiService,
                private httpClient: HttpClient) {
        super();
    }

    openEmbassy(player: Player) {
        const dialogConfig = DialogConfigHelper.createPlayerEmbassyDialog();
        dialogConfig.data = player;
        dialogConfig.width = '90%';
        (<string[]>dialogConfig.panelClass).push('player-embassy-dialog')
        const dialogRef = this.dialog.open(PlayerEmbassyComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result: RPGTextBlocks) => {
            if (!!result) {
                let sub = this.rpgService.editRPGTextBlocks(result).subscribe(() => {
                });
                this.subscriptions.push(sub);
            }
        });
    }

    getEmpireEmblem(idUser: number): Observable<FileUpload> {
        return this.rpgService.getEmpireEmblem(idUser);
    }

    getRPGData(): Observable<RolePlayData> {
        return this.rpgService.getRPGData();
    }

    deleteEmpireEmblem(): Observable<Boolean> {
        return this.rpgService.deleteEmpireEmblem();
    }

    uploadFiles(files: File[]) {

        files?.forEach(file => {
            let sub = this.uploadEmpireEmblem(file).subscribe(() => {
            });
            this.subscriptions.push(sub);
        });

    }

    static getPlayerTitle(player?: Player) {
        if (!player) {
            return '';
        }

        const rpg = player.rolePlayData;
        if (!rpg.title) {
            return !!rpg.titleAbbreviation ? rpg.titleAbbreviation : '';
        }
        return PlayerEmbassyService.g(rpg.title);
    }

    static getPlayerNameWithTitle(player?: Player) {
        if (!player) {
            return '';
        }

        const rpg = player.rolePlayData;
        if (!rpg.surname) {
            return player.username;
        }
        return PlayerEmbassyService.g(rpg.titleAbbreviation) + " " + this.g(rpg.firstname) + " " + this.g(rpg.surname);
    }

    static getPlayerName(player?: Player) {
        if (!player) {
            return '';
        }

        const rpg = player.rolePlayData;
        if (!rpg.surname) {
            return player.username;
        }
        return this.g(rpg.firstname) + " " + this.g(rpg.surname);
    }

    static getEmpireOrPlayerName(player?: Player) {
        if (!player) {
            return '';
        }

        const rpg = player.rolePlayData;
        if (!rpg.empireName) {
            return PlayerEmbassyService.getPlayerNameWithTitle(player);
        }
        return rpg.empireName;
    }

    static getPlayerEmpireName(player?: Player) {
        return !!player && !!player.rolePlayData.empireName ? player.rolePlayData.empireName : '';
    }

    private static g(text?: string) {
        return !!text ? text : "";
    }


    static getPlayersAllianceTag(player?: Player) {
        return !!player && !!player.allianceTag ? '[ ' + player.allianceTag + ' ]' : '';
    }

    /**
     * Uploads the empires emblem.
     *
     * @param file
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public uploadEmpireEmblem(file: File, observe?: 'body', reportProgress?: boolean): Observable<boolean>;
    public uploadEmpireEmblem(file: File, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<boolean>>;
    public uploadEmpireEmblem(file: File, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<boolean>>;
    public uploadEmpireEmblem(file: File, observe: any = 'body', reportProgress: boolean = false): Observable<any> {

        let formData: FormData = new FormData();
        formData.append('file', file, file.name)

        let headers = this.rpgService.defaultHeaders;
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');


        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json',
            'multipart/form-data',
            '*/*'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.rpgService.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        return this.httpClient.request<boolean>('post', `${this.basePath}/api/private/rpg/empire-emblem/`,
            {
                body: formData,
                withCredentials: this.rpgService.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }
}
