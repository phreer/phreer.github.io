---
layout: post
title:  An Asymmetric Distance Model for Cross-View Feature Mapping in Person Reidentification 论文笔记
author: Phree
tags: [论文笔记, Person Re-Identification]
date: 2018-4-20
tags: [Person Re-Identification, 论文笔记]
---
这篇论文是郑伟诗老师 16 年发表的, 对多视角情景的度量学习进行了探索. 基本思路是通过对特征进行变换到一个共享空间 (Share Space), 来拉大类间距离, 缩小类内距离来提高模型性能.

本文假设同一个人在不同的视角下一定是存在某些相似的东西, 否则也不可能进行分类, 因此一定可以使用某种方法将原始特征映射到一个新的特征空间, 在新的特征空间中, 相同的人特征相似. 论文中使用的是线性变换, 同时也提出了核函数版本. 

所谓的非对称是指相对于对称度量尺度而言的, 对称模型具有如下形式的距离函数

$$
d(\boldsymbol{x}_i, \boldsymbol{x}_j)=\sqrt{(\boldsymbol{x}_i-\boldsymbol{x}_j)^T \boldsymbol{M} (\boldsymbol{x}_i-\boldsymbol{x}_j)} \\
=\|\boldsymbol{U}^T\boldsymbol{x}_i-\boldsymbol{U}^T\boldsymbol{x}_j\|_2
$$

这里 \\( \boldsymbol{x}_i \\) 是指第 \\(i\\) 个人的特征, \\(\boldsymbol{M}=\boldsymbol{UU}^T \\)为半正定变换矩阵 (保证距离函数大于 \((0\\). 而非对称模型距离函数如下

$$
d(\boldsymbol{x}_i^p, \boldsymbol{x}_j^q)=\|\boldsymbol{U}^{pT}\boldsymbol{x}_i^p-\boldsymbol{U}^{qT} \boldsymbol{x}_j^q\|_2
$$

\\(p, q\\) 为摄像头编号. 可以看到差别在于对称模型中对所有人的所有摄像头下的特征采取了相同形式的变换, 而非对称学习模型针对每一个不同的摄像头使用了不同的变换. 这样能够解决不同的摄像头自身存在的数据偏移的问题. 下图很清晰的描述了这一概念

<div class="fig figcenter fighighlight">
    <img src="{{ site.baseurl }}/assets/img/2018-4-20/cross-view/asymmetric_model.jpg" width="80%">
    <div class="figcaption">由于不同摄像头的光照, 背景, 视角等条件的不同, 数据分布存在很大的差异 (偏置), 而通过非对称映射, 可以对修正这种差异.
    </div>
</div>

为了学习得到特定的子空间映射函数, 文章提出了算法 CVDCA. 文章使用类间特征距离和类内距离的商

$$
Q=\frac{\sum_{i,j \in \boldsymbol C^{a,b}_-} \| \boldsymbol {y}_i^a - \boldsymbol {y}_j^b \|^2} {\sum_{i,j \in \boldsymbol C^{a,b}_+} \| \boldsymbol {y}_i^a - \boldsymbol {y}_j^b \|^2}
$$

来度量特征的好坏, \\(\boldsymbol{C}_-, \boldsymbol{C} _+\\) 分别为对应视角下的负样本集和正样本集. \\(Q\\) 越大则特征的效果越好.

## 模型
根据上面的论述, 论文提出了 CVDCA 模型.

$$
\min_{\boldsymbol{U}^1, \boldsymbol{U}^2, \ldots, \boldsymbol{U}^N} \sum_{p=1} ^{N-1} \sum_{q=p+1} ^{N} \sum_{i=1} ^{n^p} \sum_{j=1} ^{n^q} \boldsymbol W_{ij}^{p,q} \|\boldsymbol{U}^{pT} \boldsymbol{x}_i^{p} - \boldsymbol{U}^{qT} \boldsymbol{x}_i^{q} \|_2^2 \\ + \sum_{p=1} ^{N} \sum_{i=1} ^{n^p} \sum_{j=1} ^{n^p} \boldsymbol W_{ij}^{p,p} \|\boldsymbol{U}^{pT} \boldsymbol{x}_i^{p} - \boldsymbol{U}^{pT} \boldsymbol{x}_i^{p} \|_2^2 \\ \text{s.t. }\boldsymbol{U}^{kT}\boldsymbol{M}\boldsymbol{U}^k=\boldsymbol{I}, k=1,2,\ldots, N
$$

\\( \boldsymbol{W} _{ij} ^{p,q} \\)为权重项, 决定各个距离产生的作用. 文中当 \\(i,j \\) 为同一类 (同一个人) 时为正值, 为不同类时为负值. 因此从直观上看, 优化上式即可以保证类间距离最大而类内距离最小. 限制项是为了避免出现平凡解, 即全 0 的情况.

事实上论文中还提出了对应的核函数版本, 解决可能由线性变换带来的局限性, 将数据特征经过一个非线性变换到一个新的空间后能将一个线性不可分的分布变成一个线性可分的. 这里不详细讨论.

## 正则化项
事实上不同的摄像头之间是存在某种关联的, 即不同的 \\(U\\) 之间虽然存在差别, 但差别不应该太大, 这样才能保持它们的自然属性. 为此在目标函数中加入一个正则化项

$$
d_\mathcal{F}=\mathcal{F}(\boldsymbol{U}^p)-\mathcal{F}(\boldsymbol{U}^q)-\nabla \mathcal{F}(\boldsymbol{U}^q)^T(\boldsymbol{U}^p-\boldsymbol{U}^q)
$$

这是所谓的 Bregman discrepancy. 事实上欧氏距离是这种距离的一个特例. 本文中实际使用的是欧氏距离, 并改写成迹运算的形式.

$$
\sum_{p=1}^{N-1} \sum_{q=p+1}^{N} \| \boldsymbol{U}^p - \boldsymbol{U}^q \|^2_F=(N-1) \text{tr}(\sum_{k=1}^{N}\boldsymbol{U}^{kT} \boldsymbol{U}^{k}-2 \sum_{p=1}^{N-1} \sum_{q=p+1}^{N} \boldsymbol{U}^{pT} \boldsymbol{U}^q)
$$

## 相似论文
最近读的几篇郑老师的论文比较类似, 都是关于 view-specific distance metric learning. 感觉这个思路还是非常不错的.

另一篇非常相似的论文是 Cross-view Asymmetric Metric Learning for Unsupervised Person Re-identification. 所不同的是这篇论文采用的是非监督学习的方法, Person Re-ID 的一个主要挑战就是标记数据量少, 这篇论文使用非监督学习方法来克服这一问题, 通过 K-Means 聚类的方法来学习矩阵 \\(M\\), 并迭代以下过程来进行聚类和优化目标函数, 1) 固定矩阵 \\(\boldsymbol{U} \\) 来进行聚类, 2) 根据聚类的结果优化目标函数, 更新 \\(\boldsymbol{U} \\). 因为是无监督学习, 所以目标函数变成了

$$
\min_{\boldsymbol{U}^1, \boldsymbol{U}^2,\ldots,\boldsymbol{U}^V} \mathcal{F}_{intra} = \sum_{k=1}^K \sum_{i \in C_k} \|\boldsymbol{U}^{pT}\boldsymbol{x}_i^p-\boldsymbol{c}_k\|^2 \\
\text{s.t.} \quad \boldsymbol{U}^{pT} \mathbf{\Sigma}^p\boldsymbol{U}^p=\boldsymbol{I} \quad (p=1,2,\ldots, V)\\
\mathbf{\Sigma}^p=\boldsymbol{X}^p\boldsymbol{X}^{pT}/N_p+\alpha\boldsymbol{I}
$$

即希望投影以后尽量靠近聚类的中心.

另外这篇论文并没有提出核函数的版本.

## 参考文献
- [An asymmetric distance model for cross-view feature mapping in person reidentification](https://ieeexplore.ieee.org/document/7373616/)
- [Cross-View Asymmetric Metric Learning for Unsupervised Person Re-Identification](https://arxiv.org/pdf/1708.08062.pdf)
