import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';

export enum DamStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OVERFLOW = 'overflow',
}

export class DamCapacityDto {
  @ApiProperty()
  @IsString()
  damId: string;

  @ApiProperty()
  @IsNumber()
  storage: number;

  @ApiProperty()
  @IsNumber()
  capacity: number;

  @ApiProperty()
  @IsNumber()
  percentage: number;

  @ApiProperty()
  @IsDateString()
  timestamp: Date;

  @ApiProperty({ enum: DamStatus })
  @IsEnum(DamStatus)
  status: DamStatus;
}

export class CreateDamCapacityDto {
  @ApiProperty()
  @IsString()
  damId: string;

  @ApiProperty()
  @IsNumber()
  storage: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  inflowRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  outflowRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  powerGeneration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: Date;
}

export class DamCapacityQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  damId?: string;

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

