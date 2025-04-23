import pino from 'pino';

export class LoggerService {
    private logger = pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      });
    
      info(message: string) {
        this.logger.info(message);
      }
    
      error(message: string) {
        this.logger.error(message);
      }
    
      debug(message: string) {
        this.logger.debug(message);
      }
}