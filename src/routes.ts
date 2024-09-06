import {
    BossComponent,
    DashboardComponent,
    GuildComponent,
    LoginComponent,
    RaidQueryComponent,
    SeasonComponent
} from "./component";
import {Route} from "@angular/router";

export const routes: Route[] = [
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: 'dashboard', component: DashboardComponent, data: {title: 'Common / Dashboard'}},
    {path: 'guild', component: GuildComponent, data: {title: 'Common / Guild'}},
    {path: 'boss', component: BossComponent, data: {title: 'Raid / Boss'}},
    {path: 'season', component: SeasonComponent, data: {title: 'Raid / Season'}},
    {path: 'query', component: RaidQueryComponent, data: {title: 'Raid / Query'}},
    {path: 'login', component: LoginComponent, data: {title: 'Login'}},
];
