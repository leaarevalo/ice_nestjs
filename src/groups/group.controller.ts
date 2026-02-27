import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) { }

    @Post()
    create(@Body() createGroupDto: CreateGroupDto) {
        return this.groupService.create(createGroupDto);
    }

    @Get()
    findAll() {
        return this.groupService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.groupService.findById(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
        return this.groupService.update(id, updateGroupDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.groupService.delete(id);
    }
}
