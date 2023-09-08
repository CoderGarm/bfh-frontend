import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {Coords} from "../../modules/strategic-operations/payload/mission-administration/mission-administration.component";

export interface Junction {
    position: Coords;
    /**
     * All termini of the junction.
     */
    termini: Array<Coords>;
}

@Injectable()
export class AssetsService {

    constructor(private httpClient: HttpClient) {
    }

    public getAllWormholeJunctions(): Observable<Junction[]> {
        return this.httpClient.get<Junction[]>('assets/astrography/junctions.json');
    }
}
