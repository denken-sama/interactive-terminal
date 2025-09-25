import * as readline from 'readline';
import chalk from 'chalk';
import { SelectionConfig, SelectionOption, SelectionResult, KeyPress } from './types';

export class InteractiveSelector {
  private currentIndex: number = 0;
  private config: SelectionConfig;
  private resolve?: (result: SelectionResult) => void;
  private reject?: (error: Error) => void;

  constructor(config: SelectionConfig) {
    this.config = {
      selectedColor: 'blue',
      unselectedColor: 'white',
      descriptionColor: 'gray',
      ...config
    };
  }

  public async select(): Promise<SelectionResult> {
    return new Promise<SelectionResult>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      // Setup raw input mode
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      
      process.stdin.resume();
      process.stdin.on('data', this.handleInput.bind(this));

      // Hide cursor and display initial selection
      process.stdout.write('\x1B[?25l');
      this.render();
    });
  }

  private handleInput(buffer: Buffer): void {
    const input = buffer.toString();
    const key = this.parseKey(buffer);

    switch (key.name) {
      case 'up':
        this.moveUp();
        break;
      case 'down':
        this.moveDown();
        break;
      case 'return':
      case 'enter':
        this.selectCurrent();
        break;
      case 'escape':
      case 'q':
        this.cleanup();
        if (this.reject) {
          this.reject(new Error('Selection cancelled'));
        }
        break;
      case 'c':
        if (key.ctrl) {
          this.cleanup();
          process.exit(0);
        }
        break;
    }
  }

  private parseKey(buffer: Buffer): KeyPress {
    const input = buffer.toString();
    const key: KeyPress = {};

    if (buffer.length === 1) {
      const code = buffer[0];
      if (code === 3) {
        key.name = 'c';
        key.ctrl = true;
      } else if (code === 13) {
        key.name = 'return';
      } else if (code === 27) {
        key.name = 'escape';
      } else if (code === 113) {
        key.name = 'q';
      }
    } else if (buffer.length === 3) {
      if (buffer[0] === 27 && buffer[1] === 91) {
        switch (buffer[2]) {
          case 65:
            key.name = 'up';
            break;
          case 66:
            key.name = 'down';
            break;
        }
      }
    }

    return key;
  }

  private moveUp(): void {
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.config.options.length - 1;
    this.render();
  }

  private moveDown(): void {
    this.currentIndex = this.currentIndex < this.config.options.length - 1 ? this.currentIndex + 1 : 0;
    this.render();
  }

  private selectCurrent(): void {
    const selectedOption = this.config.options[this.currentIndex];
    const result: SelectionResult = {
      selectedOption,
      selectedIndex: this.currentIndex
    };

    this.cleanup();
    
    if (this.resolve) {
      this.resolve(result);
    }
  }

  private cleanup(): void {
    // Show cursor
    process.stdout.write('\x1B[?25h');
    
    // Restore normal input mode
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    
    process.stdin.removeAllListeners('data');
    process.stdin.pause();
  }

  private render(): void {
    // Clear previous render (move up by number of lines we wrote)
    const linesToClear = this.config.options.length * 2 + 2; // +2 for message and empty line
    this.moveCursorUp(linesToClear);
    this.clearFromCursor();

    // Render message
    console.log(chalk.white.bold(this.config.message));
    console.log(); // Empty line

    // Render options
    this.config.options.forEach((option, index) => {
      const isSelected = index === this.currentIndex;
      const arrow = isSelected ? '❯ ' : '  ';
      
      let titleColor: chalk.Chalk;
      
      if (isSelected) {
        titleColor = this.getSelectedColor();
      } else {
        titleColor = this.getUnselectedColor();
      }

      const descriptionColor = this.getDescriptionColor();
      
      console.log(`${arrow}${titleColor(option.title)}`);
      console.log(`    ${descriptionColor(option.description)}`);
    });
  }

  private getSelectedColor(): chalk.Chalk {
    switch (this.config.selectedColor) {
      case 'blue': return chalk.blue.bold;
      case 'green': return chalk.green.bold;
      case 'cyan': return chalk.cyan.bold;
      case 'magenta': return chalk.magenta.bold;
      case 'yellow': return chalk.yellow.bold;
      default: return chalk.blue.bold;
    }
  }

  private getUnselectedColor(): chalk.Chalk {
    switch (this.config.unselectedColor) {
      case 'white': return chalk.white;
      case 'gray': case 'grey': return chalk.gray;
      default: return chalk.white;
    }
  }

  private getDescriptionColor(): chalk.Chalk {
    switch (this.config.descriptionColor) {
      case 'gray': case 'grey': return chalk.gray;
      case 'dim': return chalk.dim;
      default: return chalk.gray;
    }
  }

  private moveCursorUp(lines: number): void {
    if (lines > 0) {
      process.stdout.write(`\x1B[${lines}A`);
    }
  }

  private clearFromCursor(): void {
    process.stdout.write('\x1B[0J');
  }
}