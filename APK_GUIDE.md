# دليل بناء APK لتطبيق موظفي

## المتطلبات
- Node.js 18+
- Android Studio (لبناء APK)
- Java JDK 17+

## خطوات بناء APK

```bash
# 1. تثبيت الحزم
npm install

# 2. إضافة منصة Android
npx cap add android

# 3. مزامنة الملفات
npx cap sync android

# 4. فتح Android Studio
npx cap open android
```

## في Android Studio
1. افتح المشروع من `android/`
2. انتظر تحميل Gradle
3. من القائمة: **Build > Generate Signed Bundle/APK**
4. اختر **APK** ثم أنشئ keystore
5. حدد **release** للنشر أو **debug** للاختبار
6. ستجد APK في: `android/app/build/outputs/apk/`

## ملاحظة
التطبيق يعمل كـ WebView يعرض الموقع المباشر من:
`https://veravox.vercel.app`

لذلك يحتاج اتصال بالإنترنت ويعمل دائماً بأحدث نسخة.
