import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS = [
  { name: "華碩靈耀14 輕薄本", category: "筆記本電腦", price: 4299, brand: "華碩", rating: 4.6 },
  { name: "聯想小新Pro14", category: "筆記本電腦", price: 4999, brand: "聯想", rating: 4.7 },
  { name: "惠普戰66 輕薄本", category: "筆記本電腦", price: 3699, brand: "惠普", rating: 4.5 },
  { name: "戴爾靈越14", category: "筆記本電腦", price: 4199, brand: "戴爾", rating: 4.4 },
  { name: "華為MateBook 14", category: "筆記本電腦", price: 5299, brand: "華為", rating: 4.8 },
  { name: "小米筆記本Pro 15", category: "筆記本電腦", price: 4499, brand: "小米", rating: 4.5 },
  { name: "宏碁非凡S3", category: "筆記本電腦", price: 2999, brand: "宏碁", rating: 4.3 },
  { name: "RedmiBook Pro 14", category: "筆記本電腦", price: 3299, brand: "Redmi", rating: 4.4 },
  { name: "ThinkBook 14", category: "筆記本電腦", price: 4599, brand: "聯想", rating: 4.6 },
  { name: "機械革命無界14", category: "筆記本電腦", price: 2799, brand: "機械革命", rating: 4.2 },
  { name: "華碩無畏15", category: "筆記本電腦", price: 3499, brand: "華碩", rating: 4.4 },
  { name: "榮耀MagicBook 14", category: "筆記本電腦", price: 3999, brand: "榮耀", rating: 4.5 },
  { name: "聯想ThinkPad E14", category: "筆記本電腦", price: 5199, brand: "聯想", rating: 4.7 },
  { name: "Redmi Note 13 Pro", category: "手機", price: 1899, brand: "小米", rating: 4.5 },
  { name: "真我GT Neo5", category: "手機", price: 2499, brand: "真我", rating: 4.6 },
  { name: "iQOO Neo8", category: "手機", price: 2299, brand: "iQOO", rating: 4.5 },
  { name: "一加Ace 2", category: "手機", price: 2799, brand: "一加", rating: 4.7 },
  { name: "OPPO Reno10", category: "手機", price: 2999, brand: "OPPO", rating: 4.5 },
  { name: "vivo S17", category: "手機", price: 2699, brand: "vivo", rating: 4.4 },
  { name: "榮耀90", category: "手機", price: 2499, brand: "榮耀", rating: 4.5 },
  { name: "華為nova 12", category: "手機", price: 3199, brand: "華為", rating: 4.6 },
  { name: "小米Civi 3", category: "手機", price: 2299, brand: "小米", rating: 4.4 },
  { name: "三星Galaxy A54", category: "手機", price: 2999, brand: "三星", rating: 4.5 },
  { name: "索尼WH-1000XM5", category: "耳機", price: 2499, brand: "索尼", rating: 4.8 },
  { name: "蘋果AirPods Pro 2", category: "耳機", price: 1899, brand: "蘋果", rating: 4.7 },
  { name: "華為FreeBuds Pro 2", category: "耳機", price: 1099, brand: "華為", rating: 4.5 },
  { name: "小米Buds 4 Pro", category: "耳機", price: 799, brand: "小米", rating: 4.4 },
  { name: "漫步者NeoBuds Pro", category: "耳機", price: 599, brand: "漫步者", rating: 4.3 },
  { name: "索尼LinkBuds S", category: "耳機", price: 1299, brand: "索尼", rating: 4.5 },
  { name: "三星Buds 2 Pro", category: "耳機", price: 999, brand: "三星", rating: 4.5 },
  { name: "OPPO Enco X2", category: "耳機", price: 899, brand: "OPPO", rating: 4.4 },
  { name: "JBL Tour One", category: "耳機", price: 1599, brand: "JBL", rating: 4.4 },
  { name: "森海塞爾Momentum 4", category: "耳機", price: 2199, brand: "森海塞爾", rating: 4.6 },
  { name: "戴森V12吸塵器", category: "家居", price: 3990, brand: "戴森", rating: 4.7 },
  { name: "小米掃地機器人", category: "家居", price: 1999, brand: "小米", rating: 4.5 },
  { name: "飛利浦空氣炸鍋", category: "家居", price: 499, brand: "飛利浦", rating: 4.4 },
  { name: "美的電壓力鍋", category: "家居", price: 399, brand: "美的", rating: 4.5 },
  { name: "九陽豆漿機", category: "家居", price: 299, brand: "九陽", rating: 4.3 },
  { name: "科沃斯掃地機", category: "家居", price: 2599, brand: "科沃斯", rating: 4.6 },
  { name: "蘇泊爾電飯煲", category: "家居", price: 359, brand: "蘇泊爾", rating: 4.4 },
  { name: "石頭掃地機", category: "家居", price: 2299, brand: "石頭", rating: 4.5 },
  { name: "摩飛多功能鍋", category: "家居", price: 599, brand: "摩飛", rating: 4.4 },
  { name: "北鼎養生壺", category: "家居", price: 699, brand: "北鼎", rating: 4.5 },
  { name: "華碩靈耀X 雙屏", category: "筆記本電腦", price: 8999, brand: "華碩", rating: 4.7 },
  { name: "紅米K70", category: "手機", price: 2499, brand: "小米", rating: 4.6 },
  { name: "Bose QC Ultra", category: "耳機", price: 2899, brand: "Bose", rating: 4.7 },
  { name: "添可洗地機", category: "家居", price: 3299, brand: "添可", rating: 4.5 },
  { name: "聯想拯救者Y7000", category: "筆記本電腦", price: 5999, brand: "聯想", rating: 4.6 },
  { name: "iPhone 15", category: "手機", price: 5999, brand: "蘋果", rating: 4.8 },
  { name: "鐵三角ATH-M50x", category: "耳機", price: 1199, brand: "鐵三角", rating: 4.5 },
  { name: "雲鯨J4掃地機", category: "家居", price: 3799, brand: "雲鯨", rating: 4.6 },
  { name: "戴爾XPS 13", category: "筆記本電腦", price: 7999, brand: "戴爾", rating: 4.8 },
  { name: "三星S24", category: "手機", price: 4999, brand: "三星", rating: 4.7 },
];

async function main() {
  const count = await prisma.product.count();
  if (count >= 50) {
    console.log("已有足夠商品，跳過 seed。當前數量:", count);
    return;
  }
  await prisma.product.createMany({
    data: PRODUCTS,
    skipDuplicates: true,
  });
  console.log("Seed 完成，Product 數量:", await prisma.product.count());
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
