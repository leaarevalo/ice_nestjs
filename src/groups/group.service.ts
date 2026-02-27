import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
    constructor(
        @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    ) { }

    async create(createGroupDto: CreateGroupDto) {
        const existing = await this.groupModel.findOne({
            name: createGroupDto.name,
        });
        if (existing) {
            throw new ConflictException('Ya existe un grupo con ese nombre');
        }

        const group = new this.groupModel(createGroupDto);
        return (await group.save()).populate('managers', '-password');
    }

    async findAll() {
        return this.groupModel.find().populate('managers', '-password').exec();
    }

    async findById(id: string) {
        const group = await this.groupModel
            .findById(id)
            .populate('managers', '-password')
            .exec();
        if (!group) {
            throw new NotFoundException('Grupo no encontrado');
        }
        return group;
    }

    async update(id: string, updateGroupDto: UpdateGroupDto) {
        const group = await this.groupModel
            .findByIdAndUpdate(id, updateGroupDto, { new: true })
            .populate('managers', '-password')
            .exec();
        if (!group) {
            throw new NotFoundException('Grupo no encontrado');
        }
        return group;
    }

    async delete(id: string) {
        const group = await this.groupModel.findByIdAndDelete(id).exec();
        if (!group) {
            throw new NotFoundException('Grupo no encontrado');
        }
        return { message: 'Grupo eliminado correctamente' };
    }
}
