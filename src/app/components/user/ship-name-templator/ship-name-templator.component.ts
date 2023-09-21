import {AfterViewInit, Component} from '@angular/core';
import {EnumValueDto, RolePlayApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import EStarNationsEnum = EnumValueDto.EStarNationsEnum;

@Component({
    selector: 'app-ship-name-templator',
    templateUrl: './ship-name-templator.component.html',
    styleUrls: ['./ship-name-templator.component.scss']
})
export class ShipNameTemplatorComponent extends SubscriptionManager implements AfterViewInit {

    readonly nations: EStarNationsEnum[] = [
        EStarNationsEnum.MANTICORE,
        EStarNationsEnum.HAVEN,
        EStarNationsEnum.ANDERMAN,
        EStarNationsEnum.SILESIA,
        EStarNationsEnum.SOLARIAN_LEAGUE
    ];

    templates: EStarNationsEnum[] = [];
    selectedNames: string[] = [];
    templatedNames: string[] = [];
    templateNames: Map<EStarNationsEnum, string[]> = new Map<EnumValueDto.EStarNationsEnum, string[]>();
    selectedTemplate?: EStarNationsEnum;

    constructor(private rpgService: RolePlayApiService,) {
        super();
    }


    ngAfterViewInit() {
        let sub = this.rpgService.getShipNameTemplates().subscribe(resp => this.templates = resp.shipNameTemplates);
        this.subscriptions.push(sub);

        sub = this.rpgService.getShipNamesForUser().subscribe(resp => this.selectedNames = resp);
        this.subscriptions.push(sub);

        this.nations.forEach(value => {
            let sub = this.rpgService.getShipNamesFor(value).subscribe(resp => this.templateNames.set(value, resp));
            this.subscriptions.push(sub);
        });

        setTimeout(() => {
            this.displayTemplateNames(EStarNationsEnum.MANTICORE);
        }, 2000);
    }

    displayTemplateNames(event: EStarNationsEnum) {
        this.selectedTemplate = event;
        if (this.templateNames.has(event)) {
            this.templatedNames = this.templateNames.get(event)!;
        } else {
            this.templatedNames = [];
        }
    }
}
