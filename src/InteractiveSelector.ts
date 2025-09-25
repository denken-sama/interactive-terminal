import chalk from "chalk";
import {
  SelectionConfig,
  SelectionOption,
  SelectionResult,
  KeyPress,
} from "./types.js";

export class InteractiveSelector {
  private currentIndex: number = 0;
  private config: SelectionConfig;
  private resolve?: (result: SelectionResult) => void;
  private reject?: (error: Error) => void;
  private originalRawMode: boolean = false;

  constructor(config: SelectionConfig) {
    this.config = {
      selectedColor: "blue",
      unselectedColor: "white",
      descriptionColor: "gray",
      ...config,
    };
  }

  public async select(): Promise<SelectionResult> {
    return new Promise<SelectionResult>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.setupTerminal();
      this.render();
      this.startInputListener();
    });
  }

  private setupTerminal(): void {
    // Store original state
    this.originalRawMode = process.stdin.isRaw || false;

    // Set raw mode for immediate input
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    // Set encoding and resume stdin
    process.stdin.setEncoding("utf8");
    process.stdin.resume();

    // Hide cursor during selection
    process.stdout.write("\x1B[?25l");
  }

  private startInputListener(): void {
    process.stdin.on("data", this.handleKeyPress.bind(this));
  }

  private handleKeyPress(data: Buffer | string): void {
    const input = data.toString();
    const key = this.parseInput(input);

    switch (key.name) {
      case "up":
        this.moveUp();
        break;
      case "down":
        this.moveDown();
        break;
      case "enter":
        this.selectCurrent();
        break;
      case "escape":
      case "q":
        this.cancel();
        break;
      case "ctrl+c":
        this.forceExit();
        break;
    }
  }

  private parseInput(input: string): KeyPress {
    const key: KeyPress = {};

    // Handle multi-character sequences (arrow keys)
    if (input.length === 3 && input[0] === "\x1b" && input[1] === "[") {
      switch (input[2]) {
        case "A":
          key.name = "up";
          break;
        case "B":
          key.name = "down";
          break;
        case "C":
          key.name = "right";
          break;
        case "D":
          key.name = "left";
          break;
      }
    }
    // Handle single characters
    else if (input.length === 1) {
      const code = input.charCodeAt(0);
      switch (code) {
        case 3: // Ctrl+C
          key.name = "ctrl+c";
          break;
        case 13: // Enter
          key.name = "enter";
          break;
        case 27: // Escape
          key.name = "escape";
          break;
        case 113: // 'q'
          key.name = "q";
          break;
      }
    }

    return key;
  }

  private moveUp(): void {
    this.currentIndex =
      this.currentIndex > 0
        ? this.currentIndex - 1
        : this.config.options.length - 1;
    this.updateDisplay();
  }

  private moveDown(): void {
    this.currentIndex =
      this.currentIndex < this.config.options.length - 1
        ? this.currentIndex + 1
        : 0;
    this.updateDisplay();
  }

  private selectCurrent(): void {
    const selectedOption = this.config.options[this.currentIndex];
    const result: SelectionResult = {
      selectedOption,
      selectedIndex: this.currentIndex,
    };

    this.cleanup();

    if (this.resolve) {
      this.resolve(result);
    }
  }

  private cancel(): void {
    this.cleanup();
    if (this.reject) {
      this.reject(new Error("Selection cancelled"));
    }
  }

  private forceExit(): void {
    this.cleanup();
    if (this.reject) {
      this.reject(new Error("Force exit"));
    }
  }

  private render(): void {
    // Render message
    process.stdout.write(chalk.white.bold(this.config.message) + "\n");

    // Render options
    this.config.options.forEach((option, index) => {
      const isSelected = index === this.currentIndex;
      const arrow = isSelected ? "❯ " : "  ";

      let titleColor: chalk.Chalk;

      if (isSelected) {
        titleColor = this.getSelectedColor();
      } else {
        titleColor = this.getUnselectedColor();
      }

      const descriptionColor = this.getDescriptionColor();

      process.stdout.write(`${arrow}${titleColor(option.title)}\n`);
      process.stdout.write(`    ${descriptionColor(option.description)}\n`);
    });
  }

  private updateDisplay(): void {
    // Move cursor up to start of options (message line + all option lines)
    const totalLines = this.config.options.length * 2;
    process.stdout.write(`\x1B[${totalLines}A`);

    // Re-render all options
    this.config.options.forEach((option, index) => {
      const isSelected = index === this.currentIndex;
      const arrow = isSelected ? "❯ " : "  ";

      let titleColor: chalk.Chalk;

      if (isSelected) {
        titleColor = this.getSelectedColor();
      } else {
        titleColor = this.getUnselectedColor();
      }

      const descriptionColor = this.getDescriptionColor();

      // Clear the line and write new content
      process.stdout.write("\x1B[2K"); // Clear entire line
      process.stdout.write(`${arrow}${titleColor(option.title)}\n`);
      process.stdout.write("\x1B[2K"); // Clear entire line
      process.stdout.write(`    ${descriptionColor(option.description)}\n`);
    });
  }

  private cleanup(): void {
    // Remove input listener
    process.stdin.removeAllListeners("data");

    // Show cursor
    process.stdout.write("\x1B[?25h");

    // Restore terminal mode
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(this.originalRawMode);
    }

    process.stdin.pause();
  }

  private getSelectedColor(): chalk.Chalk {
    switch (this.config.selectedColor) {
      case "blue":
        return chalk.blue.bold;
      case "green":
        return chalk.green.bold;
      case "cyan":
        return chalk.cyan.bold;
      case "magenta":
        return chalk.magenta.bold;
      case "yellow":
        return chalk.yellow.bold;
      default:
        return chalk.blue.bold;
    }
  }

  private getUnselectedColor(): chalk.Chalk {
    switch (this.config.unselectedColor) {
      case "white":
        return chalk.white;
      case "gray":
      case "grey":
        return chalk.gray;
      default:
        return chalk.white;
    }
  }

  private getDescriptionColor(): chalk.Chalk {
    switch (this.config.descriptionColor) {
      case "gray":
      case "grey":
        return chalk.gray;
      case "dim":
        return chalk.dim;
      default:
        return chalk.gray;
    }
  }
}
