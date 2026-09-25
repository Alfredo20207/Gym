import { Routes } from '@angular/router';
import { Inicio } from '../app/inicio/inicio';
import { Servicios } from '../app/servicios/servicios';
import { Planes } from '../app/planes/planes';
import { Horarios } from '../app/horarios/horarios';
import { Contacto } from '../app/contacto/contacto';
import { Registro } from '../app/registro/registro';
import { Login } from '../app/login/login';
import { MiPerfil } from '../app/mi-perfil/mi-perfil';
import { AdministracionUsuarios } from '../app/admin/administracion-usuarios/administracion-usuarios';
export const routes: Routes = [
    { path :'', component: Inicio},
    { path : 'servicios', component: Servicios},
    { path : 'planes', component: Planes},
    { path : 'horarios', component: Horarios},
    { path : 'contacto', component: Contacto},
    { path : 'registro', component: Registro},
    { path : 'login', component: Login},
    { path : 'mi-perfil', component: MiPerfil},
    { path : 'admin/usuarios', component: AdministracionUsuarios}
    
];
