import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {ForumsListComponent} from './components/forums-list/forums-list.component';
import {ForumMessagesComponent} from './components/forum-messages/forum-messages.component';
import {ForumThreadsComponent} from './components/forum-threads/forum-threads.component';
import {ForumsNotificationService} from "./forums-notification.service";
import {CreateForumThreadComponent} from './components/create-forum-thread/create-forum-thread.component';


@NgModule({
    declarations: [
        ForumsListComponent,
        ForumMessagesComponent,
        ForumThreadsComponent,
        CreateForumThreadComponent,
    ],
    imports: [
        SharedModuleModule,
    ],
    exports: [
        ForumsListComponent
    ],
    providers: [
        ForumsNotificationService
    ]
})
export class ForumModule {
}
