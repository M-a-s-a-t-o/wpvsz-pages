# 精灵素材

游戏使用透明 PNG：5 种植物、5 种僵尸和 3 种投射物，每格 96×96。
启动本地服务器后打开 [/sprites/index.html](./index.html)，可切换动作、慢放、暂停、查看冰冻色调和逐帧检查。游戏与图册均读取 `manifest.json`（图集）和 `animations.json`（动作时间表）。

- 植物按发射、后坐、恢复的顺序播放一次。双发词霸两次出手间隔 150ms；坚果实际受到攻击时才进入防御。
- 僵尸步态跟随走过的距离，因此冰冻减速时步频也会自然下降。五种僵尸的行走都取自硅基流动 MiniMax-H3 视频。普通 21 帧、路障 24 帧、铁桶 25 帧、首领 20 帧、巨人 30 帧。五种僵尸的死亡动画仍占 800ms，落地后留出停顿。
- `PROMPTS.json` 和 [原稿目录](../../art/sprite-sources/) 保留历史提示词与原图。首领 v11 和 v14 预览稿均保留。

这轮使用 [Agent Sprite Forge](https://github.com/0x0funky/agent-sprite-forge/tree/25203d03900b46b444bdd72a75768c33d1895ad6) 的已有帧流程（`art_source: existing`）。Forge 按每个角色的固定画布与地面参考线，生成 60 Hz 动作包、WebP 预览和逐帧审片；随后用内置 ImageGen 制作角色参考姿势，再用硅基流动 MiniMax-H3 生成步态。首领的循环由 Forge 选出，另外四种通过逐帧审片选段，步幅均用 Forge 根据支撑脚位移估算。巨人的试片背景会变色，使用轮廓分割和边缘去色后再配准。首领走路素材里偏亮的裤腿已调回炭灰色。Forge 的循环接缝指标需要配合逐帧审片判断，不能单独证明步态自然。

- `node scripts/validateSprites.cjs`：检查图集、动作时间表和发射时点。
- 安装可选的 `sharp`，或设置 `SHARP_MODULE` 指向模块后，运行 `node scripts/validateZombieFrames.cjs` 检查僵尸透明边界与残片。运行 `node scripts/packForgeBoss.cjs` 可由两套保留素材重建首领图集。
- 使用 Python 3.10+、Pillow、NumPy 和上述 Forge 版本，运行 `python scripts/reviewSpriteClips.py <Forge 目录> <新输出目录>` 可重建审片和严格检查报告。

- `python scripts/packZombieWalks.py` 用已审核的透明帧重建五种僵尸的新版行走图集，需要 Pillow。
- 可把 Forge `prepare_i2v_input.py` 的产物放到试片目录下的 `prepared/`，再用 `python scripts/generateSiliconFlowVideo.py <试片目录>` 提交一次 5 秒、480p 的图生视频。脚本读取本地 `SILICONFLOW_API_KEY`，有请求回执时恢复轮询。
