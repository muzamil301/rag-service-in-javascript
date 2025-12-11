import { Controller, Get, Post, Body, InternalServerErrorException, HttpStatus, HttpException } from '@nestjs/common';
import { DbService } from '../db/db.service'; // Path to your DbService

@Controller('test') // Base route is /test
export class TestController {
  // Inject the DbService using NestJS Dependency Injection
  constructor(private readonly dbService: DbService) {}

  /**
   * GET /test/status
   * Returns a basic status check to confirm the server is running and the DB is connected.
   */
  @Get('status')
  async getStatus() {
    try {
      // Test the connection by running a simple query
      const result = await this.dbService.query('SELECT NOW() AS current_time');

      return {
        server: 'Up and Running',
        database: 'PostgreSQL Connected',
        currentTime: result.rows[0].current_time,
        tablesChecked: true, // Tables were created on DbService init
      };
    } catch (error) {
      // Catch any error from the DbService (e.g., connection lost, bad query)
      throw new InternalServerErrorException({
        server: 'Up and Running',
        database: 'Connection Failed',
        error: error.message,
      });
    }
  }

  /**
   * GET /test/tables
   * Retrieves the schema of the created tables to verify Milestone 1.4 was successful.
   */
  @Get('tables')
  async checkTables() {
    try {
        // Query PostgreSQL's information schema to check if our tables exist and have the expected columns
        const vectorTableSchema = await this.dbService.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'document_vectors' 
            ORDER BY ordinal_position;
        `);
        
        const conversationTableSchema = await this.dbService.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'conversations' 
            ORDER BY ordinal_position;
        `);

        return {
            document_vectors_schema: vectorTableSchema.rows,
            conversations_schema: conversationTableSchema.rows,
        };

    } catch (error) {
        throw new InternalServerErrorException('Error checking table schemas.');
    }
  }
}