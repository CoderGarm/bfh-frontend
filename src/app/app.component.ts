import {Component, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
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
import {WikiMainViewComponent} from "./modules/wiki/orga/wiki-main/wiki-main-view.component";
import {RegisterComponent} from "./components/user/register/register.component";
import {NavigationCommunicationService} from "./services/navigation/navigation-communication.service";
import {ForgottenPasswordComponent} from "./components/user/forgotten-password/forgotten-password.component";
import {Meta, Title} from "@angular/platform-browser";
import {DoNotScrollService} from "./services/intercom/do-not-scroll.service";
import {SnackbarNotificationService} from "./services/snackbar-notification.service";
import {DatePipe} from "@angular/common";
import {SpinnerService} from "./services/spinner.service";
import {NgxSpinnerService} from "ngx-spinner";
import {TakeATourComponent} from "./components/take-a-tour/take-a-tour.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {TopicSelectorComponent} from "./modules/tutorial/topic-selector/topic-selector.component";
import {TutorialScopeService} from "./modules/tutorial/tutorial-scope.service";
import {ColorSchemeService} from "./services/color-scheme.service";
import {MatDrawer} from "@angular/material/sidenav";
import {LibraryTabViewComponent} from "./modules/library/orga/library-main-view/library-tab-view.component";
import {NewspaperComponent} from "./components/newspaper/newspaper.component";
import {AssetHelper} from "./services/helper/asset.helper";
import {ToggleNavService} from "./services/intercom/toggle-nav.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends SubscriptionManager implements OnInit {

    title: string = 'bfh-fe';

    assetHelper?: AssetHelper;

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

    message?: string;
    rememberIgnoreScreenWarning: boolean;

    screenHeight?: number;
    screenWidth?: number;

    @ViewChild('drawer')
    drawer!: MatDrawer;

    constructor(private colorSchemeService: ColorSchemeService,
                private renderer: Renderer2,
                private spinnerService: SpinnerService,
                private spinner: NgxSpinnerService,
                private translate: TranslateService,
                private bottomSheet: MatBottomSheet,
                protected tutorialScope: TutorialScopeService,
                private router: Router,
                public doNotScrollService: DoNotScrollService,
                public toggleNavService: ToggleNavService,
                private meta: Meta,
                private titleService: Title,
                private authenticationService: AuthenticationService,
                private notif: SnackbarNotificationService,
                private datePipe: DatePipe,
                private navService: NavigationCommunicationService,
                private chatApi: ChatApiService,
                private forumApi: ForumApiService) {
        super();
        this.colorSchemeService.load();

        this.detectDeviceType();
        this.rememberIgnoreScreenWarning = this.tokenStorage.getRememberScreenWarning();

        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(TranslationEditorComponent.DEFAULT_LANGUAGE);

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        const browserLang = this.translate.getBrowserLang();
        if (!!browserLang) {
            this.translate.use(browserLang);
        }

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

        this.showSeasonBadge();

        sub = this.spinnerService.askSpinner().subscribe(event => {
            setTimeout(() => {
                if (event.showSpinner) {
                    this.message = event.message;
                    this.spinner.show('misc-spinner')
                } else {
                    this.spinner.hide('misc-spinner')
                }
            }, 100);
        });
        this.subscriptions.push(sub);


        if (!this.rememberIgnoreScreenWarning && window.innerWidth <= 800) {
            this.spinner.show('screen-size');
        }
    }

    private detectDeviceType() {
        const ua = navigator.userAgent;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
            this.isMobileBrowser = true;
            this.renderer.addClass(document.body, 'mobile-width');
        } else if (/Chrome/i.test(ua)) {
            this.isMobileBrowser = false;
        } else {
            this.isMobileBrowser = false;
        }
    }

    /**
     * Incredible strange way to detect the true size of the screen.
     */
    @HostListener('window:resize', ['$event'])
    @HostListener('window:load', ['$event'])
    @HostListener('window:click', ['$event'])
    @HostListener('window:touchmove', ['$event'])
    @HostListener('window:wheel', ['$event'])
    getScreenSize(event?: any) {

        if (!this.isMobileBrowser) {
            return;
        }

        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;

        const metaViewport = document.querySelector('meta[name=viewport]')!;
        let content = metaViewport.getAttribute('content')!;
        const strings = content.split(',');
        for (let i = 0; i < strings.length; i++) {
            let string = strings[i];
            if (string.trim().startsWith('height')) {
                strings[i] = 'height=' + this.screenHeight + 'px';
            } else {
                strings[i] = string.trim();
            }
        }
        content = strings.join(', ');
        metaViewport.setAttribute('content', content);
    }

    openBottomSheet(): void {
        this.bottomSheet.open(TopicSelectorComponent);
    }

    showSeasonBadge() {
        const date = new Date();
        date.setDate(1);
        date.setMonth(5);
        date.setFullYear(2023)
        const timeframe = this.datePipe.transform(date, 'MM/dd/yyyy')!;
        const now = this.datePipe.transform(new Date(), 'MM/dd/yyyy')!;
        if (now < timeframe) {
            // todo season badge
            // this.notif.open('Season 2 has launched!', 'Ok', 20000);
        }
    }

    ngOnInit(): void {
        let sub = this.authenticationService.getAccessData().subscribe(loggedIn => {
            this.isLoggedIn = !!loggedIn;
            this.detectUnreadMessages();
        });
        this.subscriptions.push(sub);

        const source = interval(AppComponent.CHECK_MESSAGES_INTERVAL_IN_SECONDS);
        sub = source.subscribe(() => {
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
        this.isNoScroll = this.noScrollingForFullSection.includes(path!, 0);

        console.log(path)
        if (WikiMainViewComponent.path === path) {
            this.drawer.close();
        }
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
            && !this.router.url.endsWith(NewspaperComponent.path)
            && !this.router.url.endsWith(RegisterComponent.path)
            && !this.router.url.includes(ForgottenPasswordComponent.path)
            && !this.router.url.endsWith(WikiMainViewComponent.path)
            && !this.router.url.endsWith(LibraryTabViewComponent.path)
            && !this.router.url.endsWith(TakeATourComponent.path)
            ;
    }
}
