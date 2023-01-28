## AsyncPond

一个使用 promise 来解决并发异步控制的方案，无任何依赖

### 安装

```bash
npm install async-pond --save
```

### 示例

```js
// 一个异步池子，池子里的异步数量控制在3个
const asyncPond = new AsyncPond(3);

// 请求参数数组
const params = [
  {
    id: 1,
    pending: 1000,
  },
  {
    id: 2,
    pending: 9000,
  },
  {
    id: 3,
    pending: 2000,
  },
  {
    id: 4,
    pending: 3000,
  },
  {
    id: 5,
    pending: 1500,
  },
  {
    id: 6,
    pending: 5000,
  },
  {
    id: 7,
    pending: 4000,
  },
];

// 异步生成器
const asyncGenerator = (param) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`${param.id} is finish`);
      resolve(param.id);
    }, param.pending);
  });
};

// 往异步池子里push参数和异步生成器
const promise = asyncPond.push(params, asyncGenerator);

promise.then((result) => {
  console.log(result);
});
```

`promise`的返回值`result`打印结果：

```bash
- 1 is finish
- 3 is finish
- 5 is finish
- 4 is finish
- 7 is finish
- 6 is finish
- 2 is finish
```

最后打印：

```json
[
  { "status": "fulfilled", "value": 1 },
  { "status": "fulfilled", "value": 2 },
  { "status": "fulfilled", "value": 3 },
  { "status": "fulfilled", "value": 4 },
  { "status": "fulfilled", "value": 5 },
  { "status": "fulfilled", "value": 6 },
  { "status": "fulfilled", "value": 7 },
];
```

## 参数说明

### 构造函数

`new AsyncPond(limit)`返回一个可以控制并发的实例；

limit：当前并发的最高数量，默认为：3

```js
// 最高并发数量为 5
const asyncPond = new AsyncPond(5);
```
### 属性

#### `push`

```js
const asyncPond = new AsyncPond(5);
asyncPond.push(poolParams, iteratorFn);
```

- `iteratorFn`：一个函数，作为异步生成器，返回一个`Promise`推入异步池子中进行控制；
- `poolParams`：一个数组，每一项都将作为`iteratorFn`的参数

`push`返回值为一个`Promise`，其每一项与`poolParams`参数数组一一对应，返回形如以下的值：

```json
[
  { "status": "fulfilled", "value": "this is success result" },
  { "status": "rejected", "reason": "this is failed result" }
]
```

### 并发持续控制

支持在发生并发的同时，不断地往实例池子里进行`push`操作，以加入当前实例的并发控制：

```js
const asyncPond = new AsyncPond(5);
const push1 = asyncPond.push(poolParams1, iteratorFn);
// push1返回poolParams1一一对应的响应值

setTimeout(() => {
  // 在 push1 还在pending进行并发控制时，可继续往池子里注入新的任务
  const push2 = asyncPond.push(poolParams2, iteratorFn);
  //push2返回poolParams2一一对应的响应值
}, 2000);
```
