# nos
## npm yarn pnmp 镜像源管理工具

## 安装
```zsh
npm i yqstart_nos -g
```

## Usage
### Commands
```
ls                          查看所有镜像源
get                         查看当前镜像源
use<registry>               切换镜像源
reset                       重置为官方源
add<name><registry url>     添加自定义镜像源
remove<name>                删除自定义镜像源
```
### Options(默认为npm)
```
-n --npm 
-y --yarn
-p --pnpm
```

## Example

```zsh
$ nos ls
tencent    https://mirrors.cloud.tencent.com/npm/
ali        https://registry.npmmirror.com/
huawei     https://mirrors.huaweicloud.com/repository/npm/
zju_edu    https://mirrors.zju.edu.cn/npm/

$ nos get -n -y -p
npm     https://registry.npmjs.org/
yarn    https://registry.yarnpkg.com/
pnpm    https://registry.npmjs.org/

$ nos use -n -y -p
? please select registry tencent    
https://mirrors.cloud.tencent.com/npm/
yarn registry switch successfully
yarn current registry https://mirrors.cloud.tencent.com/npm/
npm registry switch successfully
npm current registry https://mirrors.cloud.tencent.com/npm/
pnpm registry switch successfully
pnpm current registry https://mirrors.cloud.tencent.com/npm/

$ nos reset -n -y -p
yarn registry reset successfully
yarn current registry https://registry.yarnpkg.com/
npm registry reset successfully
npm current registry https://registry.npmjs.org/
pnpm registry reset successfully
pnpm current registry https://registry.npmjs.org/

$ nos add <name> <regisrty url>

$ nos remove <name>
```
