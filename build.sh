#!/bin/sh
STC_PATH="/Users/welefen/Develop/svn/STC/src"
path=`dirname $0`;
first=${path:0:1};
if [[ $first != '/' ]];then
    path=$(pwd);
fi

if [ -d ${path}"/output" ];then
	rm -rf ${path}"/output";
fi
mkdir ${path}"/output";
if [ ! -f ${path}"/config.php" ];then
	cp $STC_PATH/config/config.php ${path};
fi
#path=$(pwd);
/usr/local/bin/php $STC_PATH/index.php ${path} test $1;
if [ -f ${path}"/stc.error.log" ]; then
    rm -rf ${path}"/stc.error.log";
    #exit 1;
fi
cp src/manifest.json output/src/
cp -r src/bin output/src/;
mv output/src/ output/Fiddler;
