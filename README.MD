# Interactive Terminal Selector

A custom TypeScript terminal application with interactive selection functionality. No external libraries like inquirer - built from scratch with proper TypeScript typing.

## Features

- ✨ Custom interactive selection system
- 🎨 Colorful interface with chalk
- ⚡ TypeScript with strict typing
- 🎯 Arrow key navigation
- 🔧 Fully customizable options
- 🎪 Multiple selection stages
- 🛡️ Error handling and graceful cleanup

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the application:
```bash
npm start
```

Or for development with auto-compilation:
```bash
npm run dev
```

## Controls

- **↑/↓ Arrow Keys**: Navigate through options
- **Enter**: Select current option
- **Escape/Q**: Quit the application
- **Ctrl+C**: Force exit

## Project Structure

```
src/
├── index.ts                 # Main application entry point
├── InteractiveSelector.ts   # Core selection functionality
├── InputHandler.ts          # Input/output utilities
└── types.ts                 # TypeScript type definitions
```

## Customization

You can easily customize the selection options by modifying the `SelectionOption` arrays in `index.ts`:

```typescript
const options: SelectionOption[] = [
  {
    title: 'Your Title',
    description: 'Your description',
    value: 'your-value'
  }
];

const config: SelectionConfig = {
  message: 'Your question?',
  options: options,
  selectedColor: 'blue',    // blue, green, cyan, magenta, yellow
  unselectedColor: 'white', // white, gray, grey
  descriptionColor: 'gray'  // gray, grey, dim
};
```

## Example Output

```
🚀 Interactive Terminal Selector
Use arrow keys to navigate, Enter to select, Escape or Q to quit

What do you want to say today? 'Hello World' HELLO

How would you like to proceed?
❯ Testing our selection
    Some random explanation
  Something else selection second
    Some random stuff
  Reject - nothing matters
    not sure what we rejecting

Processing...
You have chosen: Testing our selection
Selected option 1

Great choice! What would you like to test?
  Test Performance
    Run performance benchmarks
❯ Test Features
    Check all available features
  Test Integration
    Verify system integration
```

## TypeScript Features

- Strict type checking enabled
- Proper interface definitions
- Generic type support
- Error handling with typed exceptions
- Full IntelliSense support

## Development

The project uses:
- **TypeScript 5.0+** with strict mode
- **chalk 4.1.2** for terminal colors
- **ts-node** for development
- **@types/node** for Node.js types