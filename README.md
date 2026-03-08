# EO边缘函数 - AI网关代理使用指南

## 📋 概述

`eoapi.js` 是一个部署在腾讯云 EdgeOne 的边缘函数，提供AI模型API的反向代理服务。通过本工具，您可以方便地搭建自己的API网关，实现对多个主流大模型服务的访问。

## ✨ 功能特性

### 🚀 核心能力
- ✅ **多服务支持**：OpenAI、Claude、Gemini、Groq、Cerebras、智谱AI
- ✅ **完全透传**：100%兼容官方API规范，不修改请求和响应内容
- ✅ **智能路由**：自动识别服务名称并转发到正确的目标API端点
- ✅ **CORS支持**：完整的跨域资源共享配置，支持前端直接调用
- ✅ **超时控制**：可配置的请求超时机制，防止请求长时间挂起（默认60秒）
- ✅ **性能优化**：高效的请求处理和智能头部管理，减少不必要的性能开销
- ✅ **错误处理**：结构化JSON错误响应，包含详细的错误信息、类型和时间戳
- ✅ **请求验证**：严格的URL格式和服务名称验证，确保请求合法性
- ✅ **日志记录**：可选的请求日志功能，支持开关控制，便于监控和调试
- ✅ **边缘加速**：基于EdgeOne全球CDN节点，提供低延迟高可用的服务

---

## 🚀 快速开始

### 1. 部署到EdgeOne 边缘函数

1. 登录 [EdgeOne控制台](https://console.cloud.tencent.com/edgeone/)
2. 创建新的边缘函数项目
3. 上传 `eoapi.js` 文件
4. 配置触发路由（如：`/*`）
5. 保存并发布

### 2. 基本使用

部署完成后，您的API网关地址为：
```
https://your-domain.com
```

调用格式：
```
https://your-domain.com/{service}/{api-path}
```

---

## 📖 使用示例

### OpenAI API
```bash
# 聊天对话
curl https://your-domain.com/openai/v1/chat/completions \
  -H "Authorization: Bearer sk-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# 模型列表
curl https://your-domain.com/openai/v1/models \
  -H "Authorization: Bearer sk-xxx"
```

### Claude API
```bash
# 发送消息
curl https://your-domain.com/claude/v1/messages \
  -H "x-api-key: sk-ant-xxx" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Gemini API
```bash
# 生成内容（URL参数方式）
curl "https://your-domain.com/gemini/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Hello"}]}]
  }'

# 生成内容（Header方式）
curl "https://your-domain.com/gemini/v1beta/models/gemini-pro:generateContent" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Hello"}]}]
  }'
```

### Groq API
```bash
# 快速推理
curl https://your-domain.com/groq/openai/v1/chat/completions \
  -H "Authorization: Bearer gsk_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Cerebras API
```bash
# 超快速推理
curl https://your-domain.com/cerebras/v1/chat/completions \
  -H "Authorization: Bearer csk-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1-8b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 智谱AI (GLM-4)
```bash
# GLM-4 Plus
curl https://your-domain.com/zhipu/api/paas/v4/chat/completions \
  -H "Authorization: Bearer your-api-key.xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4-plus",
    "messages": [{"role": "user", "content": "你好"}]
  }'

# GLM-4 Flash（免费）
curl https://your-domain.com/zhipu/api/paas/v4/chat/completions \
  -H "Authorization: Bearer your-api-key.xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4-flash",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

---

## 💻 SDK集成

### Python (OpenAI SDK)
```python
from openai import OpenAI

# OpenAI
client = OpenAI(
    api_key="sk-xxx",
    base_url="https://your-domain.com/openai/v1"
)

# 智谱AI（兼容OpenAI格式）
zhipu_client = OpenAI(
    api_key="your-api-key.xxx",
    base_url="https://your-domain.com/zhipu/api/paas/v4"
)

# 调用
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)
```

### JavaScript/TypeScript
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-xxx',
  baseURL: 'https://your-domain.com/openai/v1'
});

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }]
});

console.log(response.choices[0].message.content);
```

### Python (Anthropic SDK)
```python
import anthropic

client = anthropic.Anthropic(
    api_key="sk-ant-xxx",
    base_url="https://your-domain.com/claude"
)

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}]
)
print(message.content)
```

---

## ⚙️ 配置选项

### CONFIG对象说明

```javascript
const CONFIG = {
  // 服务路由映射
  ROUTE_MAP: {
    "openai": "api.openai.com",
    "claude": "api.anthropic.com",
    "gemini": "generativelanguage.googleapis.com",
    "groq": "api.groq.com",
    "cerebras": "api.cerebras.ai",
    "zhipu": "open.bigmodel.cn",
  },
  
  // CORS配置
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, ...',
    'Access-Control-Max-Age': '86400',
  },
  
  // 超时设置（毫秒）
  TIMEOUT: 60000,  // 60秒
  
  // 是否启用日志
  ENABLE_LOGGING: false,  // 生产环境建议关闭
};
```

### 自定义配置

#### 1. 添加新服务
```javascript
ROUTE_MAP: {
  // ... 现有服务
  "newservice": "api.newservice.com",
}
```

#### 2. 修改超时时间
```javascript
TIMEOUT: 120000,  // 改为120秒
```

#### 3. 启用日志
```javascript
ENABLE_LOGGING: true,  // 开发环境可以开启
```

#### 4. 自定义CORS
```javascript
CORS_HEADERS: {
  'Access-Control-Allow-Origin': 'https://your-frontend.com',  // 限制来源
  // ... 其他配置
}
```

---

## 🛡️ 错误处理

### 错误响应格式

系统返回JSON格式的结构化错误信息：

```json
{
  "error": {
    "message": "错误描述",
    "type": "gateway_error",
    "code": 400
  },
  "timestamp": "2024-02-25T10:30:00.000Z"
}
```

### 常见错误码

| 状态码 | 说明 | 原因 |
|-------|------|------|
| 400 | URL格式错误 | 缺少服务名称或路径不正确 |
| 400 | 不支持的服务 | 服务名称不在支持列表中 |
| 500 | 服务暂时不可用 | 上游服务故障或网络问题 |
| 500 | 请求超时 | 请求处理时间超过60秒 |

### 错误示例

```bash
# 错误：缺少服务名称
curl https://your-domain.com/v1/chat/completions
# 响应：
# {
#   "error": {
#     "message": "URL格式错误：缺少服务名称",
#     "type": "gateway_error",
#     "code": 400
#   },
#   "timestamp": "2024-02-25T10:30:00.000Z"
# }

# 错误：不支持的服务
curl https://your-domain.com/unknown/v1/models
# 响应：
# {
#   "error": {
#     "message": "不支持的服务：unknown。支持的服务：cerebras, claude, gemini, groq, openai, zhipu",
#     "type": "gateway_error",
#     "code": 400
#   },
#   "timestamp": "2024-02-25T10:30:00.000Z"
# }
```

---

## 📊 日志功能

### 启用日志

修改配置：
```javascript
ENABLE_LOGGING: true,
```

### 日志格式

```json
{
  "timestamp": "2024-02-25T10:30:00.000Z",
  "service": "openai",
  "method": "POST",
  "path": "/openai/v1/chat/completions",
  "status": 200,
  "latency": "1234ms",
  "userAgent": "curl/7.68.0"
}
```

### 日志用途

- 监控API使用情况
- 分析性能瓶颈
- 故障排查
- 统计服务调用量

**注意**：生产环境建议关闭日志以提升性能。

---

## 🔧 工作原理

### 请求处理流程

```
客户端请求
    ↓
[1] 接收请求 (addEventListener)
    ↓
[2] CORS预检？
    ├─ 是 → 返回204响应
    └─ 否 → 继续
    ↓
[3] 解析URL (parseRequest)
    ├─ 提取服务名称
    ├─ 验证服务是否支持
    └─ 构建路由信息
    ↓
[4] 代理请求 (proxyRequest)
    ├─ 构建目标URL
    ├─ 准备请求头（清理无关头部）
    ├─ 添加超时控制
    └─ 发送请求到上游
    ↓
[5] 处理响应 (createProxyResponse)
    ├─ 添加CORS头
    ├─ 添加自定义头
    └─ 返回响应
    ↓
[6] 记录日志 (可选)
    ↓
返回给客户端
```

### 头部处理

#### 移除的头部（避免冲突）
- `host`
- `cf-connecting-ip`
- `cf-ray`
- `x-forwarded-for`
- `x-real-ip`

#### 添加的头部
- `user-agent`: EO-AI-Gateway/1.0（如果原请求没有）
- `x-powered-by`: EdgeOne-Pages（响应头）
- CORS相关头部（响应头）

---

## 🎯 使用场景

### 1. 统一API网关
将多个AI服务统一到一个域名下，简化前端配置。

```javascript
// 统一的base URL
const BASE_URL = 'https://your-domain.com';

// 切换服务只需改变路径
const openaiClient = new OpenAI({ 
  baseURL: `${BASE_URL}/openai/v1` 
});
const claudeClient = new Anthropic({ 
  baseURL: `${BASE_URL}/claude` 
});
```

### 2. 解决访问限制
某些地区可能无法访问官方API，通过EdgeOne边缘节点解决。

### 3. 前端直接调用
CORS支持让前端可以直接调用，无需后端中转。

```javascript
// React示例
const [response, setResponse] = useState('');

const callAI = async () => {
  const res = await fetch('https://your-domain.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }]
    })
  });
  
  const data = await res.json();
  setResponse(data.choices[0].message.content);
};
```

### 4. 企业级应用
- 统一的错误处理格式
- 请求日志记录和监控
- 超时控制保证稳定性
- 标准化的API响应

### 5. 开发和测试
- 快速切换不同的AI服务
- 统一的调用接口，便于测试
- 详细的错误信息，便于调试

---

## 📝 最佳实践

### 1. 安全性

```javascript
// ❌ 不要在前端暴露API密钥
const apiKey = 'sk-xxx';  // 危险！

// ✅ 使用环境变量或后端代理
// 或者在EdgeOne Pages配置环境变量
```

### 2. 性能优化

```javascript
// ✅ 使用流式响应（适用于长文本生成）
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [...],
    stream: true  // 启用流式
  })
});

const reader = response.body.getReader();
// 处理流式数据...
```

### 3. 错误重试

```javascript
async function callWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // 如果是429或503，等待后重试
      if ([429, 503].includes(response.status) && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 4. 监控和日志

```javascript
// 开发环境启用日志
ENABLE_LOGGING: process.env.NODE_ENV === 'development',

// 生产环境连接专业日志服务
async function logRequest(...) {
  // 发送到日志服务
  await fetch('https://your-log-service.com/api/logs', {
    method: 'POST',
    body: JSON.stringify(log)
  });
}
```

---

## 🔍 故障排查

### 问题1：请求超时
**现象**：返回"请求超时，请稍后重试"

**原因**：
- 上游服务响应慢
- 网络不稳定
- 默认60秒超时

**解决**：
```javascript
// 增加超时时间
TIMEOUT: 120000,  // 改为120秒
```

### 问题2：CORS错误
**现象**：浏览器控制台显示CORS错误

**原因**：
- 某些服务的响应可能已包含CORS头
- 重复设置导致冲突

**解决**：已在代码中处理，自动添加CORS头

### 问题3：服务不支持
**现象**：返回"不支持的服务"

**原因**：
- 服务名称拼写错误
- 服务未在ROUTE_MAP中配置

**解决**：
```javascript
// 检查服务名称是否正确
// 支持的服务：cerebras, claude, gemini, groq, openai, zhipu

// 或添加新服务
ROUTE_MAP: {
  "newservice": "api.newservice.com"
}
```

---

## 📚 API参考

### 支持的服务端点

| 服务 | 基础端点 | 常用路径 |
|------|---------|----------|
| OpenAI | `/openai/v1` | `/chat/completions`, `/completions`, `/models` |
| Claude | `/claude/v1` | `/messages` |
| Gemini | `/gemini/v1beta` | `/models/{model}:generateContent` |
| Groq | `/groq/openai/v1` | `/chat/completions` |
| Cerebras | `/cerebras/v1` | `/chat/completions` |
| 智谱AI | `/zhipu/api/paas/v4` | `/chat/completions` |

### 支持的HTTP方法
- GET
- POST
- PUT
- DELETE
- PATCH
- OPTIONS（CORS预检）

---

## 🤝 贡献和反馈

如有问题或建议，欢迎反馈！

---

## 📄 许可证

MIT License
