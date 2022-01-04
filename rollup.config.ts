import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

const libraryName = pkg.name;

export default {
  input: `src/${libraryName}.ts`, // 打包入口external: [],
  output: [
    {
      file: pkg.main,
      name: libraryName,
      format: "umd",
      sourcemap: true,
    },
    { file: pkg.module, format: "es", sourcemap: true },
  ],
  plugins: [
    // 打包插件
    typescript(), // 解析TypeScript
    commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    resolve(), // 查找和打包node_modules中的第三方模块
  ],
};
