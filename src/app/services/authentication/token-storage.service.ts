import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {JWT} from "../swagger";
import {environment} from "../../../environments/environment";
import GameUserRolesEnum = JWT.GameUserRolesEnum;

export interface JournalDashEntry {
    // more or less for multi-accounting
    idUser: number,
    tickNo: number,
    topics: string[]
}

@Injectable()
export class TokenStorage {

    private readonly accessToken = 'accessToken';
    private readonly role = 'role';
    private readonly gameRoles = 'game_role';
    private readonly login = 'login';
    private readonly userID = 'userID';
    private readonly profilePic = 'profilePic';
    private readonly allianceID = 'allianceID';
    private readonly refreshToken = 'refreshToken';
    private readonly interruptedURL = 'interruptedURL';

    // game logic stuff - stays in the cache
    private readonly journalDashEntries = 'journalDash';

    protected basePath = environment.backendServer;

    isLocalhost() {
        return this.basePath.includes("localhost");
    }

    isJournalTopicRead(tickNo: number, topic: string): boolean {
        const token: string = <string>localStorage.getItem(this.journalDashEntries);
        let entries: JournalDashEntry[] = <JournalDashEntry[]>JSON.parse(token);
        entries = !!entries ? entries : [];
        const userID = this.getUserID();
        const topics = entries.filter(e => e.tickNo === tickNo && e.idUser === userID).flatMap(e => e.topics);
        // remove old entries
        const toStore = entries.filter(e => e.tickNo === tickNo);
        this.setReadJournalTopics(toStore);
        // answer
        return topics.includes(topic);
    }

    private setReadJournalTopics(entries: JournalDashEntry[]): void {
        localStorage.setItem(this.journalDashEntries, JSON.stringify(entries));
    }

    addReadJournalTopics(tickNo: number, topic: string): void {
        const userID = this.getUserID();
        const token: string = <string>localStorage.getItem(this.journalDashEntries);
        const entries: JournalDashEntry[] = <JournalDashEntry[]>JSON.parse(token);
        const journalDashEntries = entries.filter(e => e.tickNo === tickNo && e.idUser === userID);
        if (journalDashEntries.length == 0) {
            entries.push({
                idUser: userID,
                tickNo: tickNo,
                topics: [topic]
            });
        } else {
            journalDashEntries[0].topics.push(topic);
        }
        this.setReadJournalTopics(entries);
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
        const item = <string>localStorage.getItem(this.gameRoles);
        if (!item || item.length == 0) {
            return [];
        }
        const roleStrings = item.split("|");
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
        roles.forEach(r => rolesString += r + "|");
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

    setProfilePic(profilePic: string): TokenStorage {
        localStorage.setItem(this.profilePic, profilePic);
        return this;
    }

    setAllianceID(idAlliance: number | undefined): TokenStorage {
        if (!!idAlliance) {
            localStorage.setItem(this.allianceID, String(idAlliance));
        } else {
            localStorage.removeItem(this.allianceID);
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
        localStorage.removeItem(this.profilePic);
        localStorage.removeItem(this.gameRoles);
        localStorage.removeItem(this.userID);
        localStorage.removeItem(this.allianceID);
        localStorage.removeItem(this.interruptedURL);
    }

    rememberScreenWarning(rememberScreenWarning: boolean) {
        localStorage.setItem('screenSizeWarning', JSON.stringify(rememberScreenWarning));
    }

    getRememberScreenWarning() {
        const stringValue = localStorage.getItem('screenSizeWarning');
        return (stringValue == "true");
    }

    getProfilePic() {
        return <string>localStorage.getItem(this.profilePic);
    }
}
