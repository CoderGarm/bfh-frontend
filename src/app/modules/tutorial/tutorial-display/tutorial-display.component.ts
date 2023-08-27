import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Topic} from "../tutorial-scope.service";

@Component({
    selector: 'app-tutorial-display',
    templateUrl: './tutorial-display.component.html',
    styleUrls: ['./tutorial-display.component.scss']
})
export class TutorialDisplayComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: Topic) {
    }

}
