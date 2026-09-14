// Classify the specific variant code, not a shared listing title that may mention
// multiple garments/colors. Unknown attributes are left untagged.
export const TYPES = ['เสื้อ', 'กระโปรง', 'เซต', 'เดรส', 'กางเกง', 'ผ้าถุง', 'ผ้าผืน', 'รองเท้า', 'อื่น ๆ'];
const COLOR_RULES = [
  ['สีฟ้า', /ฟ้า|คราม|(?:^|[\s_-])(?:blue|sky|kram)(?=$|[\s_-])/i],
  ['สีดำ', /ดำ|(?:^|[\s_-])black(?=$|[\s_-])/i],
  ['สีขาว', /ขาว|(?:^|[\s_-])white(?=$|[\s_-])/i],
  ['สีชมพู', /ชมพู|(?:^|[\s_-])pink(?=$|[\s_-])/i],
  ['สีม่วง', /ม่วง|(?:^|[\s_-])(?:purple|violet)(?=$|[\s_-])/i],
  ['สีเหลือง', /เหลือง|(?:^|[\s_-])yellow(?=$|[\s_-])/i],
  ['สีน้ำตาล', /น้ำตาล|(?:^|[\s_-])brown(?=$|[\s_-])/i],
  ['สีน้ำเงิน', /น้ำเงิน/],
  ['สีกรมท่า', /กรม|(?:^|[\s_-])navy(?=$|[\s_-])/i],
  ['สีแดง', /แดง|(?:^|[\s_-])red(?=$|[\s_-])/i],
  ['สีส้ม', /ส้ม|(?:^|[\s_-])orange(?=$|[\s_-])/i],
  ['สีเขียว', /เขียว|(?:^|[\s_-])(?:green|olive)(?=$|[\s_-])/i],
  ['สีครีม', /ครีม|(?:^|[\s_-])cream(?=$|[\s_-])/i],
  ['สีเบจ', /เบจ|(?:^|[\s_-])beige(?=$|[\s_-])/i],
  ['สีเทา', /เทา|(?:^|[\s_-])gr[ae]y(?=$|[\s_-])/i],
  ['สีโอรส', /โอรส/],
];
export const COLORS = COLOR_RULES.map(([color]) => color);
export function productTags(product) {
  const code = String(product.code || '').normalize('NFC').toLowerCase();
  let type = '';
  if (/(?:^|[\s_-])set|เซ[ต็]ท?|\+.*(?:โปรง|ผ้าถุง)/i.test(code)) type = 'เซต';
  else if (/เดรส|dress|ดด001/i.test(code)) type = 'เดรส';
  else if (/ผ้าถุง/.test(code)) type = 'ผ้าถุง';
  else if (/ผ้าผืน/.test(code)) type = 'ผ้าผืน';
  else if (/โปรง|ก\.ป\.|skirt/i.test(code)) type = 'กระโปรง';
  else if (/กางเกง|pant|short|jogger|เลกกิ้ง/i.test(code)) type = 'กางเกง';
  else if (/เสื้อ|คอกลม|คอจีน|คอปาด|คอถ่วง|shirt|top|camisole|blouse|crop/i.test(code)) type = 'เสื้อ';
  else if (/รองเท้า|shoe/i.test(code)) type = 'รองเท้า';
  else if (/ถุงเท้า|หมวก|ผ้าพันคอ|sock|hat|scarf|nipp|donut/i.test(code)) type = 'อื่น ๆ';
  return { type, colors:COLOR_RULES.filter(([,rule]) => rule.test(code)).map(([color]) => color) };
}
export function matchesTags(tags, type, color) {
  return (!type || tags.type === type) && (!color || tags.colors.includes(color));
}
