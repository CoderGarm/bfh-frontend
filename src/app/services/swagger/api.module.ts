import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { AdminApiService } from './api/adminApi.service';
import { AdvisoryApiService } from './api/advisoryApi.service';
import { AllianceApiService } from './api/allianceApi.service';
import { AuthApiService } from './api/authApi.service';
import { BattleReportApiService } from './api/battleReportApi.service';
import { ChatApiService } from './api/chatApi.service';
import { ColonizationApiService } from './api/colonizationApi.service';
import { ConstructionApiService } from './api/constructionApi.service';
import { FakeApiService } from './api/fakeApi.service';
import { FleetApiService } from './api/fleetApi.service';
import { ForumApiService } from './api/forumApi.service';
import { JobApiService } from './api/jobApi.service';
import { JournalApiService } from './api/journalApi.service';
import { MarketplaceApiService } from './api/marketplaceApi.service';
import { MissionApiService } from './api/missionApi.service';
import { ModuleApiService } from './api/moduleApi.service';
import { PlanetApiService } from './api/planetApi.service';
import { PublicResourcesApiService } from './api/publicResourcesApi.service';
import { ResearchApiService } from './api/researchApi.service';
import { ResourcesApiService } from './api/resourcesApi.service';
import { RolePlayApiService } from './api/rolePlayApi.service';
import { ShipyardApiService } from './api/shipyardApi.service';
import { StarMapApiService } from './api/starMapApi.service';
import { TickApiService } from './api/tickApi.service';
import { UserApiService } from './api/userApi.service';
import { WikiApiService } from './api/wikiApi.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    AdminApiService,
    AdvisoryApiService,
    AllianceApiService,
    AuthApiService,
    BattleReportApiService,
    ChatApiService,
    ColonizationApiService,
    ConstructionApiService,
    FakeApiService,
    FleetApiService,
    ForumApiService,
    JobApiService,
    JournalApiService,
    MarketplaceApiService,
    MissionApiService,
    ModuleApiService,
    PlanetApiService,
    PublicResourcesApiService,
    ResearchApiService,
    ResourcesApiService,
    RolePlayApiService,
    ShipyardApiService,
    StarMapApiService,
    TickApiService,
    UserApiService,
    WikiApiService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
