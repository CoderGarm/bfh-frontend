import {Component} from '@angular/core';
import {ResearchTree} from "../../../../services/swagger";

@Component({
    selector: 'app-library-tab-view',
    templateUrl: './library-tab-view.component.html',
    styleUrls: ['./library-tab-view.component.scss']
})
export class LibraryTabViewComponent {

    static path: string = 'library';

    tree?: ResearchTree;

}
