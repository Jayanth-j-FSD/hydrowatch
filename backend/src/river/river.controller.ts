import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RiverService } from './river.service';
import { CreateRiverLevelDto, RiverLevelQueryDto } from './dto/river-level.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('River Tracker')
@ApiBearerAuth()
@Controller('api/v1/river')
@UseGuards(JwtAuthGuard)
export class RiverController {
  constructor(private readonly riverService: RiverService) {}

  @Get('stations')
  @ApiOperation({ summary: 'Get all river monitoring stations' })
  @ApiResponse({ status: 200, description: 'List of stations' })
  async getAllStations() {
    return this.riverService.getAllStations();
  }

  @Get('stations/:id')
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiResponse({ status: 200, description: 'Station details' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  async getStationById(@Param('id') id: string) {
    return this.riverService.getStationById(id);
  }

  @Get('stations/:id/current')
  @ApiOperation({ summary: 'Get current water level for a station' })
  @ApiResponse({ status: 200, description: 'Current level data' })
  async getCurrentLevel(@Param('id') id: string) {
    return this.riverService.getCurrentLevel(id);
  }

  @Get('stations/:id/levels')
  @ApiOperation({ summary: 'Get historical water levels' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Historical levels' })
  async getHistoricalLevels(
    @Param('id') stationId: string,
    @Query() query: RiverLevelQueryDto,
  ) {
    return this.riverService.getHistoricalLevels({
      ...query,
      stationId,
    });
  }

  @Get('rivers/:riverName')
  @ApiOperation({ summary: 'Get all stations for a specific river' })
  @ApiResponse({ status: 200, description: 'Stations for river' })
  async getStationsByRiver(@Param('riverName') riverName: string) {
    return this.riverService.getStationsByRiver(riverName);
  }

  @Get('regions/:region')
  @ApiOperation({ summary: 'Get all stations in a region' })
  @ApiResponse({ status: 200, description: 'Stations in region' })
  async getStationsByRegion(@Param('region') region: string) {
    return this.riverService.getStationsByRegion(region);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get active flood alerts' })
  @ApiResponse({ status: 200, description: 'Active alerts' })
  async getActiveAlerts() {
    return this.riverService.getActiveAlerts();
  }

  @Post('levels')
  @ApiOperation({ summary: 'Create new level reading (Admin only)' })
  @ApiResponse({ status: 201, description: 'Level created' })
  async createLevel(@Body() createDto: CreateRiverLevelDto) {
    return this.riverService.createLevel(createDto);
  }
}

