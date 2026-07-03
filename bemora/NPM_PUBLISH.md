# نشر bemora على npm — الدليل الكامل

## الخطوة 1: إنشاء حساب على npmjs.com

1. روح على **https://www.npmjs.com/signup**
2. سجل بإيميلك وكلمة سر
3. فعّل الإيميل (هيجيلك رسالة تأكيد)
4. فعّل **2FA** (مطلوب لنشر packages جديدة)

---

## الخطوة 2: تسجيل الدخول من Terminal

افتح Terminal في فولدر bemora وشغّل:

```bash
npm login
```

هيطلب منك:
- **Username**: اسم حسابك على npm
- **Password**: كلمة السر
- **Email**: إيميلك
- **One-time password**: من تطبيق 2FA (Google Authenticator / Authy)

لو نجح هتشوف:
```
Logged in as YOUR_USERNAME on https://registry.npmjs.org/
```

---

## الخطوة 3: فحص الاسم (مهم جداً!)

```bash
npm view bemora
```

- لو ظهر خطأ `404 Not Found` → الاسم متاح ✅
- لو ظهر معلومات → الاسم محجوز ❌ (غيّر في package.json)

---

## الخطوة 4: نشر المكتبة

```bash
cd bemora
npm publish --access public
```

`--access public` مطلوب عشان الـ package عام (مش private).

لو نجح هتشوف:
```
npm notice Publishing to https://registry.npmjs.org/
+ bemora@1.3.0
```

✅ **خلاص! المكتبة على:**
`https://www.npmjs.com/package/bemora`

وأي حد يقدر يستخدمها:
```bash
npm install bemora
```

---

## الخطوة 5: رفع على GitHub

```bash
cd bemora
git init
git add .
git commit -m "🚀 bemora v1.3.0 — 50+ API categories"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bemora.git
git push -u origin main
```

> غيّر `YOUR_USERNAME` باسمك على GitHub

---

## الخطوة 6: تحديث نسخة جديدة

بعد كل إضافة أو تعديل:

```bash
# نسخة صغيرة (1.3.0 → 1.3.1)
npm version patch && npm publish

# نسخة متوسطة (1.3.0 → 1.4.0)
npm version minor && npm publish

# نسخة كبيرة (1.3.0 → 2.0.0)
npm version major && npm publish
```

---

## الخطوة 7: اعمل GitHub Actions للنشر التلقائي

اعمل فولدر `.github/workflows/` وفيه `publish.yml`:

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

وفي GitHub:
1. روح Settings → Secrets → Actions
2. ضيف secret اسمه `NPM_TOKEN`
3. القيمة: من npm → Access Tokens → Generate New Token (Automation)

---

## الخطوة 8: زوّد الـ Stars 🌟

بعد النشر شارك المكتبة في:

| المكان | الرابط |
|--------|--------|
| Reddit r/javascript | https://reddit.com/r/javascript |
| Reddit r/node | https://reddit.com/r/node |
| Reddit r/webdev | https://reddit.com/r/webdev |
| Hacker News | https://news.ycombinator.com/submit — "Show HN: bemora – one npm install for 50+ APIs" |
| Dev.to | https://dev.to/new |
| Twitter/X | hashtag #javascript #npm #buildinpublic |
| Product Hunt | https://www.producthunt.com/posts/new |

---

## أوامر مهمة

```bash
# تحقق أنك مسجل
npm whoami

# شوف المكتبة بعد النشر
npm view bemora

# شوف التحميلات
npm info bemora

# نشر بيتا للاختبار
npm publish --tag beta

# نشر رسمي
npm publish --access public
```
