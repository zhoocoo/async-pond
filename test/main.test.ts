import { on } from "events";
import AsyncControl from "../src/async-pond";
import {
  timeoutResolve,
  timeoutRejectWithCatch,
  timeoutRandomStatus,
  getExpectedResult,
  getAllSameMatchResult,
  timeoutRejectWithCatchReturn,
  timeoutReject,
} from "./utils/lib";

describe("基础功能", function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });
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
});

describe("小于或等于并发限制数的异步控制", function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  test("发起小于并发限制", function () {
    const params = [200, 100, 800, 400, 1200, 900, 1500];
    const asyncControl = new AsyncControl(params.length + 1);
    return asyncControl.push(params, timeoutRandomStatus).then((res) => {
      expect(getExpectedResult(res)).toEqual(params);
    });
  });
  test("发起与并发上限相同数量的异步", function () {
    const params = [100, 900, 200, 300, 150, 500, 400];
    const asyncControl = new AsyncControl(params.length);
    return asyncControl.push(params, timeoutRandomStatus).then((res) => {
      console.log(res);
      expect(getExpectedResult(res)).toEqual(params);
    });
  });
});

describe("大于并发限制数的异步控制", function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });
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
  beforeAll(() => {
    jest.useFakeTimers();
  });
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
  test("修改并发上限值", function () {
    const poolLimit = {
      limit: 6,
    };
    const asyncControl = new AsyncControl(poolLimit.limit, {
      afterInitSingleAsync(runingAsyncPool) {
        expect(runingAsyncPool.length).toBeLessThanOrEqual(poolLimit.limit);
      },
    });
    const params = [
      100, 150, 500, 400, 300, 200, 550, 350, 250, 800, 1200, 2000, 3000, 2500,
    ];
    jest.advanceTimersByTime(1000);
    setTimeout(() => {
      poolLimit.limit = 3;
      asyncControl.poolLimit = 3;
    }, 1000);
    return asyncControl.push(params, timeoutRandomStatus).then((res) => {
      expect(getExpectedResult(res)).toEqual(params);
    });
  });
});

describe("正确响应promise的状态", function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  describe("rejected状态测试", function () {
    test("全部都是rejected状态", async function () {
      const asyncControl = new AsyncControl(3);
      const params = [300, 150, 200, 400, 100, 700];
      await expect(asyncControl.push(params, timeoutReject)).resolves.toEqual(
        getAllSameMatchResult(params, "rejected")
      );
      asyncControl.poolLimit = params.length - 1;
      await expect(asyncControl.push(params, timeoutReject)).resolves.toEqual(
        getAllSameMatchResult(params, "rejected")
      );
    });

    test("全部都是rejected状态，传入的异步函数生成器带有catch函数【catch函数不返回任何值】", function () {
      const asyncControl = new AsyncControl(3);
      const params = [300, 150];
      return asyncControl.push(params, timeoutRejectWithCatch).then((res) => {
        expect(res).toEqual(
          getAllSameMatchResult([undefined, undefined], "fulfilled")
        );
      });
    });

    test("全部都是rejected状态，传入的异步函数生成器带有catch函数【catch函数返回参数值】", function () {
      const asyncControl = new AsyncControl(3);
      const params = [300, 150];
      return asyncControl
        .push(params, timeoutRejectWithCatchReturn)
        .then((res) => {
          expect(res).toEqual(getAllSameMatchResult(params, "fulfilled"));
        });
    });
  });

  describe("fulfiled状态以及随机状态", function () {
    test("全部都是fulfilled状态", function () {
      const asyncControl = new AsyncControl(3);
      const params = [300, 150, 200, 400, 100, 700];
      return asyncControl.push(params, timeoutResolve).then((res) => {
        expect(res).toEqual(getAllSameMatchResult(params, "fulfilled"));
      });
    });

    test("随机状态", function () {
      const asyncControl = new AsyncControl(3);
      const params = [300, 150, 200, 400, 100, 700];
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });
  });
});

describe("动态push更多的异步", function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  describe("上一次push结束后再push", function () {
    test("小于异步阙值的push", async function () {
      const asyncControl = new AsyncControl(3);
      const params = [1000, 3000];
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
        const params2 = [1000, 3000, 2000, 500];
        asyncControl.push(params, timeoutRandomStatus).then((res2) => {
          expect(getExpectedResult(res2)).toEqual(params2);
        });
      });
    });

    test("大于异步阙值的push", async function () {
      const asyncControl = new AsyncControl(3);
      const params = [1000, 3000, 4000, 2000, 500, 1200];
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
        const params2 = [1000, 3000, 2000, 500];
        asyncControl.push(params, timeoutRandomStatus).then((res2) => {
          expect(getExpectedResult(res2)).toEqual(params2);
        });
      });
    });
  });

  describe("上一次push还未结束时push", function () {
    test("小于异步阙值的push", async function () {
      const asyncControl = new AsyncControl(3);
      const params = [1000, 5000];
      jest.advanceTimersByTime(1000);
      setTimeout(() => {
        const params2 = [1000, 3000, 2000, 500];
        asyncControl.push(params, timeoutRandomStatus).then((res2) => {
          expect(getExpectedResult(res2)).toEqual(params2);
        });
      }, 1000);
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });

    test("大于异步阙值的push", async function () {
      const asyncControl = new AsyncControl(3);
      const params = [1000, 3000, 5000, 2000, 500, 4200];
      jest.advanceTimersByTime(2000);
      setTimeout(() => {
        const params2 = [1000, 3000, 2000, 500];
        asyncControl.push(params, timeoutRandomStatus).then((res2) => {
          expect(getExpectedResult(res2)).toEqual(params2);
        });
      }, 2000);
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });

    test("多次push", async function () {
      const asyncControl = new AsyncControl(3);
      const params = [1000, 3000, 5000, 2000, 500, 4200];
      jest.advanceTimersByTime(2000);
      setTimeout(() => {
        const params2 = [1000, 3000, 2000, 500];
        asyncControl.push(params, timeoutRandomStatus).then((res2) => {
          expect(getExpectedResult(res2)).toEqual(params2);
        });
        const params3 = [1000, 3000, 2000, 500, 1500];
        asyncControl.push(params, timeoutRandomStatus).then((res3) => {
          expect(getExpectedResult(res3)).toEqual(params3);
        });
      }, 2000);
      return asyncControl.push(params, timeoutRandomStatus).then((res) => {
        expect(getExpectedResult(res)).toEqual(params);
      });
    });
  });
});
