import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async getTicketCountByStatus() {
    const counts = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.status')
      .getRawMany();

    return counts;
  }

  async getTicketsByAgent() {
    const results = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.assignedTo', 'agent')
      .select('agent.id', 'agentId')
      .addSelect('agent.full_name', 'agentName')
      .addSelect('COUNT(ticket.id)', 'count')
      .addSelect(
        `SUM(CASE WHEN ticket.status = :resolved THEN 1 ELSE 0 END)`,
        'resolved',
      )
      .addSelect(
        `SUM(CASE WHEN ticket.status != :resolved THEN 1 ELSE 0 END)`,
        'pending',
      )
      .where('ticket.assignedToId IS NOT NULL')
      .setParameter('resolved', TicketStatus.RESOLVED)
      .groupBy('agent.id')
      .addGroupBy('agent.full_name')
      .getRawMany();

    return results;
  }

  async getDashboardSummary() {
    const total = await this.ticketsRepository.count();
    const open = await this.ticketsRepository.count({
      where: { status: TicketStatus.OPEN },
    });
    const inProgress = await this.ticketsRepository.count({
      where: { status: TicketStatus.IN_PROGRESS },
    });
    const resolved = await this.ticketsRepository.count({
      where: { status: TicketStatus.RESOLVED },
    });
    const closed = await this.ticketsRepository.count({
      where: { status: TicketStatus.CLOSED },
    });

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
    };
  }
}
