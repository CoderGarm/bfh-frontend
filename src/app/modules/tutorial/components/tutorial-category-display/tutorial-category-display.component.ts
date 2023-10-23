import {AfterViewInit, Component, Input} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {JWT} from "../../../../services/swagger";
import GameUserRolesEnum = JWT.GameUserRolesEnum;

@Component({
    selector: 'tut-category-display',
    templateUrl: './tutorial-category-display.component.html',
    styleUrls: ['./tutorial-category-display.component.scss']
})
export class TutorialCategoryDisplayComponent extends SubscriptionManager implements AfterViewInit {

    isWikiAdmin: boolean = false;

    @Input()
    uuid?: string

    ngAfterViewInit() {
        setTimeout(() => {
            this.isWikiAdmin = this.tokenStorage.isRole(GameUserRolesEnum.WIKI_ADMIN);
        }, 200);
    }
}
