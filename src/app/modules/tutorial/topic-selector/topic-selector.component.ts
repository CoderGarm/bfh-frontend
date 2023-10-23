import {Component} from '@angular/core';
import {Topic, TutorialScopeService} from "../tutorial-scope.service";
import {MatDialog} from "@angular/material/dialog";
import {TutorialDisplayComponent} from "../components/tutorial-display/tutorial-display.component";

@Component({
    selector: 'app-topic-selector',
    templateUrl: './topic-selector.component.html',
    styleUrls: ['./topic-selector.component.scss']
})
export class TopicSelectorComponent {

    constructor(protected scopeService: TutorialScopeService,
                protected dialog: MatDialog) {
    }

    openDialog(topic: Topic) {
        const dialogRef = this.dialog.open(TutorialDisplayComponent,
            {
                data: topic
            });
        this.scopeService.setOpenTopic(topic);

        dialogRef.afterClosed().subscribe(result => {
            this.dialog.closeAll();
            this.scopeService.setOpenTopic(undefined);
        });
    }

    protected readonly top = top;
}
