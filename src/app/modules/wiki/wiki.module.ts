import {NgModule} from '@angular/core';
import {WikiMainComponent} from './orga/wiki-main/wiki-main.component';
import {DisplayArticleComponent} from './payload/wiki-display/display-article.component';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {CreateArticleComponent} from './payload/create-article/create-article.component';
import {WikiOutletComponent} from './orga/wiki-outlet/wiki-outlet.component';
import {EditArticleComponent} from './payload/edit-article/edit-article.component';
import {WikiHeaderComponent} from './orga/wiki-header/wiki-header.component';
import {WikiFooterComponent} from './orga/wiki-footer/wiki-footer.component';
import {WikiSelectionComponent} from "./payload/wiki-selection/wiki-selection.component";


@NgModule({
    declarations: [
        WikiMainComponent,
        WikiSelectionComponent,
        DisplayArticleComponent,
        CreateArticleComponent,
        WikiOutletComponent,
        EditArticleComponent,
        WikiHeaderComponent,
        WikiFooterComponent,
    ],
    exports: [
        DisplayArticleComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class WikiModule {
}
