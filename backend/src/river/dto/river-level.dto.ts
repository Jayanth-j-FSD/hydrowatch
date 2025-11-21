import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';

export enum RiverLevelStatus {
  SAFE = 'safe',
  WARNING = 'warning',
  DANGER = 'danger',
  CRITICAL = 'critical',
}

export class RiverLevelDto {
  @ApiProperty()
  @IsString()
  stationId: string;

  @ApiProperty()
  @IsNumber()
  level: number;

  @ApiProperty()
  @IsDateString()
  timestamp: Date;

  @ApiProperty({ enum: RiverLevelStatus })
  @IsEnum(RiverLevelStatus)
  status: RiverLevelStatus;
}

export class CreateRiverLevelDto {
  @ApiProperty()
  @IsString()
  stationId: string;

  @ApiProperty()
  @IsNumber()
  level: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: Date;
}

export class RiverLevelQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, default: 100 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

