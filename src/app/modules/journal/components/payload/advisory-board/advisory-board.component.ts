import {AfterViewInit, Component} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {AdvisoryApiService, Construction, Planet, Research, TickAdvice, TradeContract} from "../../../../../services/swagger";
import {SpinnerService} from "../../../../../services/spinner.service";

@Component({
    selector: 'app-advisory-board',
    templateUrl: './advisory-board.component.html',
    styleUrls: ['./advisory-board.component.scss']
})
export class AdvisoryBoardComponent extends SubscriptionManager implements AfterViewInit {

    pirateHunt: Planet[] = [];
    convoyProtection: TradeContract[] = [];
    infra?: TickAdvice;
    suggestedConstruction?: Construction;
    suggestedResearch?: Research;

    nothing: boolean = false;
    spinnerActive: boolean = true;

    constructor(private advisoryService: AdvisoryApiService,
                private spinner: SpinnerService) {
        super();
    }

    ngAfterViewInit() {
        this.spinner.show('advisory-spinner');

        let sub = this.advisoryService.getPirateHuntAdvice().subscribe(resp => this.pirateHunt = resp);
        this.subscriptions.push(sub);

        sub = this.advisoryService.getConvoyProtectionAdvice().subscribe(resp => this.convoyProtection = resp);
        this.subscriptions.push(sub);

        sub = this.advisoryService.getConstructionAdvice().subscribe(resp => {
            this.infra = resp;
            this.suggestedResearch = resp.suggestedResearch;
            if (!!resp.suggestedBuilding) {
                this.suggestedConstruction = {
                    idConstruction: -1,
                    building: resp.suggestedBuilding,
                    level: 0,
                    nextLevel: false,
                    operationalLevel: 0
                }
            }
            this.nothing = !resp.constructionPossible && !resp.researchPossible && !resp.shipyardPossible && !resp.suggestedResearch && !resp.suggestedBuilding;
            this.spinner.hide('advisory-spinner');
            this.spinnerActive = false;
        });
        this.subscriptions.push(sub);
    }
}
