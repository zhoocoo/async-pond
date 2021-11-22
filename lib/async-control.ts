// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import { IPoolControlers } from './interface'
export class AsyncPoolPro {
  private poolLimit = 3
  private promisePool = [] as unknown as Promise<any>[]
  private poolControlers = [] as IPoolControlers[]
  private promiseAll = ([] as unknown) as null | Promise<any[]>
  private poolIndex = 0
  private whileControl = false

  constructor(poolLimit: number) {
    this.promisePool = [] // 存储所有的异步任务，且当前异步任务均为pending态
    this.poolControlers = [] //异步请求的参数

    this.poolLimit = poolLimit //并发限制数量

    this.promiseAll = null

    this.poolIndex = 0

    this.whileControl = false
  }

  async push(poolParams: any, iteratorFn: Function) {
    const poolControlers = (Array.isArray(poolParams) ? poolParams : [poolParams]).map(i => ({
      iteratorFn,
      param: i
    }))
    this.poolControlers.push(...poolControlers)
    this.asyncPool(this.promisePool.length === 0)
    return this.promiseAll
  }

  generatorPromise(poolControlers = this.poolControlers) {
    const item = poolControlers[this.poolIndex]
    const p = Promise.resolve()
      .then(() => {
        const { iteratorFn, param } = item
        return iteratorFn(param)
      })
      .finally(() => {
        const finishPromiseIndex = this.promisePool.indexOf(p)
        this.promisePool.splice(finishPromiseIndex, 1)
        this.poolControlers.splice(finishPromiseIndex, 1)
        this.poolIndex--
      })
    this.promisePool.push(p) // 保存新的异步任务
    if (this.promisePool.length >= this.poolLimit) {
      return Promise.race(this.promisePool) // 等待较快的任务执行完成
    }
  }

  async asyncPool(isInit: boolean) {
    if (isInit || this.whileControl) {
      this.whileControl = false
      while (this.poolIndex < this.poolControlers.length) {
        const racePromise = this.generatorPromise()
        racePromise && (await racePromise)
        this.poolIndex++
      }
      //while循环结束标识
      this.whileControl = true
    }
    this.promiseAll = Promise.all(this.promisePool)
  }
}
