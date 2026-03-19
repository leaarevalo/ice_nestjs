import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthService } from '../auth/auth.service';
import { Role } from '../users/schemas/user.schema';
import { UserService } from '../users/user.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const existing = await this.groupModel.findOne({
      name: createGroupDto.name,
    });
    if (existing) {
      throw new ConflictException('Ya existe un grupo con ese nombre');
    }

    if (createGroupDto.managers && createGroupDto.managers.length > 0) {
      createGroupDto.managers =
        await this.authService.getLiderIdsByDocuments(
          createGroupDto.managers,
        );
    }

    if (
      createGroupDto.collaborators &&
      createGroupDto.collaborators.length > 0
    ) {
      createGroupDto.collaborators =
        await this.userService.getUserIdsByDocuments(
          createGroupDto.collaborators,
        );
    }

    const group = new this.groupModel(createGroupDto);
    const savedGroup = await group.save();

    if (createGroupDto.managers && createGroupDto.managers.length > 0) {
      await this.authService.syncGroupUsers(
        savedGroup._id.toString(),
        createGroupDto.managers,
      );
    }

    return savedGroup.populate([
      { path: 'managers', select: '-password' },
      { path: 'collaborators', select: '-password' },
    ]);
  }

  async findAll(user: any) {
    const populateOptions = [
      { path: 'managers', select: '-password' },
      { path: 'collaborators', select: '-password' },
    ];

    if (user.role === Role.MANAGER) {
      return this.groupModel.find().populate(populateOptions).exec();
    } else if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      return this.groupModel
        .find({ _id: { $in: assignedGroupIds } })
        .populate(populateOptions)
        .exec();
    } else if (user.role === Role.USER) {
      return this.groupModel
        .find({ collaborators: user.sub })
        .populate(populateOptions)
        .exec();
    }
    return [];
  }

  async findById(id: string, user: any) {
    const populateOptions = [
      { path: 'managers', select: '-password' },
      { path: 'collaborators', select: '-password' },
    ];

    const group = await this.groupModel
      .findById(id)
      .populate(populateOptions)
      .exec();

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      if (!assignedGroupIds.includes(group._id.toString())) {
        throw new ForbiddenException('No tenés permisos para ver este grupo');
      }
    } else if (user.role === Role.USER) {
      const isCollaborator = group.collaborators.some(
        (c: any) => c._id?.toString() === user.sub || c.toString() === user.sub,
      );
      if (!isCollaborator) {
        throw new ForbiddenException('No tenés permisos para ver este grupo');
      }
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto, user: any) {
    const existingGroup = await this.groupModel.findById(id).exec();
    if (!existingGroup) {
      throw new NotFoundException('Grupo no encontrado');
    }

    if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      if (!assignedGroupIds.includes(existingGroup._id.toString())) {
        throw new ForbiddenException(
          'No tenés permisos para actualizar este grupo',
        );
      }
    }

    if (updateGroupDto.managers) {
      updateGroupDto.managers =
        await this.authService.getLiderIdsByDocuments(
          updateGroupDto.managers,
        );
    }

    if (updateGroupDto.collaborators) {
      updateGroupDto.collaborators =
        await this.userService.getUserIdsByDocuments(
          updateGroupDto.collaborators,
        );
    }

    const populateOptions = [
      { path: 'managers', select: '-password' },
      { path: 'collaborators', select: '-password' },
    ];

    const group = await this.groupModel
      .findByIdAndUpdate(id, updateGroupDto, { new: true })
      .populate(populateOptions)
      .exec();

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    if (updateGroupDto.managers) {
      await this.authService.syncGroupUsers(
        group._id.toString(),
        updateGroupDto.managers,
      );
    }

    return group;
  }

  async delete(id: string) {
    const group = await this.groupModel.findByIdAndDelete(id).exec();
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    await this.authService.syncGroupUsers(group._id.toString(), []);

    return { message: 'Grupo eliminado correctamente' };
  }
}
