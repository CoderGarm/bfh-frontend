import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {SubscriptionManager} from "../../subscription.manager";
import {DialogConfigHelper} from "../helper/dialog-config.helper";
import {Alliance, AllianceApiService, FileUpload, RPGTextBlocks} from "../swagger";
import {Observable} from "rxjs";
import {HttpClient, HttpEvent, HttpResponse} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {SnackbarNotificationService} from "../snackbar-notification.service";
import {AllianceEmbassyComponent} from "../../modules/alliance/components/payload/alliance-embassy/alliance-embassy.component";
import {DomSanitizer} from "@angular/platform-browser";

@Injectable()
export class AllianceEmbassyService extends SubscriptionManager {

    protected basePath = environment.backendServer;

    private readonly imageType: string = 'data:image/JPEG;base64,';

    constructor(private dialog: MatDialog,
                private sanitizer: DomSanitizer,
                private notif: SnackbarNotificationService,
                private allianceService: AllianceApiService,
                private httpClient: HttpClient) {
        super();
    }

    openEmbassy(alliance: Alliance) {

        if (this.isHandheldDisplaySize) {
            this.notif.open('No embassy in mobile devices, sorry! I\'m working on a solution.');
            return;
        }

        const dialogConfig = DialogConfigHelper.createPlayerEmbassyDialog();
        dialogConfig.data = alliance;
        (<string[]>dialogConfig.panelClass).push('alliance-embassy-dialog')
        const dialogRef = this.dialog.open(AllianceEmbassyComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result: RPGTextBlocks) => {
            if (!!result) {
                let sub = this.allianceService.editAllianceTextBlocks(result, alliance.idAlliance).subscribe(() => {
                });
                this.subscriptions.push(sub);
            }
        });
    }

    getAllyEmblem(idAlliance: number): Observable<FileUpload> {
        return this.allianceService.getAllianceEmblem(idAlliance);
    }

    getAllyEmblemAsImage(resp?: FileUpload) {
        return !!resp ? this.sanitizer.bypassSecurityTrustUrl(this.imageType + resp.content) : undefined;
    }


    getRPGData(idAlliance: number): Observable<RPGTextBlocks> {
        return this.allianceService.getAllianceRPGData(idAlliance);
    }

    deleteAllyEmblem(idAlliance: number): Observable<Boolean> {
        return this.allianceService.deleteAllianceEmblem(idAlliance);
    }

    uploadFiles(idAlliance: number, files: File[]) {

        files?.forEach(file => {
            let sub = this.uploadEmpireEmblem(idAlliance, file).subscribe(() => {
            });
            this.subscriptions.push(sub);
        });

    }

    /**
     * Uploads the empires emblem.
     *
     * @param idAlliance
     * @param file
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public uploadEmpireEmblem(idAlliance: number, file: File, observe?: 'body', reportProgress?: boolean): Observable<boolean>;
    public uploadEmpireEmblem(idAlliance: number, file: File, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<boolean>>;
    public uploadEmpireEmblem(idAlliance: number, file: File, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<boolean>>;
    public uploadEmpireEmblem(idAlliance: number, file: File, observe: any = 'body', reportProgress: boolean = false): Observable<any> {

        let formData: FormData = new FormData();
        formData.append('file', file, file.name)

        let headers = this.allianceService.defaultHeaders;
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');


        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json',
            'multipart/form-data',
            '*/*'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.allianceService.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        return this.httpClient.request<boolean>('post', `${this.basePath}/api/private/alliances/empire-emblem/${encodeURIComponent(String(idAlliance))}`,
            {
                body: formData,
                withCredentials: this.allianceService.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }
}
