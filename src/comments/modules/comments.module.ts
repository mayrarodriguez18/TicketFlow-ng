import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from '../services/comments.service';
import { CommentsController } from '../controllers/comments.controller';
import { Comment } from '../entities/comment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Ticket])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
