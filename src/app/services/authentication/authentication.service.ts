import {AuthRequest} from '../swagger';
import {AuthApiService} from '../swagger';
import {HomeComponent} from '../../components/home/home.component';
import {HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AuthService} from 'ngx-auth';
import {Observable, Subject, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {TokenStorage} from './token-storage.service';
import {Router} from '@angular/router';
import {JWTRes} from '../swagger';
import {NgxPermissionsService} from 'ngx-permissions';

@Injectable()
export class AuthenticationService implements AuthService {

  private subscriptions: Subscription[] = [];

  constructor(private router: Router,
              private tokenStorage: TokenStorage,
              private authService: AuthApiService,
              private permissionsService: NgxPermissionsService) {
  }

  private subjectAccessData = new Subject<JWTRes>();

  setAccessData(access: JWTRes) {
    this.setPermissionsByRole(access.role);
    this.subjectAccessData.next(access);
  }

  clearAccessData() {
    this.subjectAccessData.next();
  }

  getAccessData(): Observable<JWTRes> {
    return this.subjectAccessData.asObservable();
  }

  /**
   * Check, if user already authorized.
   * @description Should return Observable with true or false values
   * @returns {Observable<boolean>}
   * @memberOf AuthService
   */
  public isAuthorized(): Observable<boolean> {
    return this.tokenStorage.getAccessToken().pipe(map(token => !!token));
  }

  /**
   * Get access token
   * @description Should return access token in Observable from e.g.
   * localStorage
   * @returns {Observable<string>}
   */
  public getAccessToken(): Observable<string> {
    return this.tokenStorage.getAccessToken();
  }

  /**
   * Function, that should perform refresh token verifyTokenRequest
   * @description Should be successfully completed so interceptor
   * can execute pending requests or retry original one
   * @returns {Observable<any>}
   */
  public refreshToken(): Observable<JWTRes> {
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
   * @description Essentialy checks status
   * @param {Response} response
   * @returns {boolean}
   */
  public refreshShouldHappen(response: HttpErrorResponse): boolean {
    return response.status === 401 || response.status === 403;
  }

  /**
   * Verify that outgoing request is refresh-token,
   * so interceptor won't intercept this request
   * @param {string} url
   * @returns {boolean}
   */
  public verifyTokenRequest(url: string): boolean {
    return url.endsWith('/refresh');
  }


  private setPermissionsByRole(role: JWTRes.RoleEnum) {
    let permissions: string[] = [];
    permissions.push(role);
    this.permissionsService.loadPermissions(permissions);
  }


  public login(login: AuthRequest): Observable<JWTRes> {
    this.subscriptions.push(this.authService.login(login).subscribe(resp => {
      this.saveAccessData(resp);
    }));
    return this.getAccessData();
  }

  public logout(): void {
    this.tokenStorage.clear();
    this.permissionsService.flushPermissions();
    this.clearAccessData();
    this.router.navigateByUrl(HomeComponent.path);
  }

  public clear(): void {
    this.tokenStorage.clear();
  }

  private saveAccessData(token: JWTRes) {
    this.tokenStorage
      .setAccessToken(token.accessToken)
      .setRefreshToken(token.refreshToken)
      .setLogin(token.username)
      .setRole(token.role)
      .setUserID(token.idUser);

    this.setAccessData(token);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
