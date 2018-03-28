---
layout: post
title: Qt 中 OpenCV 环境的配置
author: Phree
date: 2018-3-28
---

## OpenCV 简介
OpenCV 是一个开源的计算机视觉库, 实现了很多计算机视觉, 图像处理相关的算法, 如基本的图像操作, 物体检测, 光流等等, 在相关领域有着非常广泛的应用. OpenCV 提供了低层的图像运算功能, 也有高级的算法, 同时提供了 C++, Python, Java 接口.

当前使用 C++ 接口会更加方便一些, 因为 OpenCV 会实现自动管理内存. 主要体现在使用 Mat 数据结构等.

## 环境配置
- 从[官网](https://opencv.org/releases.html) 下载对应的版本.
- Win平台有预编译的版本, 只需要执行 exe 文件将编译的文件解压到对应目录即可. **注意**: 预编译版本似乎只支持 MSVC 编译器,  因此安装 Qt 的时候尽量选择使用 MSVC 编译器(前提是已经安装 VS). 当然如果已经安装了其他编译器, 也可以在 Qt 的 Tools - > Options -> Build & Run 中设置 MSVC(Qt 会自动检测已安装的编译器). 如图所示

![]({% baseurl %}/assets/img/2018-3-28/setup_compiler.jpg)

- 解压以后需要在 .pro 文件中添加 lib 文件和 include 目录. **注意**: 我们这里使用的版本是 OpenCV 3.4, 该版本大对 lib 文件进行了合并, 只有一个 world 文件. 这和网上大多数教程所用的版本不一样. 比如我的 .pro 文件定义是

> .pro 中添加依赖项的方法是 `ITEM += PATH/FILE`, 使用 -L 表示添加目录, -l 表示添加文件. 注意换行需要在结尾添加 \ 符号.

```
# 添加对应的 include 目录
INCLUDEPATH += "C:\Program Files\opencv\build\include" \
"E:\Program Files (x86)\Intel\RSSDK\include" \
"E:\Program Files (x86)\Intel\RSSDK\sample\common\include" \
"C:\Users\Phree\Desktop\c++\record_v0_1\include"
...
# 添加对应的 lib 目录, 前面一大部分是因为不添加的话一直出现 LNK 2019 错误
# 参考了可用的 VS 配置, 把 Microsoft SDK 的文件包含进来才得到解决.
LIBS += -lws2_32 \ # winsock32 lib 文件
-L"C:\Program Files (x86)\Microsoft SDKs\Windows\v7.1A\Lib\x64" \
-lkernel32 \
-luser32 \
-lgdi32 \
-lwinspool \
-lcomdlg32 \
-ladvapi32 \
-lshell32 \
-lole32 \
-loleaut32 \
-luuid \
-lodbc32 \
-lodbccp32 \
-L"C:\Users\Phree\Desktop\c++\record_v0_1\lib" \
-lmyo64

# 对于 OpenCV 和 Realsense SDK, Debug 版本和 Release 版本所需要的链接文件是不一样的.
# 注意到 Debug 版本的结尾是带 _d 的
CONFIG(debug, debug|release): {
LIBS += -L"C:\Program Files\opencv\build\x64\vc14\lib" \
-lopencv_world331d \
-L"E:\Program Files (x86)\Intel\RSSDK\lib\x64" \
-llibpxc_d \
-L"E:\Program Files (x86)\Intel\RSSDK\sample\common\lib\x64\v140" \
-llibpxcutils_d
-llibpxcutilsmd_d
} else:CONFIG(release, debug|release): {
LIBS += -L"C:\Program Files\opencv\build\x64\vc14\lib" \
-lopencv_world331 \
-L"E:\Program Files (x86)\Intel\RSSDK\lib\x64" \
-llibpxc \
-L"E:\Program Files (x86)\Intel\RSSDK\sample\commonlib\x64\v140" \
-llibpxcutils
-llibpxcutilsmd
}
```
- 修改 .pro 文件以后执行 Buld -> qmake, 然后再进行编译.

## 一个简单的测试程序
```
#include<iostream>  
#include <opencv2/core/core.hpp>  
#include <opencv2/highgui/highgui.hpp>  
  
    
using namespace cv;  
      
        
int main()  {  
    Mat img=imread("pic.jpg");  
    namedWindow("pic");  
    imshow("pic",img);  
    // 等待6000 ms后窗口自动关闭  
    waitKey(6000);  
}
```

如果能够正常编译运行, 那恭喜啦, 配置成功了. 如果出现找不到头文件的错误, 则应该是 include path 没有设置好. 如果出现 LNK 2019 错误, 则是 lib 文件没有设置成功.
