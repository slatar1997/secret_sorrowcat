# 🤖 AI Developer Agent Instructions & Context Mapping


## 1. Core Engine & Technology Stack
- **Framework:** React + Vite (Single Page Application)
- **Language:** TypeScript (.ts / .tsx) -- Strict Type Checking
- **Styling:** Tailwind CSS (Utility-first approach ONLY)
- **UI Kit:** daisyUI (For Passcode UI, Popups, and Glow effects)
- **Animations:** - Framer Motion (For Drag & Drop, item explosions, and transitions)
  - React PageFlip (For 3D book turning simulation)
- **Audio System:** HTML5 Audio Context / Use-Sound (Global BGM & Event SFX)
- **Typography:** Headings ('Itim' font) | Body & Subtitles ('Mali' font)

---

## 📜 2. Strict Coding Rules (กฎเหล็กห้ามฝ่าฝืนเด็ดขาด)
1. **100% TSX/TS Only:** ห้ามเขียน JavaScript (.js / .jsx) ออกมาเด็ดขาด 
2. **Zero 'any' Keyword:** ต้องระบุ Type/Interface ให้ชัดเจนทุก Component และ State
3. **Tailwind Utility Only:** ห้ามเขียน Custom Inline Style หรือแยกไฟล์ CSS (ยกเว้น Font Config)
4. **Full Implementation:** ต้องเขียนโค้ดลอจิกเต็ม ทำงานได้สมบูรณ์ ห้ามย่อโค้ดหรือทิ้งคอมเมนต์ขี้เกียจ (เช่น `// ...โค้ดเดิม`)
5. **No Simulation & Guessing:** ห้ามจำลองการรันโปรแกรม หรือเดาว่ารันแล้วจะเกิดอะไรขึ้น ต้องอ้างอิงตามสถาปัตยกรรมโค้ดที่รันได้จริง 100% เท่านั้น
6. **🚨 Document Consultation Scoping Rule (กฎการอ่านเอกสารอย่างจำกัด):**
   - **Do NOT read README1.md or milestone.md during normal implementation.** (ห้ามอ่านไฟล์ README1.md หรือ milestone.md ในระหว่างการเขียนโค้ดด่านปกติ)
   - **Only consult README1.md or milestone.md when:**
     * A required behavior is completely missing from the feature document. (เมื่อพฤติกรรมที่จำเป็นขาดหายไปจากเอกสารฟีเจอร์ย่อยนั้นๆ อย่างสิ้นเชิง)
     * Two documents contain conflicting requirements. (เมื่อเอกสารสองฉบับมีข้อกำหนดที่ขัดแย้งกัน)
     * The user explicitly requests verification against the master specification. (เมื่อผู้ใช้สั่งให้ตรวจสอบความถูกต้องกับข้อกำหนดหลักโดยตรง)
   - Otherwise, continue implementation using the feature documents only. (นอกเหนือจากนี้ ให้ดำเนินการเขียนโค้ดโดยอ้างอิงข้อมูลจากเอกสารฟีเจอร์ย่อยเท่านั้น)
7. **🚨 Fallback Rule (หากไม่เข้าใจงาน):** If requirements are unclear or missing, ask for clarification instead of making assumptions. (หากข้อกำหนดไม่ชัดเจนหรือขาดหายไป ให้หยุดและถามผู้ใช้เพื่อขอคำชี้แจงทันที ห้ามทึกทักหรือเดาเอาเองเด็ดขาด)
8. No New Architecture Rule
9. No Silent Requirement Changes

---

## 🗺️ 3. Documentation Directory Map (การเชื่อมโยงไฟล์สเปกทั้ง 9)
เมื่อได้รับสั่งให้พัฒนาคอมโพเนนต์ใดๆ ให้เปิดอ่านสเปกที่เกี่ยวข้องจากไฟล์เหล่านี้ในโฟลเดอร์ `docs/` เพื่อความแม่นยำ:

1. **`passwordgate and design.md`**
   - *หน้าที่:* ระบบ State Machine แกนหลักใน `App.tsx` และหน้าด่านแรก (ปุ่มกดพาสเทล 3x4 รหัส "2003", แอนิเมชันสั่นเมื่อพิมพ์ผิด, เสียงเอฟเฟกต์ปลดล็อก)
2. **`ticket.md`**
   - *หน้าที่:* ระบบตั๋วรถไฟแปรผันตามชื่อแฟน รองรับ Input พิมพ์ชื่อ, เจาะรูเว้าตั๋วด้วย CSS, และแอนิเมชันพลิกการ์ด 3D หน้า-หลัง
3. **`london.md`**
   - *หน้าที่:* ฉาก Cinematic วิวหน้าต่างรถไฟวิ่งสไลด์อัตโนมัติ (ภาพต่อกัน 3 ใบ ไหลจากขวาไปซ้ายด้วย Linear Ease นาน 10-20 วินาที เพื่อเข้าสู่โต๊ะหลัก)
4. **`Main4.md`**
   - *หน้าที่:* โครงสร้างโต๊ะทำงานหลักมุมมองมุมสูง (2D Top-Down Desktop View) ที่รองรับ Responsive และทำหน้าที่เป็น Dashboard วาง 3 มินิเกมหลัก
5. **`vinyl.md`**
   - *หน้าที่:* เครื่องเล่นแผ่นเสียงไวนิลสีน้ำตาล-ดำ 12 เพลง (ลากวางเข็ม, เล่น/หยุด/รีเซ็ต, รูปคู่ดุมกลางกลมดิ๊ก 100%, เพลงเล่นต่อเนื่องคลอเป็น Global BGM)
6. **`tortilla.md`**
   - *หน้าที่:* มินิเกมทำอาหาร (คลิกหั่นวัตถุดิบ 5 ครั้ง ➡️ ลากลงแป้ง ➡️ คลิกพับตามลำดับ ล่าง-ซ้าย-ขวา-บน ➡️ ตลบแผ่นแป้งห่อเสร็จสิ้นเซ็ตค่าสำเร็จ)
7. **`Diary.md`**
   - *หน้าที่:* สมุดภาพความทรงจำมุมมอง Top-down (รูป 20 ใบ ตัดแบ่ง Slice ลง Grid หน้าละ 4 ใบ รวม 5 หน้า, รองรับการใช้นิ้วปัดพลิก 3D ด้วย react-pageflip)
8. **`secretbox.md`**
   - *หน้าที่:* กล่องปริศนาบนโต๊ะ (สถานะเริ่มต้นล็อก ➡️ เคลียร์ ไวนิล+ตอติญ่า+ไดอารี่ ครบ แม่กุญแจเปลี่ยนเป็นสีทอง ➡️ ควิซรูปภาพ 2 ข้อ เลือกอะไรก็ได้ ➡️ แจกไอเทมกุญแจ)
9. **`final.md`**
   - *หน้าที่:* ฉากจบ Grand Finale (ลากกุญแจไข ➡️ ลากฝาเปิดด้วยมือ ➡️ รูปโพลารอยด์ 20 ใบ + แป้ง + ควิซ พุ่งระเบิดกระจายกลายเป็น Sandbox ลากเกลี่ยอิสระ ➡️ เปิดจดหมายพิมพ์ดีดคำถาม "เป็นแฟนกันได้มั้ย" ➡️ ปุ่ม [ไม่เป็น] สั่นแล้ววาร์ปหนี ➡️ ปุ่ม [เป็น] ขยายร่างตามเวลา เมื่อกดสำเร็จยิงพลุหัวใจเต็มจอ)

---

## 🔄 4. Global State & Data Flow Architecture
ในการเขียนโค้ด คอมโพเนนต์ย่อยต้องส่งต่อและซิงค์ข้อมูลผ่าน Global State/Context ตามทิศทางนี้เท่านั้น:
- `passengerName` (String): รับจาก `ticket.md` ส่งไปแสดงผลบนหน้าตั๋ว
- `isTortillaCooked` (Boolean): เคลียร์จาก `tortilla.md` เพื่อใช้ส่งข้อมูลแผ่นแป้งไปฉากจบ และเป็น 1 ในเงื่อนไขปลดล็อกกล่อง
- `isVinylPlayed` (Boolean): ตรวจจับจาก `vinyl.md` เพื่อเช็กเงื่อนไขปลดล็อกกล่อง
- `isDiaryRead` (Boolean): ตรวจจับจาก `Diary.md` (อ่านครบทุกหน้า) เพื่อเช็กเงื่อนไขปลดล็อกกล่อง
- `selectedQuizImages` (Array[String]): บันทึก Path รูปภาพ 2 รูปที่แฟนเลือกจาก `secretbox.md` เพื่อส่งต่อให้ไปพุ่งระเบิดใน `final.md`