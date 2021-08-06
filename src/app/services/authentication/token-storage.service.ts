import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
  public getPassword(): Observable<string> {
    const token: string = <string>localStorage.getItem('password');
    return of(token);
  }

  public getName(): Observable<string> {
    const token: string = <string>localStorage.getItem('name');
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

  public getEmail(): Observable<string> {
    const token: string = <string>localStorage.getItem('email');
    return of(token);
  }

  public getUserID(): Observable<string> {
    const token: string = <string>localStorage.getItem('userID');
    return of(token);
  }

  /**
   * Set access token
   * @returns {TokenStorage}
   */
  public setAccessToken(token: string): TokenStorage {
    localStorage.setItem('accessToken', token);

    return this;
  }

  public setRole(role: number): TokenStorage {
    localStorage.setItem('role', ""+role);

    return this;
  }

  public setName(name: string): TokenStorage {
    localStorage.setItem('name', name);

    return this;
  }

  public setLogin(login: string): TokenStorage {
    localStorage.setItem('login', login);

    return this;
  }

  public setEmail(email: string): TokenStorage {
    localStorage.setItem('email', email);

    return this;
  }

  public setUserID(email: string): TokenStorage {
    localStorage.setItem('userID', email);

    return this;
  }

   /**
   * Set refresh token
   * @returns {TokenStorage}
   */
  public setPassword(token: string): TokenStorage {
    localStorage.setItem('password', token);

    return this;
  }

   /**
   * Remove tokens
   */
  public clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('password');
    localStorage.removeItem('name');
    localStorage.removeItem('login');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('userID');
  }
}
