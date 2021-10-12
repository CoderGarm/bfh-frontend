import {AfterViewInit, Component} from '@angular/core';
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {ResearchApiService} from "../../../../services/swagger/api/researchApi.service";
import {Subscription} from "rxjs";
import {ResearchLevel} from "../../../../services/swagger";

@Component({
    selector: 'app-completed-researches',
    templateUrl: './completed-researches.component.html',
    styleUrls: ['./completed-researches.component.scss']
})
export class CompletedResearchesComponent implements AfterViewInit {

    /**
     * every sub which should be cancelled on destroy
     * @private
     */
    private subscriptions: Subscription[] = [];

    completedResearches: ResearchLevel[] = [];

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: ResearchLevel;

    constructor(private tokenStorage: TokenStorage, private researchApi: ResearchApiService) {
    }

    ngAfterViewInit() {
        if (!!this.tokenStorage.getUserID()) {
            let sub = this.researchApi.getResearchByUser(this.tokenStorage.getUserID())
                .subscribe(resp => this.completedResearches = resp);
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
}
