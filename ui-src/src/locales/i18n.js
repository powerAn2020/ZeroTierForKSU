import {createI18n} from 'vue-i18n'
import * as zh from './zh-CN'
import * as en from './en-US'

const i18n = createI18n({
    messages: {
        'zh-CN': {...zh},
        'en-US': {...en},
    }
})

export default i18n
