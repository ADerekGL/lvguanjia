# OpenClaw 自定义 Skill 创建教程

> 📘 从零开始创建你的第一个 Skill - 可命名、可安装、可执行

---

## 📖 目录

1. [什么是 Skill](#什么是-skill)
2. [Skill 结构](#skill-结构)
3. [创建步骤](#创建步骤)
4. [最佳实践](#最佳实践)
5. [完整示例](#完整示例)
6. [调试与迭代](#调试与迭代)

---

## 🎯 什么是 Skill

**Skill（技能）** 是模块化的独立包，用于扩展 AI 助手的能力，提供：

- ✅ **专业化工作流** - 特定领域的多步骤操作流程
- ✅ **工具集成** - 与特定文件格式或 API 的交互指令
- ✅ **领域专业知识** - 公司特定的知识、架构、业务逻辑
- ✅ **捆绑资源** - 脚本、参考资料、模板等

**简单来说：** Skill 就像是给 AI 的"上岗培训手册"——把通用 AI 变成特定领域的专家。

---

## 📁 Skill 结构

```
skill-name/
├── SKILL.md              # 必需 - 技能主文件
│   ├── YAML frontmatter  # 元数据（name + description）
│   └── Markdown 指令      # 使用指南
├── scripts/              # 可选 - 可执行代码
│   └── example.py
├── references/           # 可选 - 参考文档
│   └── api_docs.md
└── assets/               # 可选 - 资源文件
    └── template.html
```

### 文件说明

| 文件/目录 | 必需 | 用途 |
|-----------|------|------|
| `SKILL.md` | ✅ | 技能主文件，包含元数据和使用指令 |
| `scripts/` | ❌ | 放置 Python/Bash 等可执行脚本 |
| `references/` | ❌ | 放置 API 文档、数据库架构等参考资料 |
| `assets/` | ❌ | 放置模板、图片、字体等资源文件 |

---

## 🚀 创建步骤

### 步骤 1：理解需求

在创建 Skill 前，先明确：
- **触发条件**：用户说什么时会触发这个 Skill？
- **核心功能**：Skill 需要完成什么任务？
- **使用场景**：举 2-3 个具体例子

**示例问题：**
> "用户会说'帮我旋转这个 PDF'，Skill 需要调用 rotate_pdf.py 脚本处理文件"

### 步骤 2：初始化 Skill

使用初始化脚本创建模板：

```bash
# 语法
scripts/init_skill.py <skill-name> --path <输出目录>

# 示例 - 创建 PDF 编辑技能
scripts/init_skill.py pdf-editor --path ~/.openclaw/workspace/skills/
```

初始化后会自动生成：
```
pdf-editor/
├── SKILL.md          # 模板文件
├── scripts/          # 示例脚本目录
├── references/       # 示例参考目录
└── assets/           # 示例资源目录
```

### 步骤 3：编写 SKILL.md

#### 3.1 YAML Frontmatter（必需）

```yaml
---
name: pdf-editor
description: PDF 文件编辑处理技能。使用场景：(1) 旋转/翻转 PDF 页面 (2) 合并/拆分 PDF 文件 (3) 提取 PDF 文本内容 (4) PDF 转图片。当用户提到 PDF 编辑、旋转、合并、拆分、提取时触发此 Skill。
---
```

**要点：**
- `name`：技能名称（小写，用连字符分隔）
- `description`：**这是触发机制的核心**，必须包含：
  - 技能做什么
  - 具体触发条件/场景
  - 使用"当用户...时触发"句式

#### 3.2 正文指令

```markdown
## 核心功能

### 1. 旋转 PDF

当用户需要旋转 PDF 时：
1. 确认旋转角度（90°/180°/270°）
2. 调用 `scripts/rotate_pdf.py` 脚本
3. 返回处理后的文件

### 2. 合并 PDF

当用户需要合并多个 PDF 时：
1. 收集所有需要合并的文件路径
2. 调用 `scripts/merge_pdfs.py` 脚本
3. 返回合并后的文件

## 参考文档

- API 详细说明：见 [references/api_docs.md](references/api_docs.md)
- 常见问题：见 [references/faq.md](references/faq.md)
```

### 步骤 4：添加资源文件

#### 添加脚本（scripts/）

```python
# scripts/rotate_pdf.py
#!/usr/bin/env python3
"""旋转 PDF 文件"""

import sys
from pypdf import PdfReader, PdfWriter

def rotate_pdf(input_path, output_path, angle=90):
    reader = PdfReader(input_path)
    writer = PdfWriter()
    
    for page in reader.pages:
        page.rotate(angle)
        writer.add_page(page)
    
    with open(output_path, 'wb') as f:
        writer.write(f)
    
    print(f"✅ 已旋转 {input_path} -> {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法：rotate_pdf.py <输入文件> <输出文件> [角度]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    angle = int(sys.argv[3]) if len(sys.argv) > 3 else 90
    
    rotate_pdf(input_file, output_file, angle)
```

#### 添加参考文档（references/）

```markdown
# PDF API 参考

## pypdf 库

### 读取 PDF
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```

### 旋转页面
```python
page.rotate(90)  # 顺时针 90 度
```

### 保存 PDF
```python
writer.write("output.pdf")
```
```

### 步骤 5：打包 Skill

```bash
# 语法
scripts/package_skill.py <skill 目录路径>

# 示例
scripts/package_skill.py ~/.openclaw/workspace/skills/pdf-editor/
```

打包后会生成：`pdf-editor.skill`（实际是 zip 格式）

### 步骤 6：安装与测试

```bash
# 安装技能
openclaw skills install pdf-editor.skill

# 验证安装
openclaw skills list

# 测试技能
# 在对话中说："帮我旋转这个 PDF"
```

---

## 💡 最佳实践

### 1. 精简至上

- **描述要简洁**：frontmatter description 控制在 200 字以内
- **只放必要内容**：AI 已知的常识不要写
- **使用参考文件**：详细内容放到 `references/` 按需加载

### 2. 触发条件明确

**❌ 不好的描述：**
```yaml
description: 处理 PDF 文件
```

**✅ 好的描述：**
```yaml
description: PDF 文件编辑处理技能。使用场景：(1) 旋转/翻转 PDF (2) 合并/拆分 PDF (3) 提取文本。当用户提到 PDF 编辑、旋转、合并、拆分、提取时触发。
```

### 3. 渐进式披露

```markdown
## 基础用法

提取文本：
```bash
python scripts/extract_text.py input.pdf
```

## 高级功能

- **表单填写**：见 [references/forms.md](references/forms.md)
- **批量处理**：见 [references/batch.md](references/forms.md)
```

### 4. 脚本要测试

- ✅ 实际运行脚本验证无 bug
- ✅ 确保输出符合预期
- ✅ 处理边界情况（空文件、大文件等）

### 5. 目录命名规范

- 使用小写字母
- 用连字符分隔：`pdf-editor` 不是 `pdf_editor`
- 名称要能反映功能

---

## 📋 完整示例：会议记录 Skill

### 目录结构

```
meeting-notes/
├── SKILL.md
├── scripts/
│   └── transcribe.py
└── references/
    └── template.md
```

### SKILL.md

```yaml
---
name: meeting-notes
description: 会议纪要生成技能。支持语音/文字转会议纪要，自动提取行动项、决策、待办。当用户说"写会议纪要"、"整理会议记录"、"生成 meeting minutes"、"提取行动项"时触发。
---

# 会议纪要技能

## 工作流程

### 1. 接收输入

- 语音文件 → 调用 `scripts/transcribe.py` 转文字
- 文字内容 → 直接处理

### 2. 提取关键信息

按以下结构整理：

| 类型 | 说明 |
|------|------|
| 📋 会议主题 | 会议核心议题 |
| 👥 参会人员 | 列出参与者 |
| 📅 时间地点 | 会议时间、地点/链接 |
| ✅ 决策事项 | 已确定的决定 |
| 📝 行动项 | 待执行任务（含负责人 + 截止日期） |
| ❓ 待讨论 | 遗留问题 |

### 3. 输出格式

参考 [references/template.md](references/template.md)

## 参考模板

详细模板见：[references/template.md](references/template.md)
```

### scripts/transcribe.py

```python
#!/usr/bin/env python3
"""语音转文字"""

import sys
import whisper

def transcribe(audio_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    return result["text"]

if __name__ == "__main__":
    audio_file = sys.argv[1]
    text = transcribe(audio_file)
    print(text)
```

### references/template.md

```markdown
# 会议纪要模板

## 📋 会议信息
- **主题**：[填写]
- **时间**：[填写]
- **参会**：[填写]

## ✅ 决策事项
1. [决策 1]
2. [决策 2]

## 📝 行动项
| 任务 | 负责人 | 截止日期 |
|------|--------|----------|
| [任务] | [人名] | [日期] |

## ❓ 待讨论
- [问题 1]
- [问题 2]
```

---

## 🐛 调试与迭代

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Skill 不触发 | description 不够明确 | 增加具体触发词和场景 |
| AI 执行错误 | 指令不够清晰 | 用步骤化、示例化指令 |
| 脚本报错 | 环境依赖缺失 | 在 SKILL.md 注明依赖 |
| 上下文过长 | 内容太多 | 移到 references/ 按需加载 |

### 迭代流程

1. **实际使用** Skill 处理真实任务
2. **记录问题**：哪里卡住了？哪里出错了？
3. **更新 SKILL.md**：补充遗漏的指令
4. **重新打包**：`package_skill.py`
5. **再次测试**

---

## 🎓 进阶技巧

### 1. 多场景支持

```markdown
## 场景选择

根据用户需求选择处理方式：

- **简单编辑** → 直接调用脚本
- **复杂处理** → 先分析再执行
- **批量操作** → 使用批处理脚本
```

### 2. 条件执行

```markdown
## 条件判断

- 如果文件 > 100MB → 先压缩再处理
- 如果是加密 PDF → 提示用户输入密码
- 如果输出失败 → 检查日志并报告
```

### 3. 错误处理

```markdown
## 错误处理

常见错误及解决方案：

| 错误 | 原因 | 解决 |
|------|------|------|
| 文件不存在 | 路径错误 | 确认文件路径 |
| 格式不支持 | 非 PDF 文件 | 检查文件类型 |
| 权限不足 | 只读文件 | 修改文件权限 |
```

---

## 📚 相关资源

- OpenClaw 官方文档：`~/.openclaw/workspace/docs/`
- 已有 Skills 参考：`~/.openclaw/workspace/skills/`
- ClawHub 技能市场：https://clawhub.com

---

_教程版本：v1.0 | 最后更新：2025_
