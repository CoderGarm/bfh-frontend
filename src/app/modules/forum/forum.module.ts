import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {ForumsListComponent} from './components/forums-list/forums-list.component';


@NgModule({
  declarations: [
    ForumsListComponent,
  ],
  imports: [
    SharedModuleModule,
  ]
})
export class ForumModule {
}
