## AsyncPond

一个使用 promise 来解决并发异步的方案，无任何依赖

```js
// 一个异步池子，池子里的异步数量控制在3个
const asyncPond = new AsyncPond(3);

// 请求参数数组
const params = [1000, 9000, 2000, 3000, 1500, 5000, 4000];

// 异步生成器
const asyncGenerator = (i) =>
  new Promise((resolve) => setTimeout(resolve, i, i));

// 往异步池子里push参数和异步生成器
// 可多次push
asyncPond.push(params, asyncGenerator).then(console.log);

// 异步池子里，仅有3个或以下的正在执行的异步任务

// 当所有异步任务完成后，触发push
// 以Promise.allSetteled的格式，返回每一次push进去的异步结果；
// [
//   { status: "fulfilled", value: 1000 },
//   { status: "fulfilled", value: 9000 },
//   { status: "fulfilled", value: 2000 },
//   { status: "fulfilled", value: 3000 },
//   { status: "fulfilled", value: 1500 },
//   { status: "fulfilled", value: 5000 },
//   { status: "fulfilled", value: 4000 },
// ];
```

### Installation

With npm do:

```javascript
npm install async-pond
```
