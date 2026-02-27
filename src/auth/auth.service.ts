import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Manager, ManagerDocument } from './schemas/manager.schema';
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
    const user = await this.managerModel.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
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
    const managers = await this.managerModel.find().exec();
    return managers.map((m) => this.sanitizeManager(m));
  }

  async getManagerById(id: string) {
    const manager = await this.managerModel.findById(id).exec();
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

  private sanitizeManager(manager: ManagerDocument) {
    return {
      id: manager._id.toString(),
      username: manager.username,
      role: manager.role,
      createdAt: manager.createdAt,
      updatedAt: manager.updatedAt,
    };
  }
}
