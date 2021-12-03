/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-02 17:49:28
 * @LastEditTime: 2021-12-02 17:49:28
 * @Description: 测试方法
 */

const timeout = (i) =>
  new Promise((resolve) =>
    setTimeout(() => {
      results.push(i);
      resolve();
    }, i)
  );
