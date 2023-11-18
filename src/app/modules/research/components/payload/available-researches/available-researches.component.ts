import {AfterViewInit, Component} from '@angular/core';
import {ResearchApiService, ResearchLevel} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-available-researches',
    templateUrl: './available-researches.component.html',
    styleUrls: ['./available-researches.component.scss']
})
export class AvailableResearchesComponent extends SubscriptionManager implements AfterViewInit {

    availableResearches: ResearchLevel[] = [];

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: ResearchLevel;

    /**
     * if starting a research job is possible
     */
    researchPossible: boolean = false;

    filterValue: string = '';

    constructor(private researchApi: ResearchApiService,
                private translate: TranslateService,
                private notif: SnackbarNotificationService) {
        super();

        this.translate.instant('research.started');
        this.translate.instant('research.insta-finished');
    }

    ngAfterViewInit() {
        let sub = this.researchApi.getAvailableResearchByUser().subscribe(resp => this.availableResearches = resp);
        this.subscriptions.push(sub);

        sub = this.researchApi.researchPossibleForUser().subscribe(resp => this.researchPossible = resp);
        this.subscriptions.push(sub);
    }

    /**
     * starts a research job
     *
     * @param research the research with its level to run as job
     */
    runResearch(research: ResearchLevel) {
        if (!!research) {
            this.notif.open('research.started');
            this.researchPossible = false;
            let sub = this.researchApi.startResearchByUser(research).subscribe(resp => {
                if (!resp.ticksLeft || resp.ticksLeft == 0) {
                    this.notif.open('research.insta-finished');
                    this.ngAfterViewInit();
                }
            });
            this.subscriptions.push(sub);
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    /**
     * checks if this particular research is possible
     *
     * @param researchLevel the research
     */
    isResearchPossible(researchLevel: ResearchLevel): boolean {
        if (!this.researchPossible) {
            return false;
        }
        return researchLevel.level <= researchLevel.research.levelCap;
    }

    getInvisibility(researchLevel: ResearchLevel) {
        return this.currentlyOpenedItemIndex === researchLevel ? 'invisible' : '';
    }
}
