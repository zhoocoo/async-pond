/*
 * @Author: zhaocongcong
 * @LastEditors: zhaocongcong
 * @Date: 2021-12-02 17:45:00
 * @LastEditTime: 2021-12-02 17:52:18
 * @Description: 基础功能测试
 */

import AsyncControl from "../src/async-control";

var assert = require("assert");
describe("基础发送异步方式", function () {
  describe("单个请求", function () {
    it("should save without error", function (done) {
      var user = new User("Luna");
      user.save(function (err) {
        if (err) done(err);
        else done();
      });
    });
  });
});
