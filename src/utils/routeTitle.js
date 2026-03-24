import { translateByMap } from '@/locales/runtime-map'

export function getRouteTitle(meta = {}, language = 'zh-cn') {
  if (!meta || !meta.title) return ''
  if (language === 'en') {
    if (meta.titleEn) return meta.titleEn
    return translateByMap(meta.title, language)
  }
  return meta.title
}

export function getTitleByText(title = '', language = 'zh-cn') {
  if (!title) return ''
  return language === 'en' ? translateByMap(title, language) : title
}
