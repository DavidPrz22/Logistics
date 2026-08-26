import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findOneByName(userName: string) {
    return this.prisma.usuario.findUnique({
      where: {
        nombreUsuario: userName,
      },
    });
  }

  async findOneByNameFiltered(userName: string) {
    return this.prisma.usuario.findUnique({
      where: {
        nombreUsuario: userName,
      },
      select: {
        id: true,
        nombreUsuario: true,
        correo: true,
        fechaCreacion: true,
        rol: true,
      },
    });
  }
  findOneById(id: number) {
    return this.prisma.usuario.findUnique({
      where: {
        id: id,
      },
    });
  }

  findOneByRefreshToken(refreshToken: string, id: number) {
    return this.prisma.usuario.findUnique({
      where: {
        refreshToken: refreshToken,
        id: id,
      },
    });
  }

  create(createUserDto: CreateUserDto) {
    return this.prisma.usuario.create({
      data: {
        nombreUsuario: createUserDto.nombreUsuario,
        correo: createUserDto.correo,
        hashPassword: createUserDto.hashPassword,
        rol: createUserDto.rol,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.usuario.update({
      data: {
        nombreUsuario: updateUserDto.nombreUsuario,
        correo: updateUserDto.correo,
        hashPassword: updateUserDto.hashPassword,
        rol: updateUserDto.rol,
      },
      where: {
        id: id,
      },
    });
  }

  updateRefreshToken(id: number, refreshToken: string | null) {
    return this.prisma.usuario.update({
      data: {
        refreshToken: refreshToken,
      },
      where: {
        id: id,
      },
    });
  }
  findAll() {
    return this.prisma.usuario.findMany();
  }

  remove(id: number) {
    return this.prisma.usuario.delete({
      where: {
        id: id,
      },
    });
  }
}
