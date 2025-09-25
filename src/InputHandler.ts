import * as readline from 'readline';
import chalk from 'chalk';

export class InputHandler {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  public async askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(chalk.cyan.bold(question + ' '), (answer: string) => {
        resolve(answer.trim());
        // Ensure we close readline after getting input to avoid conflicts
        this.rl.close();
      });
    });
  }

  public displayMessage(message: string, color: 'green' | 'blue' | 'yellow' | 'red' | 'white' = 'white'): void {
    let coloredMessage: string;
    
    switch (color) {
      case 'green':
        coloredMessage = chalk.green(message);
        break;
      case 'blue':
        coloredMessage = chalk.blue(message);
        break;
      case 'yellow':
        coloredMessage = chalk.yellow(message);
        break;
      case 'red':
        coloredMessage = chalk.red(message);
        break;
      default:
        coloredMessage = chalk.white(message);
    }
    
    console.log(coloredMessage);
  }

  public displayProcessing(message: string = 'Processing...'): void {
    console.log(chalk.dim(message));
  }

  public close(): void {
    this.rl.close();
  }
}