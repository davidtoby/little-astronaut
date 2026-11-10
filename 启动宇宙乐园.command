#!/bin/zsh
# 双击后在终端运行；不联网、不安装依赖、不上传文件。
cd -- "${0:A:h}" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  printf '没有找到 Node.js。请先安装 Node.js。\n'
  read '?按回车关闭…'
  exit 1
fi
if [[ ! -f dist/index.html ]]; then
  node build.mjs || { read '?构建失败，按回车关闭…'; exit 1; }
fi
node server.mjs
read '?服务已停止，按回车关闭…'
