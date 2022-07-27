import {Component, OnInit} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
import {AuthenticationService} from './services/authentication';
import {NavigationCreationService} from './services/navigation-creation.service';
import {interval} from "rxjs";
import {StarMapTabViewComponent} from "./modules/star-map/orga/star-map-tab-view/star-map-tab-view.component";
import {JournalTabViewComponent} from "./modules/journal/components/orga/journal-tab-view/journal-tab-view.component";
import {ChatComponent} from "./modules/chat/components/chat/chat.component";
import {ChatApiService, ForumApiService} from "./services/swagger";
import {SubscriptionManager} from "./SubscriptionManager";
import {ForumsListComponent} from "./modules/forum/components/forums-list/forums-list.component";
import {TranslateService} from "@ngx-translate/core";
import {TranslationEditorComponent} from "./modules/admin/components/payload/translation-editor/translation-editor.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends SubscriptionManager implements OnInit {

    title: string = 'bfh-fe';

    routes: Routes = NavigationCreationService.createNavDrawerRoutes();

    isLoggedIn: boolean = false;

    hasUnreadChat: boolean = false;
    hasUnreadForum: boolean = false;

    activeRoute?: Route;

    isNoScroll: Boolean = false;
    private noScrollingPaths: string[] = [
        StarMapTabViewComponent.path,
        JournalTabViewComponent.path,
        ChatComponent.path
    ];

    constructor(private translate: TranslateService,
                private router: Router,
                private authenticationService: AuthenticationService,
                private chatApi: ChatApiService,
                private forumApi: ForumApiService) {
        super();

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang(TranslationEditorComponent.DEFAULT_LANGUAGE);

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        const userLang = navigator.language;
        if (!!userLang) {
            // from de-DE or en-US to de or en
            const lang = userLang.substring(0, 2);
            translate.use(lang);
        }
    }

    ngOnInit(): void {
        let sub = this.authenticationService.getAccessData().subscribe(loggedIn => this.isLoggedIn = !!loggedIn);
        this.subscriptions.push(sub);

        // detect unread at login ...
        this.detectUnreadMessages();

        const source = interval(2000);
        sub = source.subscribe(val => {
            // and later again repetitive
            this.detectUnreadMessages();
        });
        this.subscriptions.push(sub);
    }

    private detectUnreadMessages() {
        if (this.isLoggedIn) {
            let sub = this.chatApi.hasUserUnread().subscribe(resp => this.hasUnreadChat = resp)
            this.subscriptions.push(sub);
            sub = this.forumApi.hasUserUnreadMessages().subscribe(resp => this.hasUnreadForum = resp)
            this.subscriptions.push(sub);
        }
    }

    navigate(route?: Route) {
        if (!route) {
            route = NavigationCreationService.getLoginRoute();
        }
        this.activeRoute = route;
        this.router.navigateByUrl("/" + route.path).then(() => {
        });
        const path = this.activeRoute.path;
        this.isNoScroll = this.noScrollingPaths.includes(path!, 0);
    }

    hasUnread(path: string) {
        if (path === ChatComponent.path) {
            return this.hasUnreadChat;
        } else if (path === ForumsListComponent.path) {
            return this.hasUnreadForum;
        }
        return false;
    }
}
