import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Topic} from "../../tutorial-scope.service";
import {ArticlePlainContent, WikiApiService} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../subscription.manager";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-tutorial-display',
    templateUrl: './tutorial-display.component.html',
    styleUrls: ['./tutorial-display.component.scss']
})
export class TutorialDisplayComponent extends SubscriptionManager {

    latestContent?: ArticlePlainContent;

    constructor(@Inject(MAT_DIALOG_DATA) public data: Topic,
                private spinner: NgxSpinnerService,
                private wikiService: WikiApiService) {
        super();

        if (!!this.data.uuid) {
            this.spinner.show('tutorial-spinner');
            let sub = this.wikiService.getTutorialArticle(this.data.uuid).subscribe(resp => {
                this.latestContent = resp;
                this.spinner.hide('tutorial-spinner');
            });
            this.subscriptions.push(sub);
        }
    }
}
