import { ScrollBarWrap } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof ScrollBarWrap> = {
  title: "Components/ScrollBar",

  component: ScrollBarWrap,
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
export const Main: StoryObj<typeof ScrollBarWrap> = {
  render: function Render(args){
    return (
        <ScrollBarWrap style={{height: 200}}>
            <div style={{height: 500}}>
                测试内容
            </div>
        </ScrollBarWrap>
    );
  },
};
