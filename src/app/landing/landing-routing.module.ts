import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component Pages
import { IndexComponent } from "./index/index.component";
import { NftComponent } from "./nft/nft.component";
import { JobComponent } from './job/job.component';
import { KevinHomeComponent } from './kevin_home/kevin_home.component';

const routes: Routes = [
  {
    path: "",
    component: IndexComponent
  },
  {
    path: "nft",
    component: NftComponent
  },
  {
    path: "job",
    component: JobComponent
  },
  {
    path: "kevin-home",
    component: KevinHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LandingRoutingModule { }
