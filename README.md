# Weather Bot

بوت عادي (مو selfbot) يرسل كارد طقس (صورة) لما أحد يكتب `!طقس`.

## الإعداد
1. من Developer Portal فعّل **Message Content Intent** للبوت.
2. افتح config.json:
   - token: توكن البوت
   - channel_id: ID الروم اللي ينرسل فيه الكارد (أو "0" عشان يرد في نفس الروم)
   - default_city: المدينة الافتراضية
   - unit: celsius أو fahrenheit
3. شغّل: `npm install` ثم `node index.js`

## الأوامر
- `!طقس` ← طقس المدينة الافتراضية
- `!طقس الرياض` أو `!weather London` ← مدينة ثانية

## الخط
الكارد يستخدم الخطوط اللي في مجلد fonts (DejaVu Sans). تقدر تبدّلها بخط عربي ثاني بنفس الأسماء.
