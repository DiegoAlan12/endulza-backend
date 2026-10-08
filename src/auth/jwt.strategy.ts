import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Le decimos que busque el token en el encabezado de "Autorización" (Bearer Token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Rechaza tokens caducados
      secretOrKey: 'ENDULZA_SECRETO_SUPER_SEGURO_2026', // ¡Debe ser el mismo secreto que usamos en auth.module!
    });
  }

  // Si el token es válido, NestJS ejecuta esta función automáticamente.
  // Lo que retornemos aquí se guardará en "req.user" para que sepamos quién hizo la petición.
  async validate(payload: any) {
    return { idUsuario: payload.idUsuario, tipoUsuario: payload.tipoUsuario };
  }
}