import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum RolUsuario {
    ADMINISTRADOR = 'ADMIN',
    CAJERO = 'CAJERO',
    CLIENTE = 'CLIENTE',
}

export class CreateUsuarioDto {

    @IsString()
    @IsNotEmpty()
    nombres: string;

    @IsString()
    @IsNotEmpty()
    apellidos: string;

// Validación estricta usando el Enum de Prisma
    @IsEnum(RolUsuario, { message: 'El tipo de usuario debe ser ADMIN, CAJERO o CLIENTE' })
    tipoUsuario: RolUsuario;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    correo: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsString()
    @IsOptional()
    localidad?: string;

    @IsString()
    @IsOptional()
    municipio?: string;

}


