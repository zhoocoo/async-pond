/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-02 17:49:28
 * @LastEditTime: 2021-12-06 16:50:01
 * @Description: 测试方法
 */

export const timeoutResolve = (i: number): Promise<number> =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(i);
    }, i)
  );
