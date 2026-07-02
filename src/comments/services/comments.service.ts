import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: createCommentDto.ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      ticketId: createCommentDto.ticketId,
      authorId: userId,
    });

    return this.commentsRepository.save(comment);
  }

  async findByTicket(
    ticketId: string,
    user: { id: string; role: Role },
  ) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (
      user.role === Role.USER &&
      ticket.createdById !== user.id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para ver los comentarios de este ticket',
      );
    }

    return this.commentsRepository.find({
      where: { ticketId },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este comentario',
      );
    }

    await this.commentsRepository.remove(comment);
  }
}
