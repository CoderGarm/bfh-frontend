import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';

export interface Coords {
    x: number;
    y: number;
    name: string;
}

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
