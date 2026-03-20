export interface R<T> {
  code: number
  msg: string
  detailMessage?: string
  data: T
}

export interface AiBaseRequest {
  question: string
  sessionId?: string
  sceneCode?: string
  styleCode?: string
  personaCode?: string
}

export interface AiChatData {
  answer: string
  usedModel: string
  usedPromptTemplate: string
  permissionLimited: boolean
}

export interface AiAnalyzeSummary {
  overallProgress: string
  keyMetrics: string[]
  highlights: string[]
}

export interface AiAnalyzeData {
  answer: string
  summary: AiAnalyzeSummary
  suggestions: string[]
  riskTips: string[]
  chartData: Record<string, any>
  usedModel: string
  usedPromptTemplate: string
  permissionLimited: boolean
}

export interface AiModelConfig {
  id?: number
  configName: string
  provider: string
  baseUrl?: string
  apiKey?: string
  modelName: string
  temperature?: number
  maxTokens?: number
  topP?: number
  enabled?: number
  isDefault?: number
  remark?: string
}

export interface AiPromptTemplate {
  id?: number
  templateCode: string
  templateName: string
  sceneCode?: string
  styleCode?: string
  personaCode?: string
  systemPrompt?: string
  userPromptTemplate?: string
  enabled?: number
  isDefault?: number
  remark?: string
}
