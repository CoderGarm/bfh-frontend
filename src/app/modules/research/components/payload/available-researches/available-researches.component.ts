import {AfterViewInit, Component} from '@angular/core';
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {JobApiService, ResearchApiService, ResearchLevel} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

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

    constructor(private tokenStorage: TokenStorage,
                private researchApi: ResearchApiService,
                private jobApi: JobApiService) {
        super();
    }

    ngAfterViewInit() {
        if (!!this.tokenStorage.getUserID()) {
            let sub = this.researchApi.getResearchByUser(this.tokenStorage.getUserID())
                .subscribe(resp => this.availableResearches = resp);
            this.subscriptions.push(sub);

            sub = this.researchApi.researchPossibleForUser(this.tokenStorage.getUserID())
                .subscribe(resp => this.researchPossible = resp);
            this.subscriptions.push(sub);
        }
    }

    /**
     * starts a research job
     *
     * @param research the research with it's level to run as job
     */
    runResearch(research: ResearchLevel) {
        if (!!research) {
            let sub = this.researchApi.startResearchByUser(research, this.tokenStorage.getUserID())
                .subscribe(resp => {
                    this.researchPossible = false;
                });
            this.subscriptions.push(sub);
        }
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the opened item
     * @param itemIndex
     */
    setOpened(itemIndex: ResearchLevel) {
        this.currentlyOpenedItemIndex = itemIndex;
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the closed item
     * @param itemIndex
     */
    setClosed(itemIndex: ResearchLevel) {
        if (this.currentlyOpenedItemIndex === itemIndex) {
            this.currentlyOpenedItemIndex = undefined;
        }
    }

    /**
     * returns true if the description should be displayed, false otherwise
     * @param research
     */
    showDescription(research: ResearchLevel): boolean {
        return this.currentlyOpenedItemIndex != research;
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
        return researchLevel.level < researchLevel.research.levelCap;

    }
}
