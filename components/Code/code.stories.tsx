import { CodeBlock } from "./CodeBlock";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof CodeBlock> = {
  title: "Components/Code",
  component: CodeBlock,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    // layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    
  },
};

export default meta;


// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Main: StoryObj<typeof CodeBlock> = {
  args: {
    code: `
export function ReactApp() {
    return (
    <div>
        <h1>Hello, world!</h1>
    </div>
    );
}
    `,
    language: "jsx",
    highlightLines: ["1-2"],
  },
  render: (args) => <CodeBlock {...args} />,

};
