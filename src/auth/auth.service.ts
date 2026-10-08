import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. REGISTRO DE PERSONAL
  async registrar(datos: any) {
    const existeUsuario = await this.prisma.usuario.findUnique({
      where: { correo: datos.correo },
    });

    if (existeUsuario) {
      throw new BadRequestException(
        'El correo ya está registrado en el sistema',
      );
    }

    // Encriptamos la contraseña con 10 "saltos" de complejidad
    const saltos = 10;
    const passwordEncriptada = await bcrypt.hash(datos.password, saltos);

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombres: datos.nombres,
        apellidos: datos.apellidos ?? '',
        correo: datos.correo,
        password: passwordEncriptada,
        tipoUsuario: datos.tipoUsuario, // 'ADMIN' o 'CAJERO'
      },
    });

    // Retornamos los datos del usuario, pero EXCLUIMOS el hash de la contraseña por seguridad
    const { password, ...usuarioSeguro } = nuevoUsuario;
    return usuarioSeguro;
  }

  // 2. INICIO DE SESIÓN
  async login(datos: any) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: datos.correo },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Comparamos la contraseña en texto plano con el hash de la base de datos
    const passwordValida = await bcrypt.compare(
      datos.password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Generamos el JWT (El Gafete Digital)
    const payload = {
      idUsuario: usuario.idUsuario,
      tipoUsuario: usuario.tipoUsuario,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: {
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        tipoUsuario: usuario.tipoUsuario,
      },
    };
  }
}
