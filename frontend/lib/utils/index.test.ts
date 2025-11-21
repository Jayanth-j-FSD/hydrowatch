import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatNumber,
  getStatusColor,
  getStatusBadgeColor,
  calculatePercentage,
  isValidEmail,
} from './index';
import { parseISO } from 'date-fns';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = '2024-01-15T10:30:00Z';
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
    });

    it('should return "Invalid date" for invalid input', () => {
      const formatted = formatDate('invalid');
      expect(formatted).toBe('Invalid date');
    });
  });

  describe('formatNumber', () => {
    it('should format number with commas', () => {
      expect(formatNumber(1000)).toBe('1,000.00');
      expect(formatNumber(1234567.89)).toBe('12,34,567.89');
    });

    it('should handle decimal places', () => {
      expect(formatNumber(100, 0)).toBe('100');
      expect(formatNumber(100.123, 3)).toBe('100.123');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for safe status', () => {
      expect(getStatusColor('safe')).toContain('green');
    });

    it('should return correct color for warning status', () => {
      expect(getStatusColor('warning')).toContain('yellow');
    });

    it('should return correct color for critical status', () => {
      expect(getStatusColor('critical')).toContain('red');
    });
  });

  describe('getStatusBadgeColor', () => {
    it('should return badge classes for safe status', () => {
      const classes = getStatusBadgeColor('safe');
      expect(classes).toContain('bg-green');
      expect(classes).toContain('text-green');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
    });

    it('should return 0 when total is 0', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.in')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });
});

