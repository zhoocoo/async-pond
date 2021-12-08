/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-08 21:13:03
 * @LastEditTime: 2021-12-08 21:15:26
 * @Description:
 */
const a = Promise.reject(3)
  .catch((err) => {})
  .then(
    () => {},
    (err) => {
      console.log("then catch", err);
    }
  )
  .finally(() => {
    console.log(
      a.then((b) => {
        console.log("b", b);
      })
    );
  });
