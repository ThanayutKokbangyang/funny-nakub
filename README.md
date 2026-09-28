# มีเรื่องอยากถาม 💌

เว็บถามว่า "เราลองคุยกันดูไหม?" ปุ่มเพื่อนหนีตลอด พอเธอเปิดจดหมายหรือกดปุ่มชมพู จะบันทึกลง Google Sheet ให้

## 1. ทำ Google Sheet

1. สร้าง Google Sheet ใหม่
2. เมนู **ส่วนขยาย (Extensions) > Apps Script**
3. ลบโค้ดเดิม วางโค้ดจาก `google-apps-script.gs` แล้วแก้ `SECRET` เป็นรหัสของคุณเอง กดบันทึก
4. กด **Deploy > New deployment** เลือกชนิด **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. กด Deploy แล้วอนุญาตสิทธิ์ (ถ้าขึ้นว่าแอปไม่ได้รับการยืนยัน ให้กด Advanced > Go to ... ได้เลย เพราะเป็นสคริปต์ของคุณเอง)
6. คัดลอก **Web app URL** ที่ลงท้ายด้วย `/exec`

อยากให้เวลาเป็นเวลาไทย: ใน Apps Script ไปที่ ⚙️ Project Settings แล้วตั้ง Time zone เป็น `(GMT+07:00) Bangkok`

ถ้าแก้โค้ด Apps Script ทีหลัง ต้อง **Deploy > Manage deployments > แก้ไข > New version** ถึงจะมีผล

## 2. Deploy ขึ้น Vercel

1. อัปโค้ดทั้งโฟลเดอร์นี้ขึ้น GitHub
2. ที่ vercel.com กด **Add New > Project** แล้วเลือก repo นี้ (Vercel จะรู้เองว่าเป็น Vite)
3. ก่อนกด Deploy เปิด **Environment Variables** แล้วเพิ่ม
   - `SHEET_WEBHOOK_URL` = URL จากข้อ 1.6
   - `SHEET_SECRET` = รหัสเดียวกับที่ตั้งใน Apps Script
4. กด Deploy

ถ้าเพิ่ม Environment Variables หลัง deploy แล้ว ต้องกด Redeploy หนึ่งครั้ง

## 3. ส่งลิงก์

```
https://ชื่อโปรเจกต์.vercel.app/?to=ชื่อเธอ
```

ใน Sheet จะมีแถวใหม่ขึ้น 3 จังหวะ: ตอนเธอ **เปิดจดหมาย**, ตอน **กด "ลองคุยกันนะ"** และตอน **ส่งข้อความ** (ข้อความอยู่คอลัมน์ E) พร้อมจำนวนครั้งที่เธอไล่จับปุ่มเพื่อน

ถ้าเคยตั้ง Sheet ไว้ก่อนหน้านี้แล้ว: วางโค้ด Apps Script ใหม่ แล้ว Deploy เป็น New version และพิมพ์หัวคอลัมน์ `ข้อความ` ที่ช่อง E1 เอง

## ทดสอบในเครื่อง

```bash
npm install
npm run dev
```

`npm run dev` จะเปิดหน้าเว็บได้ แต่ `/api/log` จะยังไม่ทำงาน ถ้าอยากทดสอบส่งเข้า Sheet ในเครื่อง ใช้ `npx vercel dev` แทน (ต้องมีไฟล์ `.env.local` ตาม `.env.example`)

## ปรับแต่ง

- ข้อความแซวของปุ่มเพื่อน: `LINES` ใน `src/App.jsx`
- ชื่อแบบไม่ต้องใส่ในลิงก์: `HER_NAME` ใน `src/App.jsx`
- เพลง: `src/music.js` (แต่งเอง เล่นด้วย Web Audio ไม่ต้องมีไฟล์เสียง)
- หน้าตาตัวการ์ตูน: `src/buddy.js`
