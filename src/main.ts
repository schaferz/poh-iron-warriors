import {ApplicationConfig} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import 'zone.js';
import {App} from "./component";
import {provideRouter} from '@angular/router';
import {routes} from './routes';
import {ConfirmationService, MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";

export const appConfig: ApplicationConfig = {
    providers: [
        MessageService,
        ConfirmationService,
        DialogService,
        provideAnimations(),
        provideRouter(routes)
    ],
};

bootstrapApplication(App, appConfig);
