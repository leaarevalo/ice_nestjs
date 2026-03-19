import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.COUNSELOR)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  create(@Body() dto: CreateHistoryDto, @Request() req) {
    return this.historyService.create(dto, req.user.sub);
  }

  @Get()
  findByManager(@Request() req) {
    return this.historyService.findByManagerId(req.user.sub);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string, @Request() req) {
    return this.historyService.findByUserId(userId, req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.historyService.findOne(id, req.user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHistoryDto) {
    return this.historyService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.historyService.delete(id);
  }
}
