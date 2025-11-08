import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('txs-from-block/:blockId')
  getTransactionsFromBlock(@Param('blockId') blockId: string): Promise<any> {
    return this.appService.getTransactionsFromBlock(blockId);
  }
}
