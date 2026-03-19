import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Role } from '../users/schemas/user.schema';
import { UserService } from '../users/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SmallGroup, SmallGroupDocument } from './schemas/small-group.schema';
import { CreateSmallGroupDto } from './dto/create-small-group.dto';
import { UpdateSmallGroupDto } from './dto/update-small-group.dto';

@Injectable()
export class SmallGroupService {
  constructor(
    @InjectModel(SmallGroup.name)
    private smallGroupModel: Model<SmallGroupDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  private populateFields() {
    return [
      { path: 'group', select: 'name description' },
      { path: 'leaders', select: '-password' },
      { path: 'participants', select: '-password' },
    ];
  }

  async create(createSmallGroupDto: CreateSmallGroupDto, user: any) {
    if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      if (!assignedGroupIds.includes(createSmallGroupDto.group)) {
        throw new ForbiddenException(
          'No tenés permisos para crear grupos pequeños en este grupo',
        );
      }
    }

    const existing = await this.smallGroupModel.findOne({
      name: createSmallGroupDto.name,
      group: createSmallGroupDto.group,
    });
    if (existing) {
      throw new ConflictException(
        'Ya existe un grupo pequeño con ese nombre en este grupo',
      );
    }

    if (
      createSmallGroupDto.leaders &&
      createSmallGroupDto.leaders.length > 0
    ) {
      createSmallGroupDto.leaders =
        await this.userService.getUserIdsByDocuments(
          createSmallGroupDto.leaders,
        );
    }

    if (
      createSmallGroupDto.participants &&
      createSmallGroupDto.participants.length > 0
    ) {
      createSmallGroupDto.participants =
        await this.userService.getUserIdsByDocuments(
          createSmallGroupDto.participants,
        );
    }

    const smallGroup = new this.smallGroupModel(createSmallGroupDto);
    return (await smallGroup.save()).populate(this.populateFields());
  }

  async findAll(user: any) {
    if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      return this.smallGroupModel
        .find({ group: { $in: assignedGroupIds } })
        .populate(this.populateFields())
        .exec();
    }

    if (user.role === Role.USER) {
      return this.smallGroupModel
        .find({
          $or: [{ leaders: user.sub }, { participants: user.sub }],
        })
        .populate(this.populateFields())
        .exec();
    }

    return this.smallGroupModel
      .find()
      .populate(this.populateFields())
      .exec();
  }

  async findByGroup(groupId: string, user: any) {
    if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      if (!assignedGroupIds.includes(groupId)) {
        return [];
      }
    }

    if (user.role === Role.USER) {
      return this.smallGroupModel
        .find({
          group: groupId,
          $or: [{ leaders: user.sub }, { participants: user.sub }],
        })
        .populate(this.populateFields())
        .exec();
    }

    return this.smallGroupModel
      .find({ group: groupId })
      .populate(this.populateFields())
      .exec();
  }

  async findById(id: string, user: any) {
    const smallGroup = await this.smallGroupModel
      .findById(id)
      .populate(this.populateFields())
      .exec();

    if (!smallGroup) {
      throw new NotFoundException('Grupo pequeño no encontrado');
    }

    const groupId =
      (smallGroup.group as any)?._id?.toString() ||
      smallGroup.group?.toString();

    if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      if (!assignedGroupIds.includes(groupId)) {
        throw new ForbiddenException(
          'No tenés permisos para ver este grupo pequeño',
        );
      }
    } else if (user.role === Role.USER) {
      const isMember =
        smallGroup.leaders.some(
          (l: any) =>
            l._id?.toString() === user.sub || l.toString() === user.sub,
        ) ||
        smallGroup.participants.some(
          (p: any) =>
            p._id?.toString() === user.sub || p.toString() === user.sub,
        );
      if (!isMember) {
        throw new ForbiddenException(
          'No tenés permisos para ver este grupo pequeño',
        );
      }
    }

    return smallGroup;
  }

  async update(
    id: string,
    updateSmallGroupDto: UpdateSmallGroupDto,
    user: any,
  ) {
    const smallGroupToUpdate =
      await this.smallGroupModel.findById(id).exec();
    if (!smallGroupToUpdate) {
      throw new NotFoundException('Grupo pequeño no encontrado');
    }

    if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      if (
        !assignedGroupIds.includes(smallGroupToUpdate.group.toString())
      ) {
        throw new ForbiddenException(
          'No tenés permisos para actualizar este grupo pequeño',
        );
      }
    }

    if (updateSmallGroupDto.leaders) {
      updateSmallGroupDto.leaders =
        await this.userService.getUserIdsByDocuments(
          updateSmallGroupDto.leaders,
        );
    }

    if (updateSmallGroupDto.participants) {
      updateSmallGroupDto.participants =
        await this.userService.getUserIdsByDocuments(
          updateSmallGroupDto.participants,
        );
    }

    const smallGroup = await this.smallGroupModel
      .findByIdAndUpdate(id, updateSmallGroupDto, { new: true })
      .populate(this.populateFields())
      .exec();

    return smallGroup;
  }

  async delete(id: string, user: any) {
    const smallGroupToDelete =
      await this.smallGroupModel.findById(id).exec();
    if (!smallGroupToDelete) {
      throw new NotFoundException('Grupo pequeño no encontrado');
    }

    if (user.role === Role.LIDER) {
      const assignedGroupIds = (user.assignedGroups || []).map((g: any) =>
        g._id ? g._id.toString() : g.toString(),
      );
      if (
        !assignedGroupIds.includes(smallGroupToDelete.group.toString())
      ) {
        throw new ForbiddenException(
          'No tenés permisos para eliminar este grupo pequeño',
        );
      }
    }

    await this.smallGroupModel.findByIdAndDelete(id).exec();
    return { message: 'Grupo pequeño eliminado correctamente' };
  }
}
