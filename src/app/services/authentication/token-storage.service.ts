import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { JWTRes } from '../swagger/model/models';

@Injectable()
export class TokenStorage {

  /**
   * Get access token
   * @returns {Observable<string>}
   */
  public getAccessToken(): Observable<string> {
    const token: string = <string>localStorage.getItem('accessToken');
    return of(token);
  }

  /**
   * Get refresh token
   * @returns {Observable<string>}
   */
  public getRefreshToken(): Observable<string> {
    const token: string = <string>localStorage.getItem('refreshToken');
    return of(token);
  }

  public getLogin(): Observable<string> {
    const token: string = <string>localStorage.getItem('login');
    return of(token);
  }

  public getRole(): Observable<string> {
    const token: string = <string>localStorage.getItem('role');
    return of(token);
  }

  public getUserID(): Observable<number> {
    const token: string = <string>localStorage.getItem('userID');
    const userID: number = Number(token);
    return of(userID);
  }

  /**
   * Set access token
   * @returns {TokenStorage}
   */
  public setAccessToken(token: string): TokenStorage {
    localStorage.setItem('accessToken', token);

    return this;
  }

  public setRole(role: JWTRes.RoleEnum): TokenStorage {
    localStorage.setItem('role', role);

    return this;
  }

  public setLogin(login: string): TokenStorage {
    localStorage.setItem('login', login);

    return this;
  }

  public setUserID(idUser: number): TokenStorage {
    localStorage.setItem('userID', String(idUser));

    return this;
  }

  /**
   * Set refresh token
   * @returns {TokenStorage}
   */
  public setRefreshToken(token: string): TokenStorage {
    localStorage.setItem('refreshToken', token);

    return this;
  }

   /**
   * Remove tokens
   */
  public clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('login');
    localStorage.removeItem('role');
    localStorage.removeItem('userID');
  }
}
