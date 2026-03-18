import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/user.controller.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/schemas/manager.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly authService: AuthService,
  ) { }

  async getUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.userModel
      .findOne({ document: dto.document })
      .exec();

    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese documento');
    }

    const newUser = new this.userModel(dto);
    const savedUser = await newUser.save();

    if (dto.isLider) {
      await this.createOrReactivateLiderAccount(dto.document);
    }

    return savedUser;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const currentUser = await this.userModel.findById(id).exec();
    if (!currentUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const wasLider = currentUser.isLider;
    const willBeLider = dto.isLider;

    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    // isLider changed: false → true → create/reactivate auth account
    if (willBeLider === true && !wasLider) {
      await this.createOrReactivateLiderAccount(user.document);
    }

    // isLider changed: true → false → deactivate auth account
    if (willBeLider === false && wasLider) {
      try {
        await this.authService.deactivateManagerByUsername(user.document);
      } catch (e) {
        // Ignore if manager not found
      }
    }

    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft-delete auth account if user was a lider
    if (user.isLider) {
      try {
        await this.authService.deactivateManagerByUsername(user.document);
      } catch (e) {
        // Ignore if manager not found
      }
    }

    await this.userModel.findByIdAndDelete(id).exec();
    return { message: 'Usuario eliminado correctamente' };
  }

  private async createOrReactivateLiderAccount(document: string) {
    try {
      // Try to reactivate existing account first
      await this.authService.activateManagerByUsername(document);
    } catch (e) {
      // Account doesn't exist, create a new one
      await this.authService.register({
        username: document,
        password: document,
        role: Role.LIDER,
      });
    }
  }
  async getUserIdsByDocuments(documents: string[]): Promise<string[]> {
    if (!documents || documents.length === 0) return [];

    const users = await this.userModel.find({ document: { $in: documents } }).exec();

    if (users.length !== documents.length) {
      throw new ConflictException('Uno o más documentos enviados no pertenecen a usuarios registrados');
    }

    return users.map((user) => user._id.toString());
  }
}
