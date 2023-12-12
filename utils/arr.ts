// 数组处理工具函数

/**
 * 将符合条件的内容放到最前面
 * @param arr 数组
 * @param conditionFn 条件函数
 * @param option 配置参数
 * @param option.newArr 是否生成新数组返回，默认在原数组修改
 * @example putFirst([1, 2, 3, 4, 5], (i)=>i===5) => [5, 2, 3, 4, 1]
 */
export function putFirst<T>(arr: T[], conditionFn: (item: T) => boolean , config: { newArr: boolean } = {
    newArr: true
}) {
  let i = 0;
  let j = arr.length - 1;

  if(config.newArr){
      arr = [...arr];
  }

  while (i < j) {
    // 从数组开头找到第一个不符合条件的元素
    while (i < j && conditionFn(arr[i])) {
      i++;
    }

    // 从数组末尾找到第一个符合条件的元素
    while (i < j && !conditionFn(arr[j])) {
      j--;
    }

    // 交换位置
    if (i < j) {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }

  return arr;
}
