import { ConsoleLogger } from '@nestjs/common';

export class PawvetLogger extends ConsoleLogger {
  protected formatPid(_pid: number): string {
    return `[${this.options.prefix}] - `;
  }
}
