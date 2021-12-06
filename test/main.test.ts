/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-06 16:14:49
 * @LastEditTime: 2021-12-06 16:57:28
 * @Description:
 */

import AsyncControl from "../src/async-control";
import { timeoutResolve } from "./utils/lib";
describe("异步控制", function () {
  describe("初始化", function () {
    it("初始化异步控制函数", function () {
      const asyncControl = new AsyncControl();
      expect(asyncControl.poolLimit).toBe(3);
      const asyncControl4 = new AsyncControl(4);
      expect(asyncControl4.poolLimit).toBe(4);
    });
  });

  describe("参数传入测试", function () {
    test("传入单个参数", function () {
      const asyncControl = new AsyncControl();
      return asyncControl.push(1000, timeoutResolve).then((res) => {
        expect(res).toEqual([1000]);
      });
    });
    test("传入数组参数", function () {
      const asyncControl = new AsyncControl();
      return asyncControl.push([1000], timeoutResolve).then((res) => {
        expect(res).toEqual([1000]);
      });
    });
  });

  describe("发起2-3个异步", function () {
    test("发起2个异步", function () {
      const asyncControl = new AsyncControl();
      return asyncControl.push([2000, 1000], timeoutResolve).then((res) => {
        expect(res).toEqual([2000, 1000]);
      });
    });
    test("发起3个异步", function () {
      const asyncControl = new AsyncControl();
      return asyncControl
        .push([2000, 1000, 3000], timeoutResolve)
        .then((res) => {
          console.log(res);
          expect(res).toEqual([2000, 1000, 3000]);
        });
    });
  });
});
