import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component Pages
import { IndexComponent } from "./index/index.component";
import { NftComponent } from "./nft/nft.component";
import { JobComponent } from './job/job.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: "",
    component: HomeComponent
  },
  // {
  //   path: "theme",
  //   component: IndexComponent
  // },
  // {
  //   path: "nft",
  //   component: NftComponent
  // },
  // {
  //   path: "job",
  //   component: JobComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LandingRoutingModule { }
