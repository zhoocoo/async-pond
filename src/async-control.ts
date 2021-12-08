// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
interface IPoolControlers {
  iteratorFn: Function;
  param: any;
  flag: symbol;
}

interface IOptions {
  isReTry?: boolean;
  retryNum?: number;
  afterInitSingleAsync?: (runingAsyncPool: Promise<any>[]) => any;
}

interface IPromiseGroups {
  length: number;
  finishNum: number;
  resolve?: Function;
  pendingPromises: Promise<any>[];
}
import { isObject, to } from "./lib";
export default class AsyncPoolPro {
  public poolLimit = 3;
  private promisePool = [] as Promise<any>[];
  private poolControlers = [] as IPoolControlers[];
  private poolIndex = 0;
  private whileControl = false;
  private promiseGroups = {} as Record<symbol, IPromiseGroups>;
  private options = {
    isReTry: false,
    retryNum: 3,
  } as IOptions;

  constructor(poolLimit?: number, options?: IOptions) {
    this.promisePool = []; // 存储所有的异步任务，且当前异步任务均为pending态
    this.poolControlers = []; //异步请求的参数
    this.poolLimit = poolLimit || 3; //并发限制数量
    this.poolIndex = 0;
    this.whileControl = false;
    if (isObject(options)) {
      Object.assign(this.options, options);
    }
  }

  push(poolParams: any, iteratorFn: Function): Promise<any[]> {
    const flag = Symbol();
    const poolControlers = (
      Array.isArray(poolParams) ? poolParams : [poolParams]
    ).map((i) => ({
      iteratorFn,
      param: i,
      flag,
    }));
    this.poolControlers.push(...poolControlers);
    this.promiseGroups[flag] = {
      length: poolControlers.length,
      finishNum: 0,
      pendingPromises: [],
    };
    this.asyncPool(this.promisePool.length === 0);
    return new Promise((resolve) => {
      this.promiseGroups[flag].resolve = resolve;
    });
  }

  /**
   * 滞后生成promise异步
   */
  generatorPromise(poolControlers = this.poolControlers) {
    const { iteratorFn, param, flag } = poolControlers[this.poolIndex];
    const group = this.promiseGroups[flag];
    const p = Promise.resolve()
      .then(() => {
        return iteratorFn(param);
      })
      .then(
        (res) => {
          console.log("inner then", res);
        },
        (err) => {
          console.log("fn inner err", err);
        }
      )
      .catch((err) => {
        console.log("innner error", err);
        return Promise.reject(err);
      })
      .finally(() => {
        console.log("finally");
        const finishPromiseIndex = this.promisePool.indexOf(p);
        this.promisePool.splice(finishPromiseIndex, 1);
        this.poolControlers.splice(finishPromiseIndex, 1);
        this.poolIndex--;
        group.finishNum++;
        if (group.length === group.finishNum) {
          // 当前组都结束pending后，执行group
          group.resolve &&
            group.resolve(Promise.allSettled(group.pendingPromises));
        }
      });

    group.pendingPromises.push(p);
    this.promisePool.push(p); // 保存新的异步任务
    this.options.afterInitSingleAsync &&
      this.options.afterInitSingleAsync(this.promisePool);
    if (this.promisePool.length >= this.poolLimit) {
      return Promise.race(this.promisePool); // 等待较快的任务执行完成
    }
  }

  async asyncPool(isInit: boolean) {
    if (isInit || this.whileControl) {
      this.whileControl = false;
      const { flag } = this.poolControlers[this.poolIndex];
      const group = this.promiseGroups[flag];
      while (this.poolIndex < this.poolControlers.length) {
        const racePromise = this.generatorPromise();
        // if (racePromise) {
        //   const [err, res] = await to(racePromise);
        // }
        this.poolIndex++;
      }
      //while循环结束标识
      this.whileControl = true;
    }
  }
}
