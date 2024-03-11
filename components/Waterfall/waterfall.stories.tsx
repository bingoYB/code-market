import Waterfall from "./index";
import { Meta, StoryObj } from "@storybook/react";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof Waterfall> = {
  title: "Components/Waterfall",
  component: Waterfall,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    render: { description: "渲染子节点方法", defaultValue: undefined },
    bricks: { description: "瀑布流子节点数据", defaultValue: undefined },
    brickId: {
      description: "瀑布流子节点数据唯一值对应的属性",
      defaultValue: "id",
      type: "string"
    },
    className: {},
    gutter: {
        description: "子节点之间的间距",
        defaultValue: 24,
      },
    columnNum: {
      description: "瀑布流列数",
      defaultValue: 4,
    },
    columnSize: {
        description: "子节点的宽度",
        defaultValue: 180,
    },
    scrollElement: {
      description: "瀑布流容器的滚动元素",
      defaultValue: undefined,
    },
  },
};

export default meta;

function generateRandomData() {
  const data: {
    key: number;
    color: string;
    height: number;
  }[] = [];
  for (let i = 1; i <= 100; i++) {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    const randomHeight = Math.floor(Math.random() * 500) + 1;

    const dataEntry = {
      key: i,
      color: randomColor,
      height: randomHeight,
    };

    data.push(dataEntry);
  }
  return data;
}

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Main: StoryObj<typeof Waterfall> = {
  args: {},

  render() {
    const randomData = generateRandomData();
    const contanerId = "waterfall_container";

    return (
      <div id={contanerId} style={{width: 180*4 + 24*3, maxHeight: 700}}>
        <Waterfall
          bricks={randomData}
          brickId="key"
          scrollElement={contanerId}
          gutter={24}
          columnNum={4}
          columnSize={180}
          render={(item) => {
            return (
              <div
                key={item.key}
                style={{ backgroundColor: item.color, height: item.height, width: 180 }}
              ></div>
            );
          }}
        />
      </div>
    );
  },
};
