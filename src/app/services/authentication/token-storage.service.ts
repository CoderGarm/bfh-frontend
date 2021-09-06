import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {JWTRes} from '../swagger';

@Injectable()
export class TokenStorage {

  private readonly accessToken = 'accessToken';
  private readonly role = 'role';
  private readonly login = 'login';
  private readonly userID = 'userID';
  private readonly refreshToken = 'refreshToken';
  private readonly interruptedURL = 'interruptedURL';

  /**
   * Get access token
   * @returns {Observable<string>}
   */
  public getAccessToken(): Observable<string> {
    const token: string = <string>localStorage.getItem(this.accessToken);
    return of(token);
  }

  /**
   * Get refresh token
   * @returns {Observable<string>}
   */
  public getRefreshToken(): Observable<string> {
    const token: string = <string>localStorage.getItem(this.refreshToken);
    return of(token);
  }

  public getLogin(): Observable<string> {
    const token: string = <string>localStorage.getItem(this.login);
    return of(token);
  }

  public getRole(): Observable<string> {
    const token: string = <string>localStorage.getItem(this.role);
    return of(token);
  }

  public getUserID(): number {
    const token: string = <string>localStorage.getItem(this.userID);
    return Number(token);
  }

  public getInterruptedURL(): string {
    return <string>localStorage.getItem(this.interruptedURL);
  }


  /**
   * Set access token
   * @returns {TokenStorage}
   */
  public setAccessToken(token: string): TokenStorage {
    localStorage.setItem(this.accessToken, token);
    return this;
  }


  public setRole(role: JWTRes.RoleEnum): TokenStorage {
    localStorage.setItem(this.role, role);
    return this;
  }


  public setLogin(login: string): TokenStorage {
    localStorage.setItem(this.login, login);
    return this;
  }


  public setUserID(idUser: number): TokenStorage {
    localStorage.setItem(this.userID, String(idUser));
    return this;
  }


  /**
   * Set refresh token
   * @returns {TokenStorage}
   */
  public setRefreshToken(token: string): TokenStorage {
    localStorage.setItem(this.refreshToken, token);
    return this;
  }


  public setInterruptedURL(url: string): TokenStorage {
    localStorage.setItem(this.interruptedURL, url);
    return this;
  }

  /**
   * Remove tokens
   */
  public clear() {
    localStorage.removeItem(this.accessToken);
    localStorage.removeItem(this.refreshToken);
    localStorage.removeItem(this.login);
    localStorage.removeItem(this.role);
    localStorage.removeItem(this.userID);
    localStorage.removeItem(this.interruptedURL);
  }

}
