---
title: Machinima 2.0：用世界模型保持 AI 影视场景一致
abstract: 如何结合世界模型与 3D 渲染，获得一致的 AI 拍摄地点和更好的 AI 影片。
date: 2026-01-30
---

# “AI 电影预告片”的时代

您可能已经看过许多这样的作品：

@youtube(pGn-1BKo3nY)

过去一年，制作这样的蒙太奇、片段集锦和预告片已经相对容易。它们可以展示概念，也有视觉吸引力，但要用这种视频形式讲好故事仍然很难。

好的故事需要角色生活在真实的空间中，有活动、呼吸和互动的余地。

不能只让所有人匆忙从 A 点走到 B 点，故事就结束了（除非是《权力的游戏》）。角色需要在地点中停留、探索人际关系并克服挑战。他们需要思考、交谈、争斗、争论、消化情绪和成长的地方，有时也需要什么都不做。

故事需要地点。地点是叙事中的核心要素。

# 地点与场面调度

ArtCraft 的成员都是电影创作者，熟悉传统的实拍制作。

过去几年，我们使用 AI 视频时遇到的主要问题之一，就是如何给角色真正可以占据的空间：把他们放上片场、精确控制画面内容，并让地点保持一致。目前大多数 AI 视频仍像一系列互不相连的片段，跳跃很多、连续性很少，因此带有“电影预告片”般的蒙太奇观感。

我们找到了克服这一问题的方法。遵循“展示，而非讲述”，先看看我们的发现，您很快就会理解这种技术：

@youtube(kzvQMdg66Go)

下面解释其原理和做法。

# 移动相机的意义

在“电影语言”中，相机与角色之间的关系可以传达含义。有时我们希望给观众温暖、友好的视角，也可能通过两个角色的构图暗示权力关系。

有时只是需要展示地点，让观众安顿下来，觉得环境有人生活过，并与角色一同沉浸其中。

# 文本是一种粗粒度表示

下面是一条简单的 Nano Banana Pro 提示词（保留英文原文，方便复现）：

> Sam Altman in a room. He sits at a desk, looking towards a desktop computer on the left.
> The room is dimly lit. The glow of a computer terminal, sitting in front of him bathes the room in blue light.
> Behind him, there is a wall with a poster. There’s an AC/DC poster on the left, and a window on the right.
> Through the window, there’s a view of moonlit trees.

结果如下：

![Sam 的生成图像](./images/blog/sam4.png)

地点发生了什么变化？为什么这些图像都不一样？海报、电脑、窗户等物体的位置为何如此不精确？又该如何调整，继续迭代提示词吗？

答案是：文本很难完整表示物理世界。文生图是一种粗粒度表达，无法精确传达物理属性和空间关系。您可以尝试，但精度总有限，很难完全符合脑中的构想。

# 图像并不完整

在图生图流程中，移动相机有多种方式。您可以使用 ControlNet、LoRA，或者直接请求擅长指令编辑的模型：

> Rotate the camera behind Sam Altman to show him from behind. Show the desk, computer screen,
> and wall behind the desk. Show the door to the room.

![从背后观察 Sam](./images/blog/sam4.2.png)

尽管光照和场景元素保持了一定一致性，最终还是遇到了与文生图相似的问题。用文字反复编辑很慢、很繁琐，而且依然不精确。

为什么桌子挡住了门？那张海报又变成了什么？

# 用 3D 解决问题

3D 是保持一致性的有力工具。您可以在“3D 片场”中精确放置角色和道具，然后将“相机”移动到任意角度，在整个过程中保持一致。

![3D 预演场景](./images/blog/sam_previz.png)

选择 GPT Image 1.5 或 Nano Banana Pro 等理解能力强的模型，将预演画面转换为写实渲染，也可以选择动漫、科幻等其他风格：

> Suspense movie - live action - night time. Make a photorealistic picture of Sam Altman sitting at a fancy office desk.
> Use the previz scene as the layout and posing of the shot. The camera and pose of Sam should match this shot.
> Nighttime shot, moonlit glow.

![AI 渲染结果](./images/blog/sam_gpt_image_1.png)

如有需要，还可附加角色设计、服装等参考图像。

经过 Nano Banana Pro 调整灯光和放大，并再次提供预演图以恢复缺失的桌垫后，得到：

> Make this look more photorealistic. Suspenseful night in the office

![进一步调整后的图像](./images/blog/sam_nbp2.png)

这是一张适合交给视频模型开始拍摄的构图。作者也提到，自己并不是 Roger Deakins，取景仍可调整；这里特意同时展示桌下与书柜细节，文章也是在深夜写成。

# 3D 素材拼装

您可以使用网上免费或低价的 3D 素材套件拼装场景。Synty、CGTrader 等数百个站点提供地点、物体、角色等素材。它们可以精确表达调度与布局，更重要的是能够重复用于其他镜头和相机角度。角色应当能从多个角度观察，道具也应在整个场景中保持一致。

> Action movie - live action - day. Turn this previz scene into a photorealistic desert island. Keep the tree, boxes, and treasure chest in place.

![海岛预演](./images/blog/island_previz.png)

再使用 NBP 放大到 4K，并在第二轮修改云层后：

![海岛渲染](./images/blog/island_nbp.png)

只要起点具有足够结构，图像编辑模型也能相当可靠地按要求调整构图。

# 灰盒搭建

拼装素材有时较慢，需要先寻找并整理合适资产。想更快开始时，可以使用 3D 基础形状搭建灰盒场景：

![遗迹灰盒场景](./images/blog/ruins_previz.png)

> Historical epic - live action - sunset. Use this previz scene for the composition.
> An ancient greek temple with ruined concrete and marble columns. The pink and orange sunset bathes the concrete and marble.
> In the distance, there are rolling green hills and valleys. Bright pink sky.

![遗迹渲染](./images/blog/ruins_nbp.png)

您可以将 3D 素材与灰盒结合，放置已有道具或角色，也可以只为电视等单个元素搭建灰盒。

# 广告牌平面与背景绘景

需要在角色和前景后方加入戏剧性背景时，可使用好莱坞传统的背景板技法，例如《星球大战》中的背景绘景。在游戏术语中，这相当于使用平面或面向相机的纹理。

它快速简单，但会限制相机旋转，适合营造纵深和背景：

![山景背景板预演](./images/blog/snow_previz.png)

> Sports footage - live action - day. Woman is hiking in the mountains. She is dressed in sporty warm winter wear.
> She’s standing at the peak, with a mountain forest behind her. Use this previz image to upscale the photo into a
> fully lifelike and photorealistic cinematic image.

![山景渲染](./images/blog/snow_nbp.png)

# 为道具生成对象

您可以使用 Hunyuan 3D 等模型将图像转换为 3D 道具。对于需要精确姿势与观察角度的复杂对象，或需要反复使用并保持一致的素材，这尤其有用。

先快速生成一张 FJ Cruiser SUV 照片：

![车辆生成图像](./images/blog/fj_gen.png)

将它转换为 3D 对象，并在场景中创建多个实例：

![车辆预演场景](./images/blog/fj_previz.png)

然后编写提示词，进行 4K 放大并修正细节：

> An artistic collage of fj cruiser SUVs floating in a pixelated desert.
> Match their pose and orientations exactly, including the ones that are flipped and rotated.
> Make the low poly fj cruisers look photorealistic and high resolution.

![车辆最终图像](./images/blog/fj_nbp.png)

# 世界模型简化流程

现代 3D 合成流程中的重要工具是图像转高斯泼溅模型，例如 World Labs 的 Marble 和 Apple 的 Sharp。

您可以快速在 MidJourney 中生成精致场景，在 Nano Banana 中编辑，再转换为可自由浏览的 3D 场景。这为角色提供活动空间，为相机提供移动位置，也让地点更充分地参与叙事。

@loop_autoplay(https://pub-f7441936e5804042a1ea2bdc92e4dc71.r2.dev/Fantasy_Gif_One.mp4)
@loop_autoplay(https://pub-f7441936e5804042a1ea2bdc92e4dc71.r2.dev/Beach_Gif_One.mp4)
@loop_autoplay(https://pub-f7441936e5804042a1ea2bdc92e4dc71.r2.dev/SciFi_Gif_One.mp4)

我们终于拥有了可以轻松搭建和迭代的场景。

# 组合不同技术

您可以使用 MidJourney 快速生成细节丰富、构图精致的场景，也可以先画草图或搭建灰盒，反复调整后再转换为世界。

这更像是协调使用多种视觉工具进行“创作”，而不仅是“写提示词”。

需要什么，就生成它、转换为 3D、编辑和调整，再放入其他作品中，如此反复。这个过程像艺术家塑造黏土一样直观，只是速度逐渐接近思考本身。

创作仍然由明确意图驱动。想看到什么，就有相应工具将它实现，接近真正的所见即所得。我们在用图像作画，成为主导创作的作者。

# Machinima 2.0

您还记得 Machinima（游戏引擎电影）吗？这是一种在 21 世纪初流行的小众独立电影形式。创作者操控游戏角色，精心控制相机、动作和画面细节来讲述故事，再通过配音赋予叙事生命。

知名系列包括 Rooster Teeth Productions 使用《Halo》拍摄的《Red vs. Blue》，以及使用《The Sims》的《The Strangerhood》和使用 Source Filmmaker 的《Skibidi Toilet》。

作者曾制作过 Machinima，因此认为图生视频像一种新的 Machinima。两者都涉及角色姿势、关键帧和配音，也都使用其他引擎生成的像素，在更高层面操作这些引擎以创造新作品。

图生图、3D 和世界模型使全新的 Machinima 成为可能：

@youtube(tAAiiKteM-U)

# ArtCraft：免费开放的 3D 影视创作

ArtCraft 是一款创作引擎，完整源码可在 [GitHub](https://github.com/storytold/artcraft) 获取，也可在 [Mac 或 Windows](/download) 上使用。

您可以在应用内通过 Midjourney、Google、Sora、Grok、WorldLabs 等多种模型和服务商生成图像与视频，也可以使用自己的密钥。

原文发布时，团队计划在后续几周加入 FAL、Replicate 与 Google Gemini，并计划支持本地 GPU 和 RunPod。可订阅动态或[加入 Discord](https://discord.gg/artcraft) 获取消息。

如果您是博主、播客或创作者，可使用[媒体资料包中的 CC-BY-SA 内容](/press-kit#top)帮助更多人了解 ArtCraft。

如果您从事创作，欢迎使用 ArtCraft。我们为自己也为您制作了它，欢迎加入社区并告诉我们如何提供帮助。

— Brandon Thomas
