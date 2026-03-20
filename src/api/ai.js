import request from '@/utils/request'

// AI 聊天
export function chat(data) {
  return request({
    url: '/ai/chat',
    method: 'post',
    data
  })
}

// AI 进度分析
export function analyzeProgress(data) {
  return request({
    url: '/ai/analyze/progress',
    method: 'post',
    data
  })
}

// 模型配置列表
export function listAiModels() {
  return request({
    url: '/ai/models',
    method: 'get'
  })
}

// 保存模型配置（新增/编辑）
export function saveAiModel(data) {
  return request({
    url: '/ai/models',
    method: 'post',
    data
  })
}

// Prompt 模板列表
export function listAiPrompts() {
  return request({
    url: '/ai/prompts',
    method: 'get'
  })
}

// 保存 Prompt 模板（新增/编辑）
export function saveAiPrompt(data) {
  return request({
    url: '/ai/prompts',
    method: 'post',
    data
  })
}
