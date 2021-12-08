/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-02 17:49:28
 * @LastEditTime: 2021-12-08 20:28:55
 * @Description: 测试方法
 */

export const timeoutResolve = (i: number): Promise<number> =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(i);
    }, i)
  );

export const timeoutReject = (i: number): Promise<any> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      console.log(i);
      reject(i);
    }, i)
  ).catch((res) => {
    console.log("outCatch", res);
  });

export const timeoutRandomStatus = (i: number): Promise<number> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() >= 0.5) {
        resolve(i);
      } else {
        reject(i);
      }
    }, i)
  );

type MatchResultStatus = "rejected" | "fulfilled";
export const getAllSameMatchResult = (
  params: number[],
  status: MatchResultStatus
) => {
  return params.map((i) => ({
    status: status,
    [status === "rejected" ? "reason" : "fulfilled"]: i,
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
