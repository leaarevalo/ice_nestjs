import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, Role } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signIn(document: string, password: string) {
    const user = await this.userModel
      .findOne({ document })
      .populate('assignedGroups', 'name description')
      .exec();

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const groupIds = (user.assignedGroups || []).map((g: any) =>
      g._id ? g._id.toString() : g.toString(),
    );

    const payload = {
      sub: user._id.toString(),
      document: user.document,
      role: user.role,
      assignedGroups: groupIds,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: this.sanitizeUser(user),
    };
  }

  async deactivateUserByDocument(document: string) {
    const user = await this.userModel
      .findOneAndUpdate({ document }, { isActive: false }, { new: true })
      .populate('assignedGroups', 'name description')
      .exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.sanitizeUser(user);
  }

  async activateUserByDocument(document: string) {
    const user = await this.userModel
      .findOneAndUpdate({ document }, { isActive: true }, { new: true })
      .populate('assignedGroups', 'name description')
      .exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.sanitizeUser(user);
  }

  async getLiderIdsByDocuments(documents: string[]): Promise<string[]> {
    if (!documents || documents.length === 0) return [];

    const users = await this.userModel
      .find({ document: { $in: documents } })
      .exec();

    if (users.length !== documents.length) {
      throw new ConflictException(
        'Uno o más documentos enviados no pertenecen a usuarios registrados',
      );
    }

    const validIds: string[] = [];
    for (const user of users) {
      if (!user.isActive || user.role !== Role.LIDER) {
        throw new ConflictException(
          `El usuario con documento ${user.document} no es un LIDER activo`,
        );
      }
      validIds.push(user._id.toString());
    }

    return validIds;
  }

  async validateLiders(ids: string[]) {
    if (!ids || ids.length === 0) return;

    const users = await this.userModel.find({ _id: { $in: ids } }).exec();

    if (users.length !== ids.length) {
      throw new ConflictException('Uno o más usuarios no existen');
    }

    for (const user of users) {
      if (!user.isActive || user.role !== Role.LIDER) {
        throw new ConflictException(
          `El usuario ${user.document} no es un LIDER activo`,
        );
      }
    }
  }

  async syncGroupUsers(groupId: string, newUserIds: string[]) {
    await this.userModel
      .updateMany(
        { assignedGroups: groupId },
        { $pull: { assignedGroups: groupId } },
      )
      .exec();

    if (newUserIds && newUserIds.length > 0) {
      await this.userModel
        .updateMany(
          { _id: { $in: newUserIds } },
          { $addToSet: { assignedGroups: groupId } },
        )
        .exec();
    }
  }

  private sanitizeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      document: user.document,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      assignedGroups: user.assignedGroups || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
