import "./globals.css";

export const metadata = {
    title: "گلد اوردر | خرید و فروش طلا",
    description: "داشبورد آزمایشی مشاهده موجودی و ثبت سفارش خرید و فروش طلا",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fa" dir="rtl">
            <body>{children}</body>
        </html>
    );
}
