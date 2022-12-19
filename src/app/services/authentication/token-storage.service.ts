import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {JWT, StarSystem} from "../swagger";
import {environment} from "../../../environments/environment";
import GameUserRolesEnum = JWT.GameUserRolesEnum;

@Injectable()
export class TokenStorage {

    private readonly accessToken = 'accessToken';
    private readonly role = 'role';
    private readonly gameRoles = 'game_role';
    private readonly login = 'login';
    private readonly userID = 'userID';
    private readonly allianceID = 'allianceID';
    private readonly refreshToken = 'refreshToken';
    private readonly interruptedURL = 'interruptedURL';

    protected basePath = environment.backendServer;

    isLocalhost() {
        return this.basePath.includes("localhost");
    }

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

    getRole(): string {
        return <string>localStorage.getItem(this.role);
    }

    getGameRoles(): GameUserRolesEnum[] {
        const roleStrings = (<string>localStorage.getItem(this.gameRoles)).split("|");
        const roles: GameUserRolesEnum[] = [];
        roleStrings.forEach(s => {
            let role: GameUserRolesEnum = s as keyof typeof GameUserRolesEnum
            roles.push(role);
        })
        return roles;
    }

    getUserID(): number {
        const token: string = <string>localStorage.getItem(this.userID);
        return Number(token);
    }

    getAllianceID(): number {
        const token: string = <string>localStorage.getItem(this.allianceID);
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

    setGameRoles(roles: GameUserRolesEnum[]): TokenStorage {
        let rolesString: string = "";
        roles.forEach(r => rolesString += r);
        localStorage.setItem(this.gameRoles, rolesString);
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

    setAllianceID(idAlliance: number | undefined): TokenStorage {
        if (!!idAlliance) {
            localStorage.setItem(this.allianceID, String(idAlliance));
        }
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
        localStorage.removeItem(this.gameRoles);
        localStorage.removeItem(this.userID);
        localStorage.removeItem(this.allianceID);
        localStorage.removeItem(this.interruptedURL);
    }

    getSystems(): StarSystem[] | undefined {
        const json = localStorage.getItem('systems');
        if (!!json) {
            return JSON.parse(json);
        }
        return undefined;
    }

    /**
     * Just an idea to store the star map locally in a browsers tab storage
     */
    rememberSystems(systems: StarSystem[]) {
        localStorage.setItem('systems', JSON.stringify(systems));
    }
}
