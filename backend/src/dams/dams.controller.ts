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
import { DamsService } from './dams.service';
import { CreateDamCapacityDto, DamCapacityQueryDto } from './dto/dam-capacity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dams Dashboard')
@ApiBearerAuth()
@Controller('api/v1/dams')
@UseGuards(JwtAuthGuard)
export class DamsController {
  constructor(private readonly damsService: DamsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all dams' })
  @ApiResponse({ status: 200, description: 'List of dams' })
  async getAllDams() {
    return this.damsService.getAllDams();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dam by ID' })
  @ApiResponse({ status: 200, description: 'Dam details' })
  @ApiResponse({ status: 404, description: 'Dam not found' })
  async getDamById(@Param('id') id: string) {
    return this.damsService.getDamById(id);
  }

  @Get(':id/capacity')
  @ApiOperation({ summary: 'Get current capacity for a dam' })
  @ApiResponse({ status: 200, description: 'Current capacity data' })
  async getCurrentCapacity(@Param('id') id: string) {
    return this.damsService.getCurrentCapacity(id);
  }

  @Get(':id/capacity/history')
  @ApiOperation({ summary: 'Get capacity history' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Capacity history' })
  async getCapacityHistory(
    @Param('id') damId: string,
    @Query() query: DamCapacityQueryDto,
  ) {
    return this.damsService.getCapacityHistory({
      ...query,
      damId,
    });
  }

  @Get('regions/:region')
  @ApiOperation({ summary: 'Get all dams in a region' })
  @ApiResponse({ status: 200, description: 'Dams in region' })
  async getDamsByRegion(@Param('region') region: string) {
    return this.damsService.getDamsByRegion(region);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get active overflow alerts' })
  @ApiResponse({ status: 200, description: 'Active alerts' })
  async getActiveAlerts() {
    return this.damsService.getActiveAlerts();
  }

  @Post('capacity')
  @ApiOperation({ summary: 'Create new capacity reading (Admin only)' })
  @ApiResponse({ status: 201, description: 'Capacity created' })
  async createCapacity(@Body() createDto: CreateDamCapacityDto) {
    return this.damsService.createCapacity(createDto);
  }
}

