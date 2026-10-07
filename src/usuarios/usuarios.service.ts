import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario } from '@prisma/client';
// Importamos bcrypt
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // 1. Extraemos la contraseña del DTO
    const { password, ...restoDeDatos } = createUsuarioDto;

    // 2. Definimos el "salt" (el nivel de complejidad del hash, 10 es el estándar)
    const saltRounds = 10;

    // 3. Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Guardamos en la base de datos usando la contraseña hasheada
    return await this.prisma.usuario.create({
      data: {
        nombres: createUsuarioDto.nombres,
        apellidos: createUsuarioDto.apellidos,
        tipoUsuario: createUsuarioDto.tipoUsuario as RolUsuario,
        correo: createUsuarioDto.correo,
        password: hashedPassword, // ¡Aquí va la contraseña segura!
        telefono: createUsuarioDto.telefono,
        localidad: createUsuarioDto.localidad,
        municipio: createUsuarioDto.municipio
      },
        // No enviamos idRuta porque al registrarse, el usuario aún no tiene ruta asignada},
    });
  }

  findAll() {
    return `This action returns all usuarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
