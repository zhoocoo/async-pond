/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-06 16:14:49
 * @LastEditTime: 2021-12-08 11:06:54
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
      return asyncControl.push(100, timeoutResolve).then((res) => {
        expect(res).toEqual([100]);
      });
    });
    test("传入数组参数", function () {
      const asyncControl = new AsyncControl();
      return asyncControl.push([100], timeoutResolve).then((res) => {
        expect(res).toEqual([100]);
      });
    });
  });

  describe("小于或等于并发限制数的异步控制", function () {
    test("发起2个异步", function () {
      const asyncControl = new AsyncControl(3);
      return asyncControl.push([200, 100], timeoutResolve).then((res) => {
        expect(res).toEqual([200, 100]);
      });
    });
    test("发起与并发上限相同数量的异步", function () {
      const asyncControl = new AsyncControl(3);
      return asyncControl
        .push([100, 900, 200, 300, 150, 500, 400], timeoutResolve)
        .then((res) => {
          expect(res).toEqual([100, 900, 200, 300, 150, 500, 400]);
        });
    });
  });

  describe("大于并发限制数的异步控制", function () {
    test("发起刚好超出并发限制1个的异步", function () {
      const asyncControl = new AsyncControl(3);
      return asyncControl
        .push([100, 300, 500, 400], timeoutResolve)
        .then((res) => {
          expect(res).toEqual([100, 300, 500, 400]);
        });
    });
    test("发起并发限制2倍数量的异步", function () {
      const asyncControl = new AsyncControl(3);
      return asyncControl
        .push([100, 150, 500, 400, 300, 200], timeoutResolve)
        .then((res) => {
          expect(res).toEqual([100, 150, 500, 400, 300, 200]);
        });
    });
  });

  describe("并发数量控制", function () {
    test("异步数量在并发上限值以上时，并发数量是否得已控制", function () {
      const poolLimit = 3;
      const asyncControl = new AsyncControl(poolLimit, {
        afterInitSingleAsync(runAsyncNum) {
          expect(runAsyncNum).toBeLessThanOrEqual(poolLimit);
        },
      });
      return asyncControl
        .push([100, 150, 500, 400, 300, 200, 550, 350, 250], timeoutResolve)
        .then((res) => {
          expect(res).toEqual([100, 150, 500, 400, 300, 200, 550, 350, 250]);
        });
    });
  });
});
