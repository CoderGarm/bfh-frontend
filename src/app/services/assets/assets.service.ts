import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';


export interface NamedThing {
    name: string;
}

export interface Junction {
    nexus: NamedThing;
    /**
     * All termini of the junction.
     */
    termini: Array<NamedThing>;
}

export interface SimpleCoord {
    x: number;
    y: number;
}

@Injectable()
export class AssetsService {

    constructor(private httpClient: HttpClient) {
    }

    public getAllWormholeJunctions(): Observable<Junction[]> {
        return this.httpClient.get<Junction[]>('assets/astrography/junctions.json');
    }
}
