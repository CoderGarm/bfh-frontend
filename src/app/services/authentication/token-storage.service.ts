import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

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
  getAccessToken(): Observable<string> {
    const token: string = <string>localStorage.getItem(this.accessToken);
    return of(token);
  }

  /**
   * Get refresh token
   * @returns {Observable<string>}
   */
  getRefreshToken(): Observable<string> {
    const token: string = <string>localStorage.getItem(this.refreshToken);
    return of(token);
  }

  getLogin(): string {
    return <string>localStorage.getItem(this.login);
  }

  getRole(): Observable<string> {
    const token: string = <string>localStorage.getItem(this.role);
    return of(token);
  }

  getUserID(): number {
    const token: string = <string>localStorage.getItem(this.userID);
    return Number(token);
  }

  /**
   * Returns, if a refresh call happened and interrupted the ordinary web-call.
   *
   * @return true if a refresh call happened in this browser session
   */
  getInterruptedURL(): boolean {
    let item = <string>localStorage.getItem(this.interruptedURL);
    return !!item;

  }


  /**
   * Set access token
   * @returns {TokenStorage}
   */
  setAccessToken(token: string): TokenStorage {
    localStorage.setItem(this.accessToken, token);
    return this;
  }


  setRole(role: string): TokenStorage {
    localStorage.setItem(this.role, role);
    return this;
  }


  setLogin(login: string): TokenStorage {
    localStorage.setItem(this.login, login);
    return this;
  }


  setUserID(idUser: number): TokenStorage {
    localStorage.setItem(this.userID, String(idUser));
    return this;
  }


  /**
   * Set refresh token
   * @returns {TokenStorage}
   */
  setRefreshToken(token: string): TokenStorage {
    localStorage.setItem(this.refreshToken, token);
    return this;
  }

  setInterruptedURL(url: string): TokenStorage {
    localStorage.setItem(this.interruptedURL, url);
    return this;
  }

  /**
   * Remove tokens
   */
  clear() {
    localStorage.removeItem(this.accessToken);
    localStorage.removeItem(this.refreshToken);
    localStorage.removeItem(this.login);
    localStorage.removeItem(this.role);
    localStorage.removeItem(this.userID);
    localStorage.removeItem(this.interruptedURL);
  }

}
