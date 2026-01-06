import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { GeminiService } from './gemini.service';
import { RAGService } from './rag.service';

@Module({
  controllers: [AIController],
  providers: [AIService, GeminiService, RAGService],
  exports: [AIService],
})
export class AIModule {}
