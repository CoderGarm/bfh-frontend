import {Component, OnInit} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
import {AuthenticationService} from './services/authentication';
import {NavigationCreationService} from './services/navigation/navigation-creation.service';
import {interval} from "rxjs";
import {StarMapTabViewComponent} from "./modules/star-map/orga/star-map-tab-view/star-map-tab-view.component";
import {JournalTabViewComponent} from "./modules/journal/components/orga/journal-tab-view/journal-tab-view.component";
import {ChatComponent} from "./modules/chat/components/chat/chat.component";
import {ChatApiService, ForumApiService} from "./services/swagger";
import {SubscriptionManager} from "./subscription.manager";
import {ForumsListComponent} from "./modules/forum/components/forums-list/forums-list.component";
import {TranslateService} from "@ngx-translate/core";
import {TranslationEditorComponent} from "./modules/admin/components/payload/translation-editor/translation-editor.component";
import {LoginComponent} from "./components/user/login/login.component";
import {HomeComponent} from "./components/home/home.component";
import {WikiMainComponent} from "./modules/wiki/orga/wiki-main/wiki-main.component";
import {RegisterComponent} from "./components/user/register/register.component";
import {NavigationCommunicationService} from "./services/navigation/navigation-communication.service";


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends SubscriptionManager implements OnInit {

    title: string = 'bfh-fe';

    static CHECK_MESSAGES_INTERVAL_IN_SECONDS: number = 60 * 1000;

    routes: Routes = NavigationCreationService.createSidenavRoutes();
    afterLoginPath: string = NavigationCreationService.AFTER_LOGIN_ROUTE;

    isLoggedIn: boolean = false;

    hasUnread: string[] = [];

    isNoScroll: Boolean = false;
    private noScrollingPaths: string[] = [
        StarMapTabViewComponent.path,
        JournalTabViewComponent.path,
        ChatComponent.path
    ];


    constructor(private translate: TranslateService,
                private router: Router,
                private authenticationService: AuthenticationService,
                private navService: NavigationCommunicationService,
                private chatApi: ChatApiService,
                private forumApi: ForumApiService) {
        super();

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang(TranslationEditorComponent.DEFAULT_LANGUAGE);

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        const browserLang = translate.getBrowserLang();
        if (!!browserLang) {
            translate.use(browserLang);
        }

        this.navService.getNavigationEmitter().subscribe(route => this.navigate(route));
    }

    ngOnInit(): void {
        let sub = this.authenticationService.getAccessData().subscribe(loggedIn => {
            this.isLoggedIn = !!loggedIn;
            this.detectUnreadMessages();
        });
        this.subscriptions.push(sub);

        const source = interval(AppComponent.CHECK_MESSAGES_INTERVAL_IN_SECONDS);
        sub = source.subscribe(val => {
            // and later again repetitive
            this.detectUnreadMessages();
        });
        this.subscriptions.push(sub);
    }

    private detectUnreadMessages() {
        if (this.isLoggedIn) {
            let sub = this.chatApi.hasUserUnread().subscribe(resp => this.setUnread(resp, ChatComponent.path));
            this.subscriptions.push(sub);
            sub = this.forumApi.hasUserUnreadMessages().subscribe(resp => this.setUnread(resp, ForumsListComponent.path));
            this.subscriptions.push(sub);
        }
    }

    private navigate(route?: Route) {
        if (!route) {
            route = NavigationCreationService.getLoginRoute();
        }
        this.navService.activeRoute = route;
        this.router.navigateByUrl("/" + route.path).then(() => {
        });
        const path = this.navService.activeRoute.path;
        this.isNoScroll = this.noScrollingPaths.includes(path!, 0);
    }

    setUnread(hasUnread: boolean, path: string) {
        if (hasUnread) {
            this.hasUnread.push(path);
        } else {
            const indexOf = this.hasUnread.indexOf(path);
            if (indexOf != -1) {
                this.hasUnread.splice(indexOf, 1);
            }
        }
    }

    displayWelcome() {
        return !this.isLoggedIn
            && !this.router.url.endsWith(LoginComponent.path)
            && !this.router.url.endsWith(HomeComponent.path)
            && !this.router.url.endsWith(RegisterComponent.path)
            && !this.router.url.endsWith(WikiMainComponent.path);
    }
}
