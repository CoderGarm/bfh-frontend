import { HomeComponent } from './../../components/home/home.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'ngx-auth';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccessData } from './accessData.model';
import { TokenStorage } from './token-storage.service';
import { Router } from '@angular/router';

export interface LoginRequest {
  login?: string;
  password?: string;
}

@Injectable()
export class AuthenticationService implements AuthService {

  constructor(private router: Router, private tokenStorage: TokenStorage) { }

  private subjectAccessData = new Subject<AccessData>();

  setAccessData(access: AccessData) {
    this.subjectAccessData.next(access);
  }

  clearAccessData() {
    this.subjectAccessData.next();
  }

  getAccessData(): Observable<AccessData> {
    return this.subjectAccessData.asObservable();
  }

  /**
   * Check, if user already authorized.
   * @description Should return Observable with true or false values
   * @returns {Observable<boolean>}
   * @memberOf AuthService
   */
  public isAuthorized(): Observable<boolean> {


    return this.tokenStorage
      .getAccessToken().pipe(map(token => !!token));
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
  public refreshToken(): Observable<AccessData> {

    let login: LoginRequest = {};
    this.tokenStorage.getPassword().subscribe(pass => login.password = pass);
    this.tokenStorage.getLogin().subscribe(lo => login.login = lo);

    let tokens: AccessData = {
      accessToken: 'resp.token',
      password: 'login.password',
      role: 1,
      name: 'resp.user.name',
      login: 'resp.user.login',
      email: 'resp.user.email',
      userID: 1
    }
    this.saveAccessData(tokens)


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
    //console.log("unauthorized detected " + (response.status === 401));
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


  /**
   * EXTRA AUTH METHODS
   */

  public login(login: LoginRequest): Observable<AccessData> {
    let tokens: AccessData = {
      accessToken: 'resp.token',
      password: 'login.password',
      role: 1,
      name: 'resp.user.name',
      login: 'resp.user.login',
      email: 'resp.user.email',
      userID: 1
    }
    this.saveAccessData(tokens);
    this.setAccessData(tokens);
    return this.getAccessData();
  }

  /**
   * Logout
   */
  public logout(): void {
    this.tokenStorage.clear();
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
   * @param {AccessData} data
   */
  private saveAccessData(token: AccessData) {
    this.tokenStorage
      .setAccessToken(token.accessToken)
      .setPassword(token.password)
      .setName(token.name)
      .setLogin(token.login)
      .setRole(token.role)
      .setEmail(token.email)
      .setUserID("" + token.userID);

    this.setAccessData(token);
  }




}
