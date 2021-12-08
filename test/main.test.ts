/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-06 16:14:49
 * @LastEditTime: 2021-12-08 20:55:20
 * @Description:
 */
import AsyncControl from "../src/async-control";
import {
  timeoutResolve,
  timeoutRejectWithCatch,
  timeoutRandomStatus,
  getExpectedResult,
  getAllSameMatchResult,
  timeoutReject,
} from "./utils/lib";
describe("异步控制", function () {
  describe("初始化", function () {
    test("初始化异步控制函数", function () {
      const asyncControl = new AsyncControl();
      expect(asyncControl.poolLimit).toBe(3);
      const asyncControl4 = new AsyncControl(4);
      expect(asyncControl4.poolLimit).toBe(4);
    });
  });

  describe("参数传入测试", function () {
    test("传入单个参数", function () {
      const asyncControl = new AsyncControl();
      return asyncControl.push(100, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual([100]);
      });
    });
    test("传入数组参数", function () {
      const asyncControl = new AsyncControl();
      return asyncControl.push([100], timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual([100]);
      });
    });
  });

  describe("小于或等于并发限制数的异步控制", function () {
    test("发起小于并发限制", function () {
      const asyncControl = new AsyncControl(3);
      const params = [200, 100];
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });
    test("发起与并发上限相同数量的异步", function () {
      const params = [100, 900, 200, 300, 150, 500, 400];
      const asyncControl = new AsyncControl(params.length);
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });
  });

  describe("大于并发限制数的异步控制", function () {
    test("发起刚好超出并发限制1个的异步", function () {
      const asyncControl = new AsyncControl(3);
      const params = [100, 300, 500, 400];
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });
    test("发起并发限制2倍数量的异步", function () {
      const asyncControl = new AsyncControl(3);
      const params = [100, 150, 500, 400, 300, 200];
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });
  });

  describe("并发数量控制", function () {
    test("异步数量在并发上限值以上时，并发数量是否得已控制", function () {
      const poolLimit = 3;
      const asyncControl = new AsyncControl(poolLimit, {
        afterInitSingleAsync(runingAsyncPool) {
          expect(runingAsyncPool.length).toBeLessThanOrEqual(poolLimit);
        },
      });
      const params = [100, 150, 500, 400, 300, 200, 550, 350, 250];
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });
  });

  describe.only("正确响应promise的状态", function () {
    // test("全部都是rejected状态", async function () {
    //   const asyncControl = new AsyncControl(3);
    //   const params = [300, 150, 200, 400, 100, 700];
    //   return asyncControl.push(params, timeoutReject).then((res) => {
    //     expect(getExpectedResult(res)).toEqual(params);
    //   });
    // });

    test("全部都是rejected状态，传入的异步函数生成器带有catch函数【catch函数不返回任何值】", async function () {
      const asyncControl = new AsyncControl(3);
      const params = [300, 150];
      return asyncControl.push(params, timeoutRejectWithCatch).then((res) => {
        console.log(res);
        expect(getExpectedResult(res)).toEqual(params);
      });
    });

    // test("全部都是fulfilled状态", async function () {
    //   const asyncControl = new AsyncControl(3);
    //   const params = [300, 150, 200, 400, 100, 700];
    //   return asyncControl.push(params, timeoutResolve).then((res) => {
    //     expect(getExpectedResult(res)).toEqual(params);
    //   });
    // });
  });
});
