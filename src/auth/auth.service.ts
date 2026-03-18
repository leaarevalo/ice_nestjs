import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Manager, ManagerDocument, Role } from './schemas/manager.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Manager.name) private managerModel: Model<ManagerDocument>,
    private jwtService: JwtService,
  ) { }

  async signIn(username: string, password: string) {
    const user = await this.managerModel
      .findOne({ username })
      .populate('assignedGroups', 'name description')
      .exec();

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
      assignedGroups: user.assignedGroups || [],
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: this.sanitizeManager(user),
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.managerModel.findOne({
      username: registerDto.username,
    });

    if (existing) {
      throw new ConflictException('El username ya está registrado');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(registerDto.password, salt);

    const newManager = new this.managerModel({
      username: registerDto.username,
      password: hashedPassword,
      role: registerDto.role || 'user',
    });

    const saved = await newManager.save();
    return this.sanitizeManager(saved);
  }

  async getManagers() {
    const managers = await this.managerModel
      .find({ isActive: true })
      .populate('assignedGroups', 'name description')
      .exec();
    return managers.map((m) => this.sanitizeManager(m));
  }

  async getManagerById(id: string) {
    const manager = await this.managerModel
      .findById(id)
      .populate('assignedGroups', 'name description')
      .exec();
    if (!manager) {
      throw new NotFoundException('Manager no encontrado');
    }
    return this.sanitizeManager(manager);
  }

  async updateManager(id: string, updateDto: UpdateManagerDto) {
    if (updateDto.password) {
      const salt = bcrypt.genSaltSync(10);
      updateDto.password = bcrypt.hashSync(updateDto.password, salt);
    }

    const manager = await this.managerModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('assignedGroups', 'name description')
      .exec();

    if (!manager) {
      throw new NotFoundException('Manager no encontrado');
    }
    return this.sanitizeManager(manager);
  }

  async deleteManager(id: string) {
    const manager = await this.managerModel.findByIdAndDelete(id).exec();
    if (!manager) {
      throw new NotFoundException('Manager no encontrado');
    }
    return { message: 'Manager eliminado correctamente' };
  }

  async deactivateManagerByUsername(username: string) {
    const manager = await this.managerModel
      .findOneAndUpdate({ username }, { isActive: false }, { new: true })
      .populate('assignedGroups', 'name description')
      .exec();
    if (!manager) {
      throw new NotFoundException('Manager no encontrado');
    }
    return this.sanitizeManager(manager);
  }

  async activateManagerByUsername(username: string) {
    const manager = await this.managerModel
      .findOneAndUpdate({ username }, { isActive: true }, { new: true })
      .populate('assignedGroups', 'name description')
      .exec();
    if (!manager) {
      throw new NotFoundException('Manager no encontrado');
    }
    return this.sanitizeManager(manager);
  }

  async getLiderIdsByUsernames(usernames: string[]): Promise<string[]> {
    if (!usernames || usernames.length === 0) return [];

    const managers = await this.managerModel.find({ username: { $in: usernames } }).exec();

    if (managers.length !== usernames.length) {
      throw new ConflictException('Uno o más DNIs enviados no pertenecen a cuentas registradas');
    }

    const validIds = [];
    for (const manager of managers) {
      if (!manager.isActive || manager.role !== Role.LIDER) {
        throw new ConflictException(
          `La cuenta con DNI ${manager.username} no es un LIDER activo`,
        );
      }
      validIds.push(manager._id.toString());
    }

    return validIds;
  }

  async validateLiders(ids: string[]) {
    if (!ids || ids.length === 0) return;

    const managers = await this.managerModel.find({ _id: { $in: ids } }).exec();

    if (managers.length !== ids.length) {
      throw new ConflictException('Uno o más managers no existen');
    }

    for (const manager of managers) {
      if (!manager.isActive || manager.role !== Role.LIDER) {
        throw new ConflictException(
          `La cuenta ${manager.username} no es un LIDER activo`,
        );
      }
    }
  }

  async syncGroupManagers(groupId: string, newManagerIds: string[]) {
    // 1. Quitar este groupId de todos los managers que lo tengan
    await this.managerModel.updateMany(
      { assignedGroups: groupId },
      { $pull: { assignedGroups: groupId } }
    ).exec();

    // 2. Agregar este groupId a los nuevos managers
    if (newManagerIds && newManagerIds.length > 0) {
      await this.managerModel.updateMany(
        { _id: { $in: newManagerIds } },
        { $addToSet: { assignedGroups: groupId } }
      ).exec();
    }
  }

  private sanitizeManager(manager: ManagerDocument) {
    return {
      id: manager._id.toString(),
      username: manager.username,
      role: manager.role,
      isActive: manager.isActive,
      assignedGroups: manager.assignedGroups || [],
      createdAt: manager.createdAt,
      updatedAt: manager.updatedAt,
    };
  }
}
