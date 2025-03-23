# MD to TXT 转换工具

这是一个使用Deno Fresh框架开发的Markdown转纯文本工具。用户可以在网页上粘贴Markdown内容，一键转换为纯文本格式。

## 功能特点

- ✅ Markdown到纯文本的快速转换
- ✅ 简洁直观的用户界面
- ✅ 转换记录的KV数据库存储
- ✅ 基于Deno Fresh框架，快速轻量

## 本地开发

确保您已安装Deno：

```bash
# 安装Deno
# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex

# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh
```

然后启动开发服务器：

```bash
cd md-to-txt
deno task start
```

开发服务器将在 http://localhost:8000 上启动。

## 部署到Deno Deploy

该项目设计为可以直接部署到Deno Deploy平台。

1. 在GitHub上创建一个仓库并推送代码
2. 在Deno Deploy上创建一个新项目
3. 连接到GitHub仓库
4. 选择`main.ts`作为入口点
5. 点击部署

请注意，在生产环境中应该使用更强的密码并考虑更安全的身份验证方式。

## 技术栈

- [Deno](https://deno.land) - JavaScript/TypeScript运行时
- [Fresh](https://fresh.deno.dev) - Web框架
- [Tailwind CSS](https://tailwindcss.com) - CSS框架
- [Preact](https://preactjs.com) - UI库
- [KV](https://deno.land/x/kv) - 键值数据库
