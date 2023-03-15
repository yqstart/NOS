#!/usr/bin/env node

const { execSync, exec } = require("child_process");
const { program } = require("commander");
const inquirer = require("inquirer");
const info = require("./package.json");
const registryObj = require("./registries.json");

const getOrigin = (key) => {
  return execSync(`${key} config get registry`, { encoding: "utf-8" }).trim();
};

const getLength = () => {
  let length = 0;
  Object.keys(registryObj).forEach((item) => {
    if (item.length > length) length = item.length;
  });
  return length + 8;
};

program.name(info.name).description(info.description).version(info.version);
// program.option("-g, --global", "global config");
// const options = program.opts();

// 查看当前源
program
  .command("get")
  .argument("[key]", "", "npm")
  .description("查看当前镜像, 参数默认为npm, 可选yarn pnpm")
  .action((args) => {
    console.log(getOrigin(args));
  });

// 查看源列表
program
  .command("ls")
  .argument("[key]", "", "npm")
  .description("查看镜像列表, 参数默认为npm, 可选yarn pnpm")
  .action((args) => {
    const registry = getOrigin(args); // 当前源
    const length = getLength();
    console.log(
      Object.entries(registryObj)
        .map(([key, value]) => {
          if (value.registry.includes(registry)) {
            return `* ${key}${new Array(length - key.length)
              .fill("")
              .join(" ")}${value.registry}`;
          }
          return `  ${key}${new Array(length - key.length).fill("").join(" ")}${
            value.registry
          }`;
        })
        .join("\n")
    );
  });

program
  .command("use")
  .argument("[key]", "", "npm")
  .description("请选择镜像源, 参数默认为npm, 可选yarn pnpm")
  .action((args) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "use",
          message: "请选择镜像源",
          choices: Object.entries(registryObj).map(
            ([key, value]) => `${key}: ${value.registry}`
          ),
        },
      ])
      .then((answers) => {
        const registry = answers.use.split(":")[1].trim();
        exec(`${args} config set registry ${registry}`, null, (err) => {
          if (err) {
            console.log(`切换失败: ${err}`);
          } else {
            console.log("切换成功");
          }
        });
      })
      .catch((error) => {
        // if (error.isTtyError) {
        //   // Prompt couldn't be rendered in the current environment
        // } else {
        //   // Something else went wrong
        // }
        console.log(`切换失败: ${error}`);
      });
  });

program.parse(process.argv);
