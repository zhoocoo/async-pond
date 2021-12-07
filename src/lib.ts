/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-07 11:13:08
 * @LastEditTime: 2021-12-07 11:14:23
 * @Description: 工具
 */

export function isObject(obj: any) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
