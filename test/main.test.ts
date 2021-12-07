/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-06 16:14:49
 * @LastEditTime: 2021-12-07 21:17:06
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

  describe("小于或等于并发限制数的异步控制", function () {
    test("发起2个异步", function () {
      const asyncControl = new AsyncControl(3);
      return asyncControl.push([2000, 1000], timeoutResolve).then((res) => {
        expect(res).toEqual([2000, 1000]);
      });
    });
    test("发起与并发上限相同数量的异步", function () {
      const asyncControl = new AsyncControl(3);
      return asyncControl
        .push([100, 900, 200, 300, 1000, 500, 700], timeoutResolve)
        .then((res) => {
          expect(res).toEqual([100, 900, 200, 300, 1000, 500, 700]);
        });
    });
  });

  describe("大于并发限制数的异步控制", function () {
    test("发起刚好超出并发限制1个的异步", function () {
      const asyncControl = new AsyncControl(3);
      return asyncControl
        .push([100, 1500, 500, 1000], timeoutResolve)
        .then((res) => {
          expect(res).toEqual([100, 1500, 500, 1000]);
        });
    });
    test("发起并发限制2倍数量的异步", function () {
      const asyncControl = new AsyncControl(3);
      return asyncControl
        .push([100, 1500, 500, 1000, 300, 1100], timeoutResolve)
        .then((res) => {
          expect(res).toEqual([100, 1500, 500, 1000, 300, 1100]);
        });
    });
  });
});
