export interface SelectionOption {
  title: string;
  description: string;
  value: string | number;
}

export interface SelectionConfig {
  message: string;
  options: SelectionOption[];
  selectedColor?: 'blue' | 'green' | 'cyan' | 'magenta' | 'yellow';
  unselectedColor?: 'white' | 'gray' | 'grey';
  descriptionColor?: 'gray' | 'grey' | 'dim';
}

export interface SelectionResult {
  selectedOption: SelectionOption;
  selectedIndex: number;
}

export interface KeyPress {
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  sequence?: string;
}

export type InputHandler = (key: KeyPress, rawInput: Buffer) => void;