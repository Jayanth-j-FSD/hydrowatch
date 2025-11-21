import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertConfigDto, UpdateAlertConfigDto } from './dto/alert-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('api/v1/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('configurations')
  @ApiOperation({ summary: 'Create alert configuration' })
  @ApiResponse({ status: 201, description: 'Configuration created' })
  async createConfiguration(
    @Body() createDto: CreateAlertConfigDto,
    @CurrentUser() user: any,
  ) {
    return this.alertsService.createConfiguration(user.id, createDto);
  }

  @Get('configurations')
  @ApiOperation({ summary: 'Get user alert configurations' })
  @ApiResponse({ status: 200, description: 'List of configurations' })
  async getUserConfigurations(@CurrentUser() user: any) {
    return this.alertsService.getUserConfigurations(user.id);
  }

  @Put('configurations/:id')
  @ApiOperation({ summary: 'Update alert configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated' })
  async updateConfiguration(
    @Param('id') id: string,
    @Body() updateDto: UpdateAlertConfigDto,
    @CurrentUser() user: any,
  ) {
    return this.alertsService.updateConfiguration(id, user.id, updateDto);
  }

  @Delete('configurations/:id')
  @ApiOperation({ summary: 'Delete alert configuration' })
  @ApiResponse({ status: 200, description: 'Configuration deleted' })
  async deleteConfiguration(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.alertsService.deleteConfiguration(id, user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active alerts' })
  @ApiResponse({ status: 200, description: 'Active alerts' })
  async getActiveAlerts(@CurrentUser() user: any) {
    return this.alertsService.getActiveAlerts(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get alert history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Alert history' })
  async getAlertHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.alertsService.getAlertHistory(user.id, limit);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged' })
  async acknowledgeAlert(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.alertsService.acknowledgeAlert(id, user.id);
  }
}

