#!/bin/bash
baseDIR=$(cd "$(dirname "$0")" || exit; pwd)

if [ -f "${baseDIR}/$1" ]; then
  rm "${baseDIR}/$1"
fi

moduleFile="${baseDIR}/module_file"

cd ${baseDIR}
# 构建zip命令
zipCmd="zip -r -o -X $1 ./ "

# 遍历目录下的文件，如果不在排除列表中则添加到zip命令中
for file in $(ls -a "$baseDIR"); do
  # echo "---${file##*/}---"
  # filename=$(basename "$file")
  # echo "===$filename==="
  if [[ "${file}" == ".." || "${file}" == "." ]]; then
    continue;
  fi
  add="A"
  while read white;do
    if [[ "${white}" == "${file}" ]]; then
    #  echo "===$white *=* $file======";
      add="N";
      break;
    fi
  done < $moduleFile
  
  if [[ "$add" == "A" ]]; then
    if [ -d $file ];then
      zipCmd="${zipCmd} -x '${file}/*'"
    else
      zipCmd="${zipCmd} -x '$file'"
    fi
  fi
done

# 打印最终的zip命令
echo "$zipCmd"

# 执行zip命令
eval "$zipCmd"
