import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: 'home', loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule) },
      { path: 'map', loadChildren: () => import('../pages/map/map.module').then(m => m.MapPageModule) },
      { path: 'profile', loadChildren: () => import('../pages/profile/profile.module').then(m => m.ProfilePageModule) },
      // {
      //   path: 'artist/:id',
      //   loadChildren: () => import('../pages/public-artist/public-artist.module').then(m => m.PublicArtistModule)
      // },
      // {
      //   path: 'establishment/:id',
      //   loadChildren: () => import('../pages/public-establishment/public-establishment.module').then(m => m.PublicEstablishmentModule)
      // },
      { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
