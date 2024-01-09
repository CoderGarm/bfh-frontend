import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {ForumsListComponent} from './components/forums-list/forums-list.component';
import {ForumMessagesComponent} from './components/forum-messages/forum-messages.component';
import {ForumThreadsComponent} from './components/forum-threads/forum-threads.component';
import {ForumsCommunicationService} from "./forums-communication.service";
import {CreateForumThreadComponent} from './components/create-forum-thread/create-forum-thread.component';
import {DisplayElementsModule} from "../display-elements/display-elements.module";


@NgModule({
    declarations: [
        ForumsListComponent,
        ForumMessagesComponent,
        ForumThreadsComponent,
        CreateForumThreadComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ],
    exports: [
        ForumsListComponent,
    ],
    providers: [
        ForumsCommunicationService
    ]
})
export class ForumModule {
}
