import { JWTReq } from './../swagger/model/jWTReq';
import { AuthRequest } from './../swagger/model/authRequest';
import { AuthApiService } from './../swagger/api/authApi.service';
import { UserApiService } from './../swagger/api/userApi.service';
import { HomeComponent } from './../../components/home/home.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'ngx-auth';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokenStorage } from './token-storage.service';
import { Router } from '@angular/router';
import { JWTRes } from '../swagger/model/models';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable()
export class AuthenticationService implements AuthService {

  constructor(private router: Router, private tokenStorage: TokenStorage,
              private authService: AuthApiService, 
              private permissionsService: NgxPermissionsService) { }

  private subjectAccessData = new Subject<JWTRes>();

  setAccessData(access: JWTRes) {
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

    this.tokenStorage.getRefreshToken().subscribe(refreshToken => {
      
      this.authService.refresh(refreshToken).subscribe(resp => {
        this.saveAccessData(resp)
      });
    });
    
    
    
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
    console.log("unauthorized detected " + (response.status === 401));
    return response.status === 401
  }

  /**
   * Verify that outgoing request is refresh-token,
   * so interceptor won't intercept this request
   * @param {string} url
   * @returns {boolean}
   */
  public verifyTokenRequest(url: string): boolean {
    return url.endsWith('/login');
  }


  /**
 * Add token to headers, dependent on server
 * set-up, by default adds a bearer token.
 * Called by interceptor.
 *
 * To change behavior, override this method.
 *
 * @public
 *
 * @param {string} token
 *
 * @returns {[name: string]: string | string[]}
 */
  /* nice to know, but currently unneccessary
    public getHeaders(token: string): { [name: string]: string | string[] } {
      return {
        'AuthToken': `Bearer ${token}`
      }
    };
  */

    private setPermissionsByRole(role: JWTRes.RoleEnum) {
      let permissions: string[] = [];
      permissions.push(role);            
      this.permissionsService.loadPermissions(permissions);  
    }


  /**
   * EXTRA AUTH METHODS
   */

  public login(login: AuthRequest): Observable<JWTRes> {

    this.authService.login(login).subscribe(resp => {       // todo sync objects and refresh and so on          
        this.setPermissionsByRole(resp.role);
        this.saveAccessData(resp);
      });
    return this.getAccessData();
  }

  /**
   * Logout
   */
  public logout(): void {
    this.tokenStorage.clear();
    this.permissionsService.flushPermissions();
    this.clearAccessData();
    this.router.navigateByUrl(HomeComponent.path);
  }

  public clear(): void {
    this.tokenStorage.clear();
  }


  /**
   * Save access data in the storage
   *
   * @private
   * @param {JWTRes} data
   */
  private saveAccessData(token: JWTRes) {
    this.tokenStorage
      .setAccessToken(token.accessToken)
      .setRefreshToken(token.refreshToken)
      .setLogin(token.username)
      .setRole(token.role)
      .setUserID(token.idUser);

    this.setAccessData(token);
  }
}
