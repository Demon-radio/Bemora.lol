# دليل نشر bemora على npm و GitHub

## الخطوة 1: إنشاء حساب npm

1. روح على **https://www.npmjs.com/signup**
2. سجل بإيميلك
3. فعّل الإيميل

---

## الخطوة 2: إنشاء حساب GitHub

1. روح على **https://github.com/signup**
2. سجل بإيميلك
3. اعمل repo جديد اسمه `bemora`
   - اضغط New repository
   - الاسم: `bemora`
   - Public
   - لا تضف README (موجود بالفعل)

---

## الخطوة 3: رفع الكود على GitHub

افتح Terminal في فولدر bemora وشغل الأوامر دي:

```bash
cd bemora

git init
git add .
git commit -m "🚀 Initial release: bemora v1.0.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bemora.git
git push -u origin main
```

> غيّر `YOUR_USERNAME` باسم حسابك على GitHub

---

## الخطوة 4: النشر على npm

```bash
# سجل دخول على npm
npm login
# هيطلب منك: username, password, email, OTP

# نشر المكتبة
npm publish --access public
```

✅ خلاص! المكتبة بقت متاحة على:
`https://www.npmjs.com/package/bemora`

وأي حد يقدر يعملها:
```bash
npm install bemora
```

---

## الخطوة 5: عشان تاخد نجوم كتير على GitHub

### أ) اعمل GitHub Actions للـ CI
اعمل فايل `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### ب) أضف Topics على الـ repo
في صفحة الـ repo اضغط ⚙️ بجانب "About" وأضف:
```
api, unified-api, weather, crypto, news, football, gold, mcp, npm, javascript
```

### ج) اكتب description واضح
```
One library for weather, currency, news, images, football, crypto, gold & research APIs
```

### د) شارك على:
- **Reddit**: r/javascript, r/node, r/webdev
- **Dev.to**: اكتب مقال بعنوان "I built a library that replaces 8 npm packages"
- **Hacker News**: "Show HN: bemora – one npm install for all APIs"
- **Twitter/X**: بوست بـ hashtag #javascript #npm #buildinpublic
- **Product Hunt**: أضف المشروع

---

## الخطوة 6: تحديث نسخة جديدة

```bash
# نسخة صغيرة (patch): 1.0.0 → 1.0.1
npm version patch

# نسخة متوسطة (minor): 1.0.0 → 1.1.0
npm version minor

# نسخة كبيرة (major): 1.0.0 → 2.0.0
npm version major

# بعدها
git push --follow-tags
npm publish
```

---

## ملخص الأوامر

```bash
# أول مرة
npm login
npm publish --access public

# تحديث
npm version patch
git push --follow-tags
npm publish
```
