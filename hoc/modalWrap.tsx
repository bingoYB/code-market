import { assignIn } from "lodash";
import { createRoot } from "react-dom/client";
import { type ModalProps } from "antd";

// 存储所有实例的销毁方法
let modalList: {
  name?: string;
  close: () => void;
}[] = [];c

export interface ModalFCProps extends ModalProps {
  visibleControl?: boolean;
  visible?: boolean;
  onCancel?: (data?: any) => any;
  onOk?: (data?: any) => any;
  afterClose?: () => any;
}

/**
 * 弹框封装个静态方法，能够使用 open(props) 方法直接打开弹框
 */
export default function ModalWrap<T extends ModalFCProps>(
  Modal: React.FC<T>
): {
  open: (props: T) => {
    destroy: () => void;
    update: (configUpdate: T) => void;
    isOpen: boolean;
  };
} {
  // 避免重复封装
  if (Object.hasOwnProperty.call(Modal, "open")) {
    // @ts-ignore
    return Modal;
  }
  /**
   * 打开弹框通用方法
   * @param {*} props 弹框所需参数
   * @param {*} props.visibleControl 自主控制弹框显示隐藏
   * @returns
   */
  function open(props: T) {
    // 弹框名称. 可通过name来关闭指定弹框
    // @ts-ignore
    const name = props?.name;
    // 自主控制
    let visibleControl = props.visibleControl;
    let container = document.createDocumentFragment();
    const renderRoot = createRoot(container);

    let currentProps = assignIn(assignIn({}, props), {
      close: close,
      visible: true,
      onCancel(data: any) {
        if (typeof props.onCancel === "function") {
          props.onCancel(data);
        }

        if (!visibleControl) {
          close();
        }
      },
      onOk(data: any) {
        if (typeof props.onOk === "function") {
          props.onOk(data);
        }
        if (!visibleControl) {
          close();
        }
      },
    });

    function destroy() {
      // 销毁实例
      //   reactDom.unmountComponentAtNode(container);
      renderRoot.unmount();

      // 删除modalList缓存的方法
      for (let i = 0; i < modalList.length; i++) {
        let { close: fn } = modalList[i];

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (fn === close) {
          modalList.splice(i, 1);
          break;
        }
      }
    }

    function render(_props: T) {
      /**
       * https://github.com/ant-design/ant-design/issues/23623
       *
       * Sync render blocks React event. Let's make this async.
       */
      setTimeout(() => {
        renderRoot.render(<Modal {..._props} />);
        // reactDom.render(<Modal {..._props} />, container);
      });
    }
    /**
     * 关闭弹框
     */
    function close() {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let _this = this;
      // visible
      currentProps = assignIn(assignIn({}, currentProps), {
        visible: false,
        afterClose: function afterClose() {
          if (typeof props.afterClose === "function") {
            props.afterClose();
          }
          // 在关闭后进行销毁弹框
          destroy.apply(_this);
          if (_this) {
            _this.isOpen = false;
          }
        },
      });
      // 重新渲染弹框
      render(currentProps);
    }

    /**
     * 更新弹框
     * @param {function|object} configUpdate 更新后的配置属性
     */
    function update(configUpdate: T) {
      currentProps = assignIn(assignIn({}, currentProps), configUpdate, {
        onCancel(data: any) {
          if (typeof configUpdate.onCancel === "function") {
            configUpdate.onCancel(data);
          }

          if (!visibleControl) {
            close();
          }
        },
        onOk(data: any) {
          if (typeof configUpdate.onOk === "function") {
            configUpdate.onOk(data);
          }
          if (!visibleControl) {
            close();
          }
        },
        close: close,
      });

      render(currentProps);
    }

    render(currentProps);
    modalList.push({ name, close });

    return {
      destroy: close,
      update: update,
      isOpen: true,
    };
  }

  return {
    open,
  };
}
export function getModalList() {
  return modalList;
}
/**
 * 销毁所有由open打开的弹框
 */
export function destroyAll() {
  while (modalList.length) {
    const modal = modalList?.pop();

    if (modal) {
      modal.close();
    }
  }
}
