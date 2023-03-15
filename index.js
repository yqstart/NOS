const { execSync } = require("child_process");
const { program } = require("commander");
const info = require("./package.json");

const getOrigin = (key) => {
    return execSync(`${key} config get registry`, { encoding: "utf-8" });
};
program.name(info.name).description(info.description).version(info.version);
program.option("-g, --global", "global config");
program
    .command("ls")
    .argument("[key]", "", "npm")
    .description("查看镜像, 参数默认为npm, 可选yarn pnpm")
    .action((args) => {
        console.log(getOrigin(args));
    });

program.parse(process.argv);
