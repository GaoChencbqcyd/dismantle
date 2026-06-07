# 拆解 (Dismantle)

> **看清它 · 拆开它 · 解决它**

帮助 25-35 岁职场人把模糊焦虑拆解为可行动作的心理健康工具。

## 核心理念

传统冥想/放松类 App 提供的是「逃避型解法」—— 让你暂时忘记焦虑。
「拆解」提供的是「面对型工具」—— 帮你看清焦虑、拆开焦虑、用行动化解焦虑。

基于三种心理学方法：
- **CBT 认知行为疗法** — 识别和纠正认知扭曲
- **斯多葛控制二分法** — 区分可控与不可控
- **行为激活** — 用微小行动打破焦虑-逃避循环

## 技术栈

- **框架**: React Native (Expo)
- **语言**: TypeScript
- **后端**: Supabase
- **平台**: iOS 优先，后续 Android

## 项目结构

```
dismantle/
├── docs/                    # 产品文档
│   ├── 拆解_PRD_V1.0.docx           # 产品需求文档
│   ├── 拆解_设计与研发评审_V1.0.docx  # 设计与研发评审材料
│   ├── 研发任务清单.md               # Sprint 0-8 任务拆解
│   └── 研发任务_GitHub_Issues.csv    # GitHub Issues 导入文件
├── prototype/               # HTML 可交互原型
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── data.js
└── src/                     # React Native 源码（待创建）
```

## 快速开始

### 🎨 在线原型

> **原型预览地址**：https://webview.e2b.sh1.sandbox.cloudstudio.club/?x-cs-sandbox-id=fec1f62c42514934bc842162a16e64a5&x-cs-sandbox-port=8000
>
> 点击上方链接即可体验完整的可交互原型（手机 App 模拟器，含登录/拆解/罗盘/洞察/我的等功能）。

### 本地运行原型

```bash
# 查看原型
cd prototype && python3 -m http.server 8000
# 浏览器打开 http://localhost:8000

# 初始化 React Native 项目（Sprint 0）
npx create-expo-app@latest dismantle --template blank-typescript
```

## 开发路线图

| Sprint | 主题 | 状态 |
|--------|------|------|
| Sprint 0 | 项目初始化 | ⬜ 待开始 |
| Sprint 1 | 设计系统落地 | ⬜ 待开始 |
| Sprint 2 | 拆解流程-记录与分类 | ⬜ 待开始 |
| Sprint 3 | 拆解流程-重构与行动 | ⬜ 待开始 |
| Sprint 4 | 人生罗盘 | ⬜ 待开始 |
| Sprint 5 | 我的页面+数据导出 | ⬜ 待开始 |
| Sprint 6 | 账户系统+云端同步 | ⬜ 待开始 |
| Sprint 7 | 边界完善+测试 | ⬜ 待开始 |
| Sprint 8 | 上架准备 | ⬜ 待开始 |

详见 [研发任务清单](docs/研发任务清单.md)

## 许可

© 2025 拆解开发团队
