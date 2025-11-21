import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RainfallService } from './rainfall.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Rainfall Forecast')
@ApiBearerAuth()
@Controller('api/v1/rainfall')
@UseGuards(JwtAuthGuard)
export class RainfallController {
  constructor(private readonly rainfallService: RainfallService) {}

  @Get('stations')
  @ApiOperation({ summary: 'Get all rainfall stations' })
  @ApiResponse({ status: 200, description: 'List of stations' })
  async getAllStations() {
    return this.rainfallService.getAllStations();
  }

  @Get('stations/:id')
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiResponse({ status: 200, description: 'Station details' })
  async getStationById(@Param('id') id: string) {
    return this.rainfallService.getStationById(id);
  }

  @Get('stations/:id/forecast')
  @ApiOperation({ summary: 'Get 7-day rainfall forecast' })
  @ApiQuery({ name: 'days', required: false, type: Number, default: 7 })
  @ApiResponse({ status: 200, description: 'Forecast data' })
  async getForecast(
    @Param('id') id: string,
    @Query('days') days?: number,
  ) {
    return this.rainfallService.getForecast(id, days);
  }

  @Get('stations/:id/history')
  @ApiOperation({ summary: 'Get historical rainfall data' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Historical data' })
  async getHistoricalData(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.rainfallService.getHistoricalData(id, startDate, endDate, limit);
  }

  @Get('stations/:id/seasonal')
  @ApiOperation({ summary: 'Get seasonal analysis' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Seasonal analysis' })
  async getSeasonalAnalysis(
    @Param('id') id: string,
    @Query('year') year?: number,
  ) {
    return this.rainfallService.getSeasonalAnalysis(id, year);
  }

  @Get('risk-indicators')
  @ApiOperation({ summary: 'Get drought/flood risk indicators' })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Risk indicators' })
  async getRiskIndicators(@Query('region') region?: string) {
    return this.rainfallService.getRiskIndicators(region);
  }
}

