import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { QueryTicketDto } from '../dto/query-ticket.dto';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
  ): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      createdById: userId,
      status: TicketStatus.OPEN,
    });
    return this.ticketsRepository.save(ticket);
  }

  async findAll(query: QueryTicketDto, user: { id: string; role: Role }) {
    const qb = this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.createdBy', 'createdBy')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
      .leftJoinAndSelect('ticket.category', 'category')
      .orderBy('ticket.createdAt', 'DESC');

    if (user.role === Role.USER) {
      qb.where('ticket.createdById = :userId', { userId: user.id });
    }

    if (query.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }
    if (query.priority) {
      qb.andWhere('ticket.priority = :priority', { priority: query.priority });
    }
    if (query.assignedToId) {
      qb.andWhere('ticket.assignedToId = :assignedToId', {
        assignedToId: query.assignedToId,
      });
    }
    if (query.categoryId) {
      qb.andWhere('ticket.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.createdById) {
      qb.andWhere('ticket.createdById = :createdById', {
        createdById: query.createdById,
      });
    }

    return qb.getMany();
  }

  async findById(id: string, user: { id: string; role: Role }) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: { createdBy: true, assignedTo: true, category: true, comments: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (
      user.role === Role.USER &&
      ticket.createdById !== user.id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para ver este ticket',
      );
    }

    return ticket;
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    user: { id: string; role: Role },
  ) {
    const ticket = await this.findById(id, user);

    if (
      user.role === Role.USER &&
      ticket.createdById !== user.id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este ticket',
      );
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async assign(id: string, agentId: string) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    ticket.assignedToId = agentId;
    ticket.status = TicketStatus.IN_PROGRESS;
    return this.ticketsRepository.save(ticket);
  }

  async changeStatus(
    id: string,
    status: TicketStatus,
    user: { id: string; role: Role },
  ) {
    const ticket = await this.findById(id, user);

    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
      [TicketStatus.IN_PROGRESS]: [
        TicketStatus.WAITING_RESPONSE,
        TicketStatus.RESOLVED,
      ],
      [TicketStatus.WAITING_RESPONSE]: [
        TicketStatus.IN_PROGRESS,
        TicketStatus.RESOLVED,
      ],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
      [TicketStatus.CLOSED]: [],
    };

    const allowed = validTransitions[ticket.status];
    if (!allowed.includes(status)) {
      throw new ForbiddenException(
        `No se puede cambiar de ${ticket.status} a ${status}`,
      );
    }

    ticket.status = status;
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: string, user: { id: string; role: Role }) {
    const ticket = await this.findById(id, user);
    await this.ticketsRepository.remove(ticket);
  }
}
