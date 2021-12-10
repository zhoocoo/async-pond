/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-02 17:49:28
 * @LastEditTime: 2021-12-10 16:47:17
 * @Description: 测试方法
 */

export const timeoutResolve = (i: number): Promise<any> => {
  const testPromise = new Promise((resolve) =>
    setTimeout(() => {
      resolve(i);
    }, i)
  );
  jest.advanceTimersByTime(i);
  return testPromise;
};

export const timeoutReject = (i: number): Promise<any> => {
  const testPromise = new Promise((resolve, reject) =>
    setTimeout(() => {
      reject(i);
    }, i)
  );
  jest.advanceTimersByTime(i);
  return testPromise;
};

export const timeoutRejectWithCatch = (i: number): Promise<any> => {
  const testPomise = new Promise((resolve, reject) =>
    setTimeout(() => {
      reject(i);
    }, i)
  ).catch((err) => {});
  jest.advanceTimersByTime(i);
  return testPomise;
};

export const timeoutRandomStatus = (i: number): any => {
  const isFulfilled = Math.random() >= 0.5;
  const testPromise = new Promise((resolve, reject) =>
    setTimeout(() => {
      if (isFulfilled) {
        resolve(i);
      } else {
        reject(i);
      }
    }, i)
  );
  jest.advanceTimersByTime(i);
  return testPromise;
};

type MatchResultStatus = "rejected" | "fulfilled";
export const getAllSameMatchResult = (
  params: (number | undefined)[],
  status: MatchResultStatus
) => {
  return params.map((i) => ({
    status: status,
    [status === "rejected" ? "reason" : "value"]: i,
  }));
};

interface TestPoolReuslt {
  status: MatchResultStatus;
  reason?: number;
  value?: number;
}
export const getExpectedResult = (params: TestPoolReuslt[]) => {
  return params.map((i) => {
    if (i.status === "fulfilled") {
      return i.value;
    } else if (i.status === "rejected") {
      return i.reason;
    } else {
      throw new Error("不是预期结果");
    }
  });
};
