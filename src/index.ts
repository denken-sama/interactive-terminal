import chalk from "chalk";
import { InteractiveSelector } from "./InteractiveSelector";
import { InputHandler } from "./InputHandler";
import { SelectionConfig, SelectionOption, SelectionResult } from "./types";

class TerminalApp {
  constructor() {
    // No longer store inputHandler as instance variable
  }

  private async askQuestion(question: string): Promise<string> {
    const inputHandler = new InputHandler();
    const answer = await inputHandler.askQuestion(question);
    return answer;
  }

  public async start(): Promise<void> {
    try {
      console.clear();
      console.log(chalk.cyan.bold("🚀 Interactive Terminal Selector"));
      console.log(
        chalk.gray(
          "Use arrow keys to navigate, Enter to select, Escape or Q to quit\n"
        )
      );

      // Get user input
      const userMessage = await this.askQuestion(
        "What do you want to say today?"
      );

      // Show first selection directly (no extra output)
      await this.showFirstSelection();
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\nError: ${error.message}`));
      }
    } finally {
    }
  }

  private async showFirstSelection(): Promise<void> {
    const firstOptions: SelectionOption[] = [
      {
        title: "Testing our selection",
        description: "Some random explanation",
        value: 1,
      },
      {
        title: "Something else selection second",
        description: "Some random stuff",
        value: 2,
      },
      {
        title: "Reject - nothing matters",
        description: "not sure what we rejecting",
        value: 3,
      },
    ];

    const config: SelectionConfig = {
      message: "How would you like to proceed?",
      options: firstOptions,
      selectedColor: "blue",
      unselectedColor: "white",
      descriptionColor: "gray",
    };

    try {
      const selector = new InteractiveSelector(config);
      const result: SelectionResult = await selector.select();

      await this.handleFirstSelection(result);
    } catch (error) {
      if (error instanceof Error && error.message !== "Selection cancelled") {
        console.log(chalk.red(`\nSelection error: ${error.message}`));
      }
    }
  }

  private async handleFirstSelection(result: SelectionResult): Promise<void> {
    console.log(); // Add some space

    this.displayProcessing("Processing...");

    // Simulate processing time
    await this.delay(1000);

    // Show second selection based on the first choice
    await this.showSecondSelection(result);
  }

  private async showSecondSelection(
    previousResult: SelectionResult
  ): Promise<void> {
    let secondOptions: SelectionOption[];
    let message: string;

    // Different options based on previous selection
    switch (previousResult.selectedOption.value) {
      case 1:
        message = "Great choice! What would you like to test?";
        secondOptions = [
          {
            title: "Test Performance",
            description: "Run performance benchmarks",
            value: "performance",
          },
          {
            title: "Test Features",
            description: "Check all available features",
            value: "features",
          },
          {
            title: "Test Integration",
            description: "Verify system integration",
            value: "integration",
          },
        ];
        break;

      case 2:
        message = "Interesting! What else would you like to explore?";
        secondOptions = [
          {
            title: "Advanced Configuration",
            description: "Dive into advanced settings",
            value: "advanced",
          },
          {
            title: "Data Analysis",
            description: "Analyze your data patterns",
            value: "analysis",
          },
          {
            title: "Export Options",
            description: "Export your work in various formats",
            value: "export",
          },
        ];
        break;

      case 3:
      default:
        message = "No worries! Maybe try something else?";
        secondOptions = [
          {
            title: "Start Fresh",
            description: "Begin with a clean slate",
            value: "fresh",
          },
          {
            title: "Get Help",
            description: "View documentation and tutorials",
            value: "help",
          },
          {
            title: "Exit Gracefully",
            description: "Leave the application",
            value: "exit",
          },
        ];
        break;
    }

    const config: SelectionConfig = {
      message,
      options: secondOptions,
      selectedColor: "green",
      unselectedColor: "white",
      descriptionColor: "gray",
    };

    try {
      const selector = new InteractiveSelector(config);
      const result: SelectionResult = await selector.select();

      await this.handleSecondSelection(result);
    } catch (error) {
      if (error instanceof Error && error.message !== "Selection cancelled") {
        console.log(chalk.red(`\nSelection error: ${error.message}`));
      }
    }
  }

  private async handleSecondSelection(result: SelectionResult): Promise<void> {
    console.log(); // Add some space

    this.displayProcessing("Finalizing your selection...");

    // Simulate processing time
    await this.delay(800);

    console.log(
      chalk.yellow.bold(`\n🎉 Final choice: ${result.selectedOption.title}`)
    );
    console.log(
      chalk.white(`Description: ${result.selectedOption.description}`)
    );
    console.log(chalk.dim(`Value: ${result.selectedOption.value}\n`));

    console.log(
      chalk.cyan("Thank you for using Interactive Terminal Selector!")
    );
    console.log(chalk.gray("Session completed successfully."));
  }

  private displayProcessing(message: string = "Processing..."): void {
    console.log(chalk.dim(message));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Start the application
async function main(): Promise<void> {
  const app = new TerminalApp();
  await app.start();
}

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n\nGracefully shutting down..."));
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log(chalk.yellow("\n\nGracefully shutting down..."));
  process.exit(0);
});

// Run the application
if (require.main === module) {
  main().catch((error: Error) => {
    console.error(chalk.red("Application error:"), error.message);
    process.exit(1);
  });
}
