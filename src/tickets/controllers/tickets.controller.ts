import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from '../services/tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { QueryTicketDto } from '../dto/query-ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { TicketStatus } from '../../common/enums/ticket-status.enum';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.ticketsService.create(createTicketDto, user.id);
  }

  @Get()
  findAll(
    @Query() queryTicketDto: QueryTicketDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.ticketsService.findAll(queryTicketDto, user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.ticketsService.findById(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.ticketsService.update(id, updateTicketDto, user);
  }

  @Post(':id/assign/:agentId')
  @Roles(Role.ADMIN, Role.AGENT)
  assign(
    @Param('id') id: string,
    @Param('agentId') agentId: string,
  ) {
    return this.ticketsService.assign(id, agentId);
  }

  @Patch(':id/status/:status')
  changeStatus(
    @Param('id') id: string,
    @Param('status') status: TicketStatus,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.ticketsService.changeStatus(id, status, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.ticketsService.remove(id, user);
  }
}
