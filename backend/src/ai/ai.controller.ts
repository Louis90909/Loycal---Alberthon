import { Controller, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AIService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('chat')
  async chatWithRemi(@Body() chatDto: ChatDto, @Request() req) {
    const response = await this.aiService.chatWithRemi(req.user.id, chatDto);
    return { response };
  }

  @Post('generate-offer')
  async generateOffer(@Body('objective') objective: string, @Request() req) {
    return this.aiService.generateOffer(req.user.id, objective);
  }

  @Post('generate-campaign')
  async generateCampaign(
    @Body('objective') objective: string,
    @Body('segment') segment: string,
    @Request() req,
  ) {
    return this.aiService.generateCampaign(req.user.id, objective, segment);
  }
}






