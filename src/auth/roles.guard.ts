import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Buscamos qué roles exige esta ruta específica
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si la ruta no tiene el decorador @Roles, dejamos pasar a cualquiera que esté logueado
    if (!rolesRequeridos) {
      return true;
    }
    
    // 2. Extraemos al usuario de la petición (gracias a que el JwtStrategy ya lo validó previamente)
    const { user } = context.switchToHttp().getRequest();
    
    // 3. Verificamos si su tipoUsuario coincide con alguno de los requeridos
    const tieneRol = rolesRequeridos.includes(user.tipoUsuario);
    
    if (!tieneRol) {
      // Si es un empleado intentando hacer cosas de dueño, lanzamos un error 403
      throw new ForbiddenException('Acceso denegado: Se requieren permisos de Administrador.');
    }
    
    return true;
  }
}