// https://blog.csdn.net/killerdoubie/article/details/129142907
// vue-i18n所需要引入的
import { createI18n, useI18n } from 'vue-i18n'
// 本地的文件夹
import enLocale from './en-US.json';
import zhLocale from './zh-CN.json';
// vant所需要引入的
import { Locale } from 'vant'
//vant中的文件夹  需要的语言和本地的语言保持一致
import enUS from 'vant/lib/locale/lang/en-US'
import zhCN from 'vant/lib/locale/lang/zh-CN'

export const messages = {
  en: {
    ...enUS,
    ...enLocale
  },
  zh: {
    ...zhCN,
    ...zhLocale
  }
};
// 更新vant组件库本身的语言变化，支持国际化
function vantLocales(lang) {
  if (lang === 'en') {
    Locale.use(lang, enUS)
  } else if (lang === 'zh') {
    Locale.use(lang, zhCN)
  }
}
// 获取浏览器的语言
const lang = (navigator.language || 'en').toLocaleLowerCase()
const language = localStorage.getItem('ZerotierForKSU.locale') || lang.split('-')[0] || 'zh';
localStorage.setItem('ZerotierForKSU.locale', language)
const i18n = createI18n({
  //Not available in legacy mode 解决报错问题的配置项！！！
  legacy: false,
  // 全局注册 $t方法
  globalInjection: true,
  //设置初始化语言
  locale: language,
  // 设置备用语言
  fallbackLocale: 'en',
  messages,
})

export { i18n, vantLocales, useI18n }