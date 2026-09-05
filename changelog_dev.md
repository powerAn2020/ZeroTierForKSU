### 注意⚠️：本次调整了 UI 缓存 key，升级后会导致配置丢失，需要重新设置
**Notice ⚠️:** UI cache keys have been updated in this release. Upgrading will reset your current configurations and require re-configuration.

涉及：主题色、国际化、开发者设置
Affected areas: Theme color, Language (i18n), and Developer options

1. 添加自定义 DNS 功能，用于解决 central 网络污染导致 IP 解析失败的问题 (#71)    
Add custom DNS support to fix IP resolution failures caused by central network pollution (#71)  
2. 优化流水线，修复 arm 编译错误的问题 (#72)    
Optimize CI/CD pipeline and fix ARM compilation errors (#72)  
3. 首页加载流程优化，当未配置 API Token 时跳过网络请求    
Optimize home page loading flow: skip network requests when API Token is not configured  
4. 更新 API Token 指引链接    
Update documentation link for API Token guide  
5. 其他 BUG 修复    Other bug fixes and improvements
