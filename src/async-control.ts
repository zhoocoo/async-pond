// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
interface IPoolControlers {
  iteratorFn: Function;
  param: any;
  flag: symbol;
}

interface IPromiseGroups {
  length: number;
  finishNum: number;
  pendingPromises: [Promise<any>];
}
export default class AsyncPoolPro {
  public poolLimit = 3;
  private promisePool = [] as unknown as Promise<any>[];
  private poolControlers = [] as IPoolControlers[];
  private poolIndex = 0;
  private whileControl = false;
  private promiseGroups = {} as Record<symbol, IPromiseGroups>;

  constructor(poolLimit?: number) {
    this.promisePool = []; // 存储所有的异步任务，且当前异步任务均为pending态
    this.poolControlers = []; //异步请求的参数
    this.poolLimit = poolLimit || 3; //并发限制数量
    this.poolIndex = 0;
    this.whileControl = false;
  }

  async push(poolParams: any, iteratorFn: Function) {
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
      pendingPromises: [new Promise(() => {})],
    };
    this.asyncPool(this.promisePool.length === 0);
    return Promise.all(this.promiseGroups[flag].pendingPromises);
  }

  generatorPromise(poolControlers = this.poolControlers) {
    const { iteratorFn, param, flag } = poolControlers[this.poolIndex];
    const group = this.promiseGroups[flag];
    group.finishNum++;
    const p = Promise.resolve()
      .then(() => {
        return iteratorFn(param);
      })
      .finally(() => {
        const finishPromiseIndex = this.promisePool.indexOf(p);
        this.promisePool.splice(finishPromiseIndex, 1);
        this.poolControlers.splice(finishPromiseIndex, 1);
        this.poolIndex--;
      });
    if (group.length === group.finishNum) {
      group.pendingPromises.shift();
    }
    group.pendingPromises.push(p);
    this.promisePool.push(p); // 保存新的异步任务
    if (this.promisePool.length >= this.poolLimit) {
      return Promise.race(this.promisePool); // 等待较快的任务执行完成
    }
  }

  async asyncPool(isInit: boolean) {
    if (isInit || this.whileControl) {
      this.whileControl = false;
      while (this.poolIndex < this.poolControlers.length) {
        const racePromise = this.generatorPromise();
        racePromise && (await racePromise);
        this.poolIndex++;
      }
      //while循环结束标识
      this.whileControl = true;
    }
  }
}
