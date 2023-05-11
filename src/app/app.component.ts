import {Component, OnInit} from '@angular/core';
import {NavigationStart, Route, Router, Routes} from '@angular/router';
import {AuthenticationService} from './services/authentication';
import {NavigationCreationService} from './services/navigation/navigation-creation.service';
import {interval} from "rxjs";
import {StarMapTabViewComponent} from "./modules/star-map/orga/star-map-tab-view/star-map-tab-view.component";
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
import {ForgottenPasswordComponent} from "./components/user/forgotten-password/forgotten-password.component";
import {Meta, Title} from "@angular/platform-browser";
import {DoNotScrollService} from "./services/intercom/do-not-scroll.service";
import {SnackbarNotificationService} from "./services/snackbar-notification.service";
import {DatePipe} from "@angular/common";


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

    isNoScroll: boolean = false;
    private noScrollingForFullSection: string[] = [
        StarMapTabViewComponent.path,
        ChatComponent.path
    ];

    isStandalone: boolean = false;

    constructor(private translate: TranslateService,
                private router: Router,
                public doNotScrollService: DoNotScrollService,
                private meta: Meta,
                private titleService: Title,
                private authenticationService: AuthenticationService,
                private notif: SnackbarNotificationService,
                private datePipe: DatePipe,
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

        const path = NavigationCreationService.getExternalRoutes().map(r => r.path);
        this.router.events.subscribe((routerData) => {
            path.forEach(path => {
                if (routerData instanceof NavigationStart && routerData.url.includes('/' + path)) {
                    this.isStandalone = true;
                    this.notif.close();
                }
            });
        });

        this.navService.getNavigationEmitter().subscribe(route => this.navigate(route));

        this.titleService.setTitle("Battle for Honor");
        this.meta.addTags([
            {name: 'keywords', content: 'honor harrington, honorverse, browsergame, 4x, round based, turn based, rundenbasiert, strategy, strategie'},
            {name: 'description', content: 'A browsergame in the honorverse'},
            {name: 'og:description', content: 'A browsergame in the honorverse'},
            {name: 'og:type', content: 'game'},
            {name: 'og:site_name', content: 'Battle for Honor'},
            {name: 'og:title', content: 'Battle for Honor'},
            {name: 'og:url', content: 'https://www.battleforhonor.de'},
        ]);

        let sub = this.doNotScrollService.getNoScrollEmitter().subscribe(noScroll => this.isNoScroll = noScroll);
        this.subscriptions.push(sub);

        if (!this.isStandalone) {
            this.showSeasonBadge();
        }
    }

    showSeasonBadge() {
        const date = new Date();
        date.setDate(1);
        date.setMonth(5);
        date.setFullYear(2023)
        const timeframe = this.datePipe.transform(date, 'MM/dd/yyyy')!;
        const now = this.datePipe.transform(new Date(), 'MM/dd/yyyy')!;
        if (now < timeframe) {
            this.notif.open('Season 2 has launched!', 'Ok', 20000);
        }
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
            let sub = this.chatApi.hasUserUnread().subscribe(resp => this.setUnread(resp, ChatComponent.path), error => {
            });
            this.subscriptions.push(sub);
            sub = this.forumApi.hasUserUnreadMessages().subscribe(resp => this.setUnread(resp, ForumsListComponent.path), error => {
            });
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
        this.isNoScroll = this.noScrollingForFullSection.includes(path!, 0);
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
            && !this.router.url.includes(ForgottenPasswordComponent.path)
            && !this.router.url.endsWith(WikiMainComponent.path);
    }
}
