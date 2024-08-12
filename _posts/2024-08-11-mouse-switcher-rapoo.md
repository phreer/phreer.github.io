---
layout: post
title: Linux 上雷柏 MT760 鼠标 2.4 G 接收器切换
author: Weifeng Liu
date: 2024-08-11
tags: [Linux, HID, USB]
---

距离上一次写公开发表的博客已经过去六年时间了，那时候还在准备读研的事情呢，现在已经在 Intel 工作两年了。

在读研期间把主力系统从黑苹果迁移到 Windows 后，又在工作之后切换到了 Linux，目前 Linux 应付日常生活大部分场景已经比较舒服了，而工作上则是完全基于 Linux。使用 Linux 是需要成为一种习惯，一种生活方式的，必须不断去学习这个系统从 kernel 到 user space 的东西，否则就会被它所抛弃。这是因为本质上 Linux 还是为开发者设计的。

扯远了，写这篇文章是因为最近买了一个雷柏鼠标，型号是 MT760，看样子有点像是高贵的罗技鼠标平替。这个鼠标支持蓝牙、2.4G 和有线连接三种模式，同时也赠送了两个 2.4G USB 接收器。厂家的意图是让让用户把这两个 USB 接收器连接到两台电脑上并在这两台电脑上安装雷柏提供的鼠标管理软件，从而用户可以通过将鼠标移动到屏幕边缘来进行切换。雷柏提供的软件的作用之一是在检测到鼠标到达屏幕边缘后发送命令给鼠标进行信道切换。可惜的是雷柏作为一个小（？）厂商，并没有考虑到 Linux 用户的使用体验，因为我没有找到该软件的 Linux 版本。这意味着在 Linux 系统上我就没有办法切换鼠标连接的设备了。

然而我并不甘心就此认命牺牲自己的使用体验。考虑到鼠标（接收器）是一个 USB 设备，理论上我们只要截获管理软件进行信道切换的时候发送的命令并在 Linux 系统上模拟这个操作就可以实现同样的效果了。首先使用 Wireshark + USBPCap 记录下切换过程的 USB 数据包：

![Capture of USB packet]({{ site.baseurl }}/assets/img/2024-08-11/935.png)

首先发现有很多 URB_INTERRUPT out 类型的数据，显然这是鼠标移动相关的数据。往下看到一些 URB_CONTROL out 和 URB_CONTROL 类型的数据，不出意外这些应该就是切换所需的指令。下一步就是尝试看看怎样 replay 这些命令。

搜索发现了 [JohnDMcMaster/usbrply: Replay USB messages from Wireshark (.cap) files](https://github.com/JohnDMcMaster/usbrply) 这个 repo 完美满足我的想法：将 Wireshark 捕获的数据（.pcap）直接转换为 USB 操作脚本。然而实际情况并没有这么顺利，repo 提供的程序对 .pcap 的解析似乎存在兼容性问题，host 发送的数据并没有被正确解析出来。手动分析数据包后可以知道实际上发送的数据是上图最后 32 字节，填上即可，let go！不出意外得报错了。

```text
(base) PS C:\Users\phree> python .\replay.py
Scanning for devices...


Found device
Bus 001 Device 007: ID 24ae:1870
Traceback (most recent call last):
  File "C:\Users\phree\replay.py", line 131, in <module>
    replay(dev)
  File "C:\Users\phree\replay.py", line 46, in replay
    controlWrite(0x21, 0x09, 0x02BA, 0x0001, b"\034\000p\022\352\346\n\335\377\377\000\000\000\000\033\000\000\001\000\t\000\000\002(\000\000\000\000!\t\272\002\001\000 \000\272\245\256\000\0007\002\002\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000")
  File "C:\Users\phree\replay.py", line 31, in controlWrite
    dev.controlWrite(bRequestType, bRequest, wValue, wIndex, data,
  File "C:\Users\phree\miniconda3\Lib\site-packages\usb1\__init__.py", line 1330, in controlWrite
    return self._controlTransfer(request_type, request, value, index, data,
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\phree\miniconda3\Lib\site-packages\usb1\__init__.py", line 1307, in _controlTransfer
    mayRaiseUSBError(result)
  File "C:\Users\phree\miniconda3\Lib\site-packages\usb1\__init__.py", line 127, in mayRaiseUSBError
    __raiseUSBError(value)
  File "C:\Users\phree\miniconda3\Lib\site-packages\usb1\__init__.py", line 119, in raiseUSBError
    raise __STATUS_TO_EXCEPTION_DICT.get(value, __USBError)(value)
usb1.USBErrorIO: LIBUSB_ERROR_IO [-1]
```

直觉表明错误是操作的 USB 设备已经有驱动占用了导致的，所以得先把驱动卸载。Windows 不是咱擅长的领域，转战 Linux 上试试看！先把 unbind 驱动，直接先用 sudo 执行看看：

```bash
cd /sys/bus/usb/drivers/usbhid/
echo 1-1:1.2 | sudo tee ./unbind
echo 1-1:1.1 | sudo tee ./unbind
echo 1-1:1.0 | sudo tee ./unbind
sudo python3 ./replay.py
```

脚本里先尝试发送了第一个数据包。成功执行！鼠标顺利连接到了另一台设备！非常幸运切换命令非常简单，第一个数据包就是我们需要的！

usbrply 生成的脚本正常工作的前提是操作的设备没有 bind 到驱动，显然每次操作之前先进行 unbind 实在算不上是一个优雅的行为，得看看是否有办法在有驱动的情况下进行操作，毕竟人家雷柏的软件也没有卸载驱动吧。对于一个 USB HID 设备，允许写入一些厂商自定义的数据应当是一个常见的需求，所以不妨就从 HID 协议上入手。经过一番搜索调查发现（感谢 ChatGPT 和文章 [1]），实际上 Wireshark 捕获的数据里 URB_CONTROL out 发送的是一条 HID output report），我们只要借助 usbhid 驱动的支持进行发送一个 output report 就可以了，这可以用 `hidapitester` [2] 程序来完成：

```bash
DATA="0xba,0xa5,0xae,0x00,0x00,0x00,0x00,$CHANNEL,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00"
./hidapitester --vidpid $VIDPID --usage 1 \
    --open -l 32 --send-output $DATA
```

成功！经过测试发现数据的第 8 个字节就是所要切换至的信道的 id，其他部分保持不变即可。

接下来就是要试试在 Windows 上是否也可以用这个命令来切换，毕竟谁愿意用雷柏提供的那个半身不遂的软件呢。很可惜直接在 Windows 上运行上面的命令是不行的，

```text
(base) PS C:\Users\phree> .\Downloads\hidapitester-windows-x86_64\hidapitester.exe --vidpid 24ae/1870  --usage 1 --open --length 32 --send-output 0xba,0xa5,0xae,0x00,0x00,0x37,0x02,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
Opening device, vid/pid:0x24AE/0x1870, usagePage/usage: 0/1
Device opened
Writing output report of 32-bytes...wrote -1 bytes:
 BA A5 AE 00 00 37 02 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
Closing device
```

写失败了！为什么同样的命令在不同的系统上会有不同的结果呢？搜索网站和询问 ChatGPT 得知可能是 output report 与 USB 的 report descriptor 不一致导致的。使用 `hidapitester` 提供的 `--get-report-descriptor` 参数发现 Windows 和 Linux 上结果不一致，这不免让人怀疑是两个系统 USB HID 驱动实现上的差异导致的。但不管怎么说，雷柏的软件能写成功，凭什么我的命令不行，大概率是发送 output report 时使用的 usage 不正确导致的。使用 `hidapitester` 的 `--list-usage` 或 `--list-detail` 可以看到设备支持的所有 usage page + usage 组合，把它们全部都遍历一遍，成功发现 `--usagePage 0xff00 --usage 0x0e` 可以在两个系统上都正确工作。

暴力美学！

事实上事后了解发现 `0xff00 - 0xffff` 是属于厂商定义的区间，非常合理。但是为何在 Linux 上几乎任意指定 usage page 和 usage 都可以发送成功呢？我个人猜测是因为 Linux usbhid 驱动对这两个参数的检验比较宽松，即使发送的数据和 report descriptor 不匹配也无妨。当然这仅仅是个猜测，之后有机会的话再进一步了解 usbhid 的实现吧，如果有什么不对请指出。

最后为了让 Linux 普通用户也有权限操作 hid 设备（参考 [3]），在 `/usr/lib/udev/rules.d` 创建一条规则文件 `42-rapoo.rules`，填入如下内容

```conf
# This rule to allow users (non-root) to have raw access to Rapoo MT760

ACTION != "add", GOTO="endrule"
SUBSYSTEM != "hidraw", GOTO="endrule"

# Lenovo nano receiver
ATTRS{idVendor}=="24ae", ATTRS{idProduct}=="1870", GOTO="applyrule"

GOTO="endrule"

LABEL="applyrule"

# Allow any seated user to access the receiver.
# uaccess: modern ACL-enabled udev
# udev-acl: for Ubuntu 12.10 and older
TAG+="uaccess", TAG+="udev-acl"

# Grant members of the "plugdev" group access to receiver (useful for SSH users)
#MODE="0660", GROUP="plugdev"

LABEL="endrule"
# vim: ft=udevrules
```

大功告成。

## References

- [1] [Who-T: Understanding HID report descriptors](https://who-t.blogspot.com/2018/12/understanding-hid-report-descriptors.html)
- [2] [todbot/hidapitester: Simple command-line program to test HIDAPI](https://github.com/todbot/hidapitester/)
- [3] [marcelhoffs/input-switcher: Switch inputs with hidapitester (Windows & Linux)](https://github.com/marcelhoffs/input-switcher/tree/master)
