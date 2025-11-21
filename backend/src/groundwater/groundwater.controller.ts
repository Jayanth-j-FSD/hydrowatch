import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GroundwaterService } from './groundwater.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Groundwater')
@ApiBearerAuth()
@Controller('api/v1/groundwater')
@UseGuards(JwtAuthGuard)
export class GroundwaterController {
  constructor(private readonly groundwaterService: GroundwaterService) {}

  @Get('wells')
  @ApiOperation({ summary: 'Get all groundwater wells' })
  @ApiResponse({ status: 200, description: 'List of wells' })
  async getAllWells() {
    return this.groundwaterService.getAllWells();
  }

  @Get('wells/:id')
  @ApiOperation({ summary: 'Get well by ID' })
  @ApiResponse({ status: 200, description: 'Well details' })
  async getWellById(@Param('id') id: string) {
    return this.groundwaterService.getWellById(id);
  }

  @Get('wells/:id/depth')
  @ApiOperation({ summary: 'Get current depth for a well' })
  @ApiResponse({ status: 200, description: 'Current depth data' })
  async getCurrentDepth(@Param('id') id: string) {
    return this.groundwaterService.getCurrentDepth(id);
  }

  @Get('wells/:id/depth/history')
  @ApiOperation({ summary: 'Get depth history' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Depth history' })
  async getDepthHistory(
    @Param('id') wellId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.groundwaterService.getDepthHistory(wellId, startDate, endDate, limit);
  }

  @Get('wells/:id/quality')
  @ApiOperation({ summary: 'Get water quality data' })
  @ApiResponse({ status: 200, description: 'Quality data' })
  async getQualityData(@Param('id') id: string) {
    return this.groundwaterService.getQualityData(id);
  }

  @Get('regions/:region')
  @ApiOperation({ summary: 'Get all wells in a region' })
  @ApiResponse({ status: 200, description: 'Regional data' })
  async getRegionalData(@Param('region') region: string) {
    return this.groundwaterService.getRegionalData(region);
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get heatmap data' })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Heatmap data' })
  async getHeatmapData(@Query('region') region?: string) {
    return this.groundwaterService.getHeatmapData(region);
  }
}

