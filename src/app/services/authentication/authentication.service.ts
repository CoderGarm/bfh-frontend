import {AuthApiService, AuthRequest, JWT} from '../swagger';
import {HomeComponent} from '../../components/home/home.component';
import {HttpErrorResponse} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {AuthService} from 'ngx-auth';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {TokenStorage} from './token-storage.service';
import {Router} from '@angular/router';
import {NgxPermissionsService} from 'ngx-permissions';
import {SubscriptionManager} from "../../SubscriptionManager";

@Injectable()
export class AuthenticationService extends SubscriptionManager implements AuthService {

    loginEvent: EventEmitter<JWT> = new EventEmitter<JWT>();

    logoutEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

    unauthorizedCounter: number = 0;

    constructor(private router: Router,
                private tokenStorage: TokenStorage,
                private authService: AuthApiService,
                private permissionsService: NgxPermissionsService) {
        super();
    }

    private subjectAccessData = new Subject<JWT>();

    setAccessData(access: JWT) {
        this.setPermissionsByRole(access.role);
        this.subjectAccessData.next(access);
    }

    clearAccessData() {
        this.subjectAccessData.next();
    }

    getAccessData(): Observable<JWT> {
        return this.subjectAccessData.asObservable();
    }

    /**
     * Check, if user already authorized.
     * @description Should return Observable with true or false values
     * @returns {Observable<boolean>}
     * @memberOf AuthService
     */
    isAuthorized(): Observable<boolean> {
        return this.tokenStorage.getAccessToken().pipe(map(token => !!token));
    }

    /**
     * Get access token
     * @description Should return access token in Observable from e.g.
     * localStorage
     * @returns {Observable<string>}
     */
    getAccessToken(): Observable<string> {
        return this.tokenStorage.getAccessToken();
    }

    /**
     * Function, that should perform refresh token verifyTokenRequest
     * @description Should be successfully completed so interceptor
     * can execute pending requests or retry original one
     * @returns {Observable<any>}
     */
    refreshToken(): Observable<JWT> {
        this.subscriptions.push(this.tokenStorage.getRefreshToken().subscribe(refreshToken => {
            this.subscriptions.push(this.authService.refresh(refreshToken).subscribe(resp => {
                this.tokenStorage.setInterruptedURL("true")
                this.saveAccessData(resp)
            }));
        }));
        return this.getAccessData().pipe(map(tokens => tokens));
    }

    /**
     * Function, checks response of failed request to determine,
     * whether token be refreshed or not.
     * @description essential checks status
     * @param {Response} response
     * @returns {boolean}
     */
    refreshShouldHappen(response: HttpErrorResponse): boolean {
        let unauthorized = response.status === 401;
        if (unauthorized) {
            this.unauthorizedCounter++;
        }
        if (this.unauthorizedCounter > 5) {
            this.logout();
        }
        return unauthorized;
    }

    /**
     * Verify that outgoing request is refresh-token,
     * so interceptor won't intercept this request
     * @param {string} url
     * @returns {boolean}
     */
    verifyTokenRequest(url: string): boolean {
        return url.endsWith('/refresh') || url.endsWith('/login');
    }


    private setPermissionsByRole(role: string) {
        let permissions: string[] = [];
        permissions.push(role);
        this.permissionsService.loadPermissions(permissions);
    }


    login(login: AuthRequest): Observable<JWT> {
        let sub = this.authService.login(login).subscribe(resp => {
            this.saveAccessData(resp);
        }, () => {
            this.clearAccessData();
            return Observable.apply(null);
        });
        this.subscriptions.push(sub);
        return this.getAccessData();
    }

    logout(): void {
        this.tokenStorage.clear();
        this.permissionsService.flushPermissions();
        this.clearAccessData();
        this.logoutEvent.next(true);
        this.router.navigateByUrl(HomeComponent.path).then(() => {
        });
    }

    clear(): void {
        this.tokenStorage.clear();
    }

    private saveAccessData(token: JWT) {
        this.tokenStorage
            .setAccessToken(token.accessToken)
            .setRefreshToken(token.refreshToken)
            .setLogin(token.username)
            .setRole(token.role)
            .setGameRoles(token.gameUserRoles)
            .setUserID(token.idUser)
            .setAllianceID(token.idAlliance);

        this.setAccessData(token);

        this.loginEvent.next(token);
    }
}
