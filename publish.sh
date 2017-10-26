#!/usr/bin/env bash
JENKINS_HOME=http://ci.doctype-html.com
JENKINS_JOB=landing.coolskull.cn
USER=qqq123026689@126.com:2b31725d82d3dbebc6d2661566244390

if [ -z "$1" ]; then
    # 如果执行命令时没有给参数
    echo "用法: bin/publish.sh [<newversion> major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]"
    echo "例: bin/publish.sh major，这个命令将会将高位版本号+1 如: v1.0.0=>v2.0.0"
    echo "例: bin/publish.sh minor，这个命令将会将中位版本号+1 如: v1.0.0=>v1.1.0"
    echo "例: bin/publish.sh patch，这个命令将会将最低位版本号+1 如: v1.0.0=>v1.0.1"
    echo "例: bin/publish.sh v1.0.2，这个命令会将版本号更新为给定值: v1.0.2 注:如果给定的版本号已被使用，则会将线上版本回滚到给定版本。"
    echo "详情见: https://docs.npmjs.com/cli/version"
    exit 1
fi

# 本地是否有未提交的文件
CHANGED=$(git diff-index --name-only HEAD --)
if [ -n "$CHANGED" ]; then
    echo "先 commit 本地修改，才能使用发布脚本。"
    exit 1
fi

if git rev-parse -q --verify "refs/tags/$1" >/dev/null; then
    echo "版本号 $1 已经存在"
    exit 1
fi

echo "正在更新版本号"
VERSION=$(npm version $1)
git push && git push --tags
echo "新的版本号为: $VERSION"

echo "正在触发 jenkins 构建，参数 GIT_TAG=$VERSION"
# 获取 cors 头
CRUMB=$(curl -s "$JENKINS_HOME/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\",//crumb)" \
  --user $USER)
# 触发 jenkins 构建
curl -X POST "$JENKINS_HOME/job/$JENKINS_JOB/buildWithParameters?GIT_TAG=$VERSION" \
  --header $CRUMB \
  --user $USER

echo 'jenkins 触发构建完成'
