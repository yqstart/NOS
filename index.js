#!/usr/bin/env node

const { execSync, exec } = require("child_process");
const { program } = require("commander");
const inquirer = require("inquirer");
const info = require("./package.json");
const registryObj = require("./registries.json");
const fs = require("fs");
const path = require("path");

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
    if (!Object.keys(registryObj).length)
      console.log("registry list is empty! please add registry first");
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
          type: "rawlist",
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
      .catch(() => {});
  });

program
  .command("add")
  .description("add registry")
  .action(() => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "please enter registry name",
          validate(name) {
            if (Object.keys(registryObj).includes(name.trim()))
              return `duplicate name`;
            if (!name.trim()) return `name is required`;
            return true;
          },
        },
        {
          type: "input",
          name: "registry",
          message: "please enter registry url",
          validate(url) {
            if (!url.trim()) return `registry url is required`;
            return true;
          },
        },
      ])
      .then((answer) => {
        registryObj[answer.name] = {
          home: answer.registry.trim(),
          registry: answer.registry.trim(),
        };
        fs.writeFile(
          path.resolve(__dirname, "./registries.json"),
          JSON.stringify(registryObj),
          (err) => {
            if (err) {
              console.log(`add registry failure: ${err}`);
              return;
            }
            console.log("add registry successfully");
          }
        );
      })
      .catch(() => {});
  });

program
  .command("remove")
  .description("remove registry")
  .action(() => {
    if (!Object.keys(registryObj).length)
      console.log("no registry can be removed");

    inquirer
      .prompt([
        {
          type: "list",
          name: "registry",
          message: "please select registry to be removed",
          choices: Object.entries(registryObj).map(
            ([key, value]) =>
              `${key}${new Array(getLength() - key.length).fill("").join(" ")}${
                value.registry
              }`
          ),
        },
      ])
      .then((answer) => {
        const removeKey = answer.registry.split(" ")[0].trim();
        delete registryObj[removeKey];
        fs.writeFile(
          path.resolve(__dirname, "./registries.json"),
          JSON.stringify(registryObj),
          (err) => {
            if (err) {
              console.log(`remove registry failure: ${err}`);
              return;
            }
            console.log("remove registry successfully");
          }
        );
      })
      .catch(() => {});
  });

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
