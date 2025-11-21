import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService, SendNotificationDto } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get notification history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notification history' })
  async getHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getNotificationHistory(user.id, limit);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'User preferences' })
  async getPreferences(@CurrentUser() user: any) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updatePreferences(
    @CurrentUser() user: any,
    @Body() preferences: any,
  ) {
    return this.notificationsService.updatePreferences(user.id, preferences);
  }

  @Post('test')
  @ApiOperation({ summary: 'Send test notification' })
  @ApiResponse({ status: 201, description: 'Test notification sent' })
  async sendTestNotification(
    @CurrentUser() user: any,
    @Body() data: { type: 'email' | 'sms' | 'push'; message?: string },
  ) {
    return this.notificationsService.sendNotification({
      userId: user.id,
      type: data.type,
      message: data.message || 'This is a test notification',
      subject: 'Test Notification',
    });
  }
}

