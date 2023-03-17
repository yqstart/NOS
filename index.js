#!/usr/bin/env node

const { execSync, exec } = require("child_process");
const { program } = require("commander");
const inquirer = require("inquirer");
const info = require("./package.json");
const registryObj = require("./registries.json");

const getRegistry = (key) => {
  return execSync(`${key} config get registry`, { encoding: "utf-8" }).trim();
};

const getLength = (arg) => {
  let length = 0;
  if (arg) {
    length = 4;
  } else {
    Object.keys(registryObj).forEach((item) => {
      if (item.length > length) length = item.length;
    });
  }
  return length + 5;
};

program.name(info.name).description(info.description).version(info.version);
program
  .option("-n, --npm", "npm registry config")
  .option("-y, --yarn", "yarn registry config")
  .option("-p, --pnpm", "pnpm registry config");
// const options = program.opts();

const getOpt = () => {
  const options = program.opts();
  if (!Object.keys(options).length) return ["npm"];
  return Object.keys(options);
};
// 查看当前源
program
  .command("get")
  .description("get current registry")
  .action(() => {
    console.log(
      getOpt()
        .map((item) => {
          return `${item}${new Array(getLength(true) - item.length)
            .fill("")
            .join(" ")}${getRegistry(item)}`;
        })
        .join("\n")
    );
  });

// 查看源列表
program
  .command("ls")
  .description("registry list")
  .action(() => {
    console.log(
      Object.entries(registryObj)
        .map(([key, value]) => {
          return `${key}${new Array(getLength() - key.length)
            .fill("")
            .join(" ")}${value.registry}`;
        })
        .join("\n")
    );
  });

program
  .command("use")
  .argument("[key]", "", "npm")
  .description("select registry")
  .action(() => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "use",
          message: "please select registry",
          choices: Object.entries(registryObj).map(
            ([key, value]) =>
              `${key}${new Array(getLength() - key.length).fill("").join(" ")}${
                value.registry
              }`
          ),
        },
      ])
      .then((answers) => {
        const arr = answers.use.split(" ");
        const registry = arr[arr.length - 1].trim();
        getOpt().map((item) => {
          exec(`${item} config set registry ${registry}`, null, (err) => {
            if (err) {
              console.log(`${item} registry switch failure: ${err}`);
            } else {
              console.log(
                `${item} registry switch successfully\n${item} current registry ${registry}`
              );
            }
          });
        });
      })
      .catch((error) => {
        console.log(`registry switch failure: ${error}`);
      });
  });

program
  .command("add")
  .description("add registry")
  .action(() => {});

program
  .command("remove")
  .description("remove registry")
  .action(() => {});

program
  .command("reset")
  .description("reset official registry")
  .action(() => {
    getOpt().map((item) => {
      if (item.includes("npm")) {
        exec(
          `${item} config set registry https://registry.npmjs.org/`,
          null,
          (err) => {
            if (err) {
              console.log(`${item} registry reset failure: ${err}`);
            } else {
              console.log(
                `${item} registry reset successfully\n${item} current registry https://registry.npmjs.org/`
              );
            }
          }
        );
      } else {
        exec(
          `${item} config set registry https://registry.yarnpkg.com/`,
          null,
          (err) => {
            if (err) {
              console.log(`${item} registry reset failure: ${err}`);
            } else {
              console.log(
                `${item} registry reset successfully\n${item} current registry https://registry.yarnpkg.com/`
              );
            }
          }
        );
      }
    });
  });

program.parse(process.argv);
