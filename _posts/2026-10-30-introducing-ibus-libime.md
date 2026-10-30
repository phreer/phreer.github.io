---
layout: post
title: 欢迎使用 ibus-libime
author: Weifeng Liu
date: 2026-10-30
tags: [ime]
---

我的大部分工作环境是在 Fedora 系统上，用默认的 GNOME 桌面环境。GNOME 默认使用 IBus 作为输入法框架，默认的 Pinyin 输入法是 [ibus-libpinyin](https://github.com/libpinyin/ibus-libpinyin)。不过说实话，ibus-libpinyin 的使用体验挺让人抓毛的，总是能给我跳一些奇奇怪怪的组合。

也尝试寻找替代品，例如 IBus 上支持的 [Rime](https://rime.im/) + lunapinyin 方案，还有最近挺火的[水杉输入法](https://github.com/metasequoiaime/msime)，最终发现 fcitx 上默认的 Pinyin 输入法 [fcitx5-chinese-addons](https://github.com/fcitx/fcitx5-chinese-addons) 体验令人惊喜，非常小巧精悍，其使用的输入法引擎是 [libime](https://github.com/fcitx/libime)。

没有找到 IBus 上的 libime 输入法，因此自己动手搞了这个项目：[ibus-libime](https://github.com/phreer/ibus-libime)，目前已经是我的主力输入法，有相关需求的朋友欢迎尝试！目前已经支持的 feature 包括：

- 中英文模式切换；
- GUI 配置界面；
- 模糊音设置。
