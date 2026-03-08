/**
 * =================================================================================
 * EO边缘函数 - AI网关代理 
 * =================================================================================
 *
 * 功能特性：
 * - ✅ 多服务支持：OpenAI、Claude、Gemini、Groq、Cerebras、智谱AI
 * - ✅ 完全透传：保证100%兼容官方API
 * - ✅ CORS支持：跨域请求处理
 * - ✅ 错误处理：友好的错误提示
 * - ✅ 性能优化：高效的请求处理
 * =================================================================================
 */

// --- 配置 ---
const CONFIG = {
  // 服务路由映射
  ROUTE_MAP: {
    "cerebras": "api.cerebras.ai",
    "claude": "api.anthropic.com",
    "gemini": "generativelanguage.googleapis.com",
    "groq": "api.groq.com",
    "openai": "api.openai.com",
    "zhipu": "open.bigmodel.cn",
  },
  
  // CORS配置
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-goog-api-key, anthropic-version, openai-organization',
    'Access-Control-Max-Age': '86400',
  },
  
  // 超时设置（毫秒）
  TIMEOUT: 60000,
  
  // 是否启用日志（生产环境建议关闭）
  ENABLE_LOGGING: false,
};

// --- 主入口 ---
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

/**
 * 主请求处理函数
 * @param {FetchEvent} event - Fetch事件对象
 * @returns {Promise<Response>}
 */
async function handleRequest(event) {
  const request = event.request;
  const startTime = Date.now();
  
  try {
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return createCorsResponse();
    }

    // 解析并验证请求
    const routeInfo = parseRequest(request);
    if (!routeInfo.valid) {
      return createErrorResponse(routeInfo.error, 400);
    }

    // 转发请求到目标服务
    const response = await proxyRequest(request, routeInfo);
    
    // 记录日志（可选）
    if (CONFIG.ENABLE_LOGGING) {
      event.waitUntil(logRequest(request, response, routeInfo, startTime));
    }
    
    return response;

  } catch (error) {
    console.error('Request failed:', error);
    return createErrorResponse(error.message || '服务暂时不可用', 500);
  }
}

/**
 * 解析请求，提取服务信息
 * @param {Request} request - 请求对象
 * @returns {Object} 路由信息
 */
function parseRequest(request) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // 验证路径格式
    if (pathSegments.length < 1) {
      return { 
        valid: false, 
        error: 'URL格式错误：缺少服务名称' 
      };
    }
    
    const service = pathSegments[0].toLowerCase();
    
    // 验证服务是否支持
    if (!CONFIG.ROUTE_MAP[service]) {
      return { 
        valid: false, 
        error: `不支持的服务：${service}。支持的服务：${Object.keys(CONFIG.ROUTE_MAP).join(', ')}` 
      };
    }
    
    return {
      valid: true,
      service,
      targetHost: CONFIG.ROUTE_MAP[service],
      originalUrl: url,
      pathSegments,
    };
    
  } catch (error) {
    return { 
      valid: false, 
      error: `URL解析失败：${error.message}` 
    };
  }
}

/**
 * 代理请求到目标服务
 * @param {Request} request - 原始请求
 * @param {Object} routeInfo - 路由信息
 * @returns {Promise<Response>}
 */
async function proxyRequest(request, routeInfo) {
  // 构建目标URL
  const targetUrl = buildTargetUrl(routeInfo);
  
  // 复制并处理请求头
  const headers = prepareHeaders(request.headers, routeInfo.service);
  
  // 创建代理请求
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'follow',
  });
  
  // 添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
  
  try {
    // 发送请求
    const response = await fetch(proxyRequest, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // 创建响应并添加CORS头
    return createProxyResponse(response);
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    throw error;
  }
}

/**
 * 构建目标URL
 * @param {Object} routeInfo - 路由信息
 * @returns {string} 目标URL
 */
function buildTargetUrl(routeInfo) {
  const url = new URL(routeInfo.originalUrl.toString());
  url.hostname = routeInfo.targetHost;
  
  // 移除服务前缀
  const pathWithoutService = routeInfo.originalUrl.pathname.substring(
    routeInfo.service.length + 1
  );
  url.pathname = pathWithoutService || '/';
  
  return url.toString();
}

/**
 * 准备请求头
 * @param {Headers} originalHeaders - 原始请求头
 * @param {string} service - 服务名称
 * @returns {Headers} 处理后的请求头
 */
function prepareHeaders(originalHeaders, service) {
  const headers = new Headers(originalHeaders);
  
  // 移除可能导致问题的头部
  headers.delete('host');
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ray');
  headers.delete('x-forwarded-for');
  headers.delete('x-real-ip');
  
  // 确保有User-Agent
  if (!headers.has('user-agent')) {
    headers.set('user-agent', 'EO-AI-Gateway/1.0');
  }
  
  return headers;
}

/**
 * 创建代理响应
 * @param {Response} upstreamResponse - 上游响应
 * @returns {Response}
 */
function createProxyResponse(upstreamResponse) {
  // 创建新响应
  const response = new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers,
  });
  
  // 添加CORS头
  Object.entries(CONFIG.CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // 添加自定义头
  response.headers.set('x-powered-by', 'EdgeOne-Pages');
  
  return response;
}

/**
 * 创建CORS预检响应
 * @returns {Response}
 */
function createCorsResponse() {
  return new Response(null, {
    status: 204,
    headers: CONFIG.CORS_HEADERS,
  });
}

/**
 * 创建错误响应
 * @param {string} message - 错误消息
 * @param {number} status - HTTP状态码
 * @returns {Response}
 */
function createErrorResponse(message, status = 500) {
  const errorBody = {
    error: {
      message: message,
      type: 'gateway_error',
      code: status,
    },
    timestamp: new Date().toISOString(),
  };
  
  const response = new Response(JSON.stringify(errorBody, null, 2), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      ...CONFIG.CORS_HEADERS,
    },
  });
  
  return response;
}

/**
 * 记录请求日志（可选功能）
 * @param {Request} request - 原始请求
 * @param {Response} response - 响应对象
 * @param {Object} routeInfo - 路由信息
 * @param {number} startTime - 开始时间
 */
async function logRequest(request, response, routeInfo, startTime) {
  try {
    const latency = Date.now() - startTime;
    const log = {
      timestamp: new Date().toISOString(),
      service: routeInfo.service,
      method: request.method,
      path: routeInfo.originalUrl.pathname,
      status: response.status,
      latency: `${latency}ms`,
      userAgent: request.headers.get('user-agent') || 'unknown',
    };
    
    // 这里可以将日志发送到日志服务
    console.log('[Gateway Log]', JSON.stringify(log));
    
  } catch (error) {
    // 忽略日志错误，不影响主流程
    console.error('[Log Error]', error);
  }
}

// --- 辅助函数 ---

/**
 * 获取客户端IP（如果需要）
 * @param {Request} request
 * @returns {string}
 */
function getClientIP(request) {
  return request.headers.get('cf-connecting-ip') 
    || request.headers.get('x-forwarded-for')
    || request.headers.get('x-real-ip')
    || 'unknown';
}

/**
 * 检查请求是否为流式请求
 * @param {Request} request
 * @returns {boolean}
 */
function isStreamRequest(request) {
  const contentType = request.headers.get('content-type') || '';
  return contentType.includes('text/event-stream') 
    || request.headers.get('accept')?.includes('text/event-stream');
}
