import { Routes } from '@angular/router';
import { Inicio } from '../app/inicio/inicio';
import { Servicios } from '../app/servicios/servicios';
import { Planes } from '../app/planes/planes';
export const routes: Routes = [
    { path :'', component: Inicio},
    { path : 'servicios', component: Servicios},
    { path : 'planes', component: Planes}
];
