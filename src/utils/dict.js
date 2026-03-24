import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'
import useSettingsStore from '@/store/modules/settings'
import { translateByMap } from '@/locales/runtime-map'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  const settingsStore = useSettingsStore()
  const dictStore = useDictStore()

  const translateDictList = (list = []) => {
    const language = settingsStore.language || 'zh-cn'
    return list.map(item => ({
      ...item,
      label: translateByMap(item.label, language)
    }))
  }

  const mapRawDict = (raw = []) => {
    return raw.map(p => ({
      label: p.dictLabel,
      value: p.dictValue,
      elTagType: p.listClass,
      elTagClass: p.cssClass
    }))
  }

  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = [];
      const dicts = dictStore.getDict(dictType);
      if (dicts) {
        res.value[dictType] = translateDictList(dicts);
      } else {
        getDicts(dictType).then(resp => {
          const rawDicts = mapRawDict(resp.data || [])
          dictStore.setDict(dictType, rawDicts);
          res.value[dictType] = translateDictList(rawDicts)
        })
      }
    })

    watch(
      () => settingsStore.language,
      () => {
        args.forEach((dictType) => {
          const cached = dictStore.getDict(dictType) || []
          res.value[dictType] = translateDictList(cached)
        })
      }
    )

    return toRefs(res.value);
  })()
}