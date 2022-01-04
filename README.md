## AsyncPond

一个使用 promise 来解决并发异步的方案

```js
// 一个异步池子，池子里的异步数量控制在3个
const asyncPond = new AsyncPond(3);

const params = [1000, 9000, 2000, 3000, 1500, 5000, 4000];
const asyncGenerator = (i) =>
  new Promise((resolve) => setTimeout(resolve, i, i));

asyncPond.push(params, asyncGenerator).then(console.log);
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

### 功能

- [x] 并发的基础控制
- [x] 并发持续发生时，向并发池子中继续添加并发请求
- [x] 每次 push 添加新异步集合时，正确监听回调
- [ ] 重试机制
- [ ] 暂停机制
