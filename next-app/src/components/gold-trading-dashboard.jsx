"use client";

import { useEffect, useState } from "react";
import { formatGold, formatWhole, normalizeNumber, orderPreview, persianDigits, validGoldAmount } from "@/lib/trading.mjs";

const DEMO_USERS = [
    { id: "1", label: "کاربر آزمایشی ۱" },
    { id: "2", label: "کاربر آزمایشی ۲" },
];

const MESSAGE_TRANSLATIONS = {
    "Insufficient rial balance.": "موجودی ریالی برای این خرید کافی نیست.",
    "Insufficient gold balance.": "موجودی طلا برای این فروش کافی نیست.",
    "Order total must be at least 1 rial.": "مبلغ سفارش باید حداقل یک ریال باشد.",
    "Wallet balance limit exceeded.": "موجودی کیف پول از محدوده مجاز بیشتر می‌شود.",
    "Invalid or missing X-User-Id header.": "شناسه کاربر نامعتبر است.",
    "User not found.": "کاربر انتخاب‌شده یافت نشد.",
    "No query results for model [App\\Models\\Wallet].": "کیف پول این کاربر یافت نشد.",
};

async function readApiResponse(response) {
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.status === "error") {
        if (response.status >= 500) {
            throw new Error("سرور با خطا مواجه شد. کمی بعد دوباره تلاش کنید.");
        }
        const validationErrors = body?.errors;
        const firstValidationError = validationErrors && Object.values(validationErrors)
            .flat()
            .find((message) => typeof message === "string");
        const rawMessage = firstValidationError || body?.message;
        throw new Error(
            MESSAGE_TRANSLATIONS[rawMessage] ||
            (typeof rawMessage === "string" && rawMessage !== "The given data was invalid."
                ? rawMessage
                : "درخواست نامعتبر است. اطلاعات را بررسی کنید.")
        );
    }
    if (!body?.data || typeof body.data !== "object") {
        throw new Error("پاسخ دریافت‌شده از سرور معتبر نیست.");
    }
    return body.data;
}

function Icon({ name, size = 20, className = "" }) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
        "aria-hidden": true,
    };
    switch (name) {
        case "wallet":
            return <svg {...common}><rect x="3" y="6" width="18" height="15" rx="3" /><path d="M3 10h18M7 6V4a1 1 0 0 1 1-1h10" /><path d="M16 15h2" /></svg>;
        case "gold":
            return <svg {...common}><path d="m7 7 5-4 5 4 4 7-9 7-9-7 4-7Z" /><path d="M3 14h18M7 7h10l-5 14L7 7Z" /></svg>;
        case "refresh":
            return <svg {...common}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.7 9A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 12.4-2" /></svg>;
        case "arrow":
            return <svg {...common}><path d="M19 12H5m6-6-6 6 6 6" /></svg>;
        case "check":
            return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
        case "alert":
            return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>;
        case "shield":
            return <svg {...common}><path d="m12 2 8 4v6c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-4Z" /><path d="m9 12 2 2 4-4" /></svg>;
        default:
            return null;
    }
}

function BalanceCard({ kind, label, value, unit, loading, error }) {
    return (
        <section className={`balance-card balance-card--${kind}`} aria-label={label}>
            <div className="balance-card__top">
                <span className="balance-card__label">{label}</span>
                <span className="balance-card__icon"><Icon name={kind === "rial" ? "wallet" : "gold"} size={23} /></span>
            </div>
            <div className="balance-card__number" dir="ltr" aria-live="polite">
                {loading ? <span className="balance-skeleton" /> : error ? "—" : value}
                {!loading && !error && <span className="balance-card__unit">{unit}</span>}
            </div>
            <span className="balance-card__foot">{kind === "rial" ? "قابل استفاده برای خرید طلا" : "قابل استفاده برای فروش طلا"}</span>
        </section>
    );
}

export default function GoldTradingDashboard() {
    const [userId, setUserId] = useState("1");
    const [refreshKey, setRefreshKey] = useState(0);
    const [wallet, setWallet] = useState(null);
    const [loadingWallet, setLoadingWallet] = useState(true);
    const [walletError, setWalletError] = useState("");
    const [type, setType] = useState("buy");
    const [amount, setAmount] = useState("");
    const [price, setPrice] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/wallet", {
            method: "GET",
            headers: { Accept: "application/json", "X-User-Id": userId },
            cache: "no-store",
            signal: controller.signal,
        })
            .then(readApiResponse)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setWallet(data);
                    setWalletError("");
                }
            })
            .catch((error) => {
                if (!controller.signal.aborted) {
                    setWallet(null);
                    setWalletError(error.message || "ارتباط با سرور برقرار نشد.");
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoadingWallet(false);
            });
        return () => controller.abort();
    }, [userId, refreshKey]);

    const totalPreview = orderPreview(amount, price);
    const activeUser = DEMO_USERS.find((user) => user.id === userId);

    function changeUser(event) {
        setUserId(event.target.value);
        setWallet(null);
        setWalletError("");
        setLoadingWallet(true);
        setFormError("");
        setSuccess(null);
    }

    function refreshWallet() {
        setLoadingWallet(true);
        setWalletError("");
        setRefreshKey((value) => value + 1);
    }

    function changeType(nextType) {
        setType(nextType);
        setFormError("");
        setSuccess(null);
    }

    async function submitOrder(event) {
        event.preventDefault();
        if (submitting) return;

        setFormError("");
        setSuccess(null);
        const normalizedAmount = normalizeNumber(amount);
        const normalizedPrice = normalizeNumber(price);
        if (!totalPreview) {
            setFormError("مقدار طلا (حداکثر ۶ رقم اعشار) و قیمت صحیح و مثبت وارد کنید؛ مبلغ نهایی باید حداقل یک ریال باشد.");
            return;
        }
        if (!wallet || walletError) {
            setFormError("ابتدا موجودی کیف پول را دریافت کنید.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-User-Id": userId,
                },
                body: JSON.stringify({ type, amount: normalizedAmount, price: normalizedPrice }),
            });
            const data = await readApiResponse(response);
            if (!data.order || !data.wallet) {
                throw new Error("اطلاعات سفارش ثبت‌شده ناقص است.");
            }
            setWallet({ ...data.wallet, user_id: userId });
            setSuccess({
                ...data.order,
                userId,
            });
            setAmount("");
        } catch (error) {
            setFormError(error.message || "ثبت سفارش انجام نشد. دوباره تلاش کنید.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="site-shell">
            <header className="topbar">
                <div className="topbar__inner content-width">
                    <a className="brand" href="/" aria-label="گلد اوردر، صفحه اصلی">
                        <span className="brand__mark">G<span>✦</span></span>
                        <span className="brand__words"><strong>گُلد اوردر</strong><small>GOLD ORDER</small></span>
                    </a>
                    <div className="topbar__right">
                        <span className="environment"><span className="environment__dot" /> نسخه آزمایشی</span>
                        <span className="topbar__divider" />
                        <span className="topbar__caption">سامانه خرید و فروش طلا</span>
                    </div>
                </div>
            </header>

            <main className="content-width main-content">
                <div className="page-intro">
                    <div>
                        <div className="eyebrow"><span className="eyebrow__line" /> داشبورد دارایی</div>
                        <h1>طلا، به سادگی یک سفارش.</h1>
                        <p>موجودی خود را ببینید و خرید یا فروش طلا را در چند قدم ثبت کنید.</p>
                    </div>
                    <div className="user-picker">
                        <label htmlFor="demo-user">حساب آزمایشی</label>
                        <div className="user-picker__select">
                            <select id="demo-user" value={userId} onChange={changeUser} disabled={submitting}>
                                {DEMO_USERS.map((user) => <option key={user.id} value={user.id}>{user.label}</option>)}
                            </select>
                            <span className="user-picker__chevron" aria-hidden="true">⌄</span>
                        </div>
                    </div>
                </div>

                <section className="wallet-section" aria-labelledby="wallet-heading">
                    <div className="section-title-row">
                        <div>
                            <h2 id="wallet-heading">کیف پول شما</h2>
                            <p>موجودی لحظه‌ای {activeUser?.label || "کاربر"}</p>
                        </div>
                        <button className="refresh-button" type="button" onClick={refreshWallet} disabled={loadingWallet || submitting}>
                            <Icon name="refresh" size={17} className={loadingWallet ? "is-spinning" : ""} />
                            <span>به‌روزرسانی</span>
                        </button>
                    </div>
                    {walletError && (
                        <div className="alert alert--error wallet-alert" role="alert">
                            <Icon name="alert" size={19} />
                            <span>{walletError}</span>
                            <button type="button" onClick={refreshWallet}>تلاش دوباره</button>
                        </div>
                    )}
                    <div className="balances-grid">
                        <BalanceCard kind="rial" label="موجودی ریالی" value={formatWhole(wallet?.rial_balance)} unit="ریال" loading={loadingWallet} error={walletError} />
                        <BalanceCard kind="gold" label="موجودی طلا" value={formatGold(wallet?.gold_balance)} unit="گرم" loading={loadingWallet} error={walletError} />
                    </div>
                </section>

                <div className="workspace-grid">
                    <section className="order-panel" aria-labelledby="order-heading">
                        <div className="panel-heading">
                            <div>
                                <span className="panel-kicker">ثبت سفارش جدید</span>
                                <h2 id="order-heading">می‌خواهید چه کاری انجام دهید؟</h2>
                            </div>
                            <span className="panel-heading__accent" aria-hidden="true">✦</span>
                        </div>

                        <div className="order-tabs" role="group" aria-label="نوع سفارش">
                            <button type="button" className={type === "buy" ? "order-tabs__item is-active" : "order-tabs__item"} aria-pressed={type === "buy"} onClick={() => changeType("buy")} disabled={submitting}>خرید طلا</button>
                            <button type="button" className={type === "sell" ? "order-tabs__item is-active" : "order-tabs__item"} aria-pressed={type === "sell"} onClick={() => changeType("sell")} disabled={submitting}>فروش طلا</button>
                        </div>

                        <form onSubmit={submitOrder} noValidate>
                            <div className="field-group">
                                <label htmlFor="gold-amount">مقدار طلا</label>
                                <div className="field-shell">
                                    <input id="gold-amount" type="text" inputMode="decimal" autoComplete="off" placeholder="0.500000" dir="ltr" value={amount} onChange={(event) => { setAmount(event.target.value); setFormError(""); setSuccess(null); }} disabled={submitting} required aria-describedby="gold-amount-hint" />
                                    <span className="field-suffix">گرم</span>
                                </div>
                                <small id="gold-amount-hint">حداکثر ۶ رقم اعشار</small>
                            </div>
                            <div className="field-group">
                                <label htmlFor="gold-price">قیمت هر گرم طلا</label>
                                <div className="field-shell">
                                    <input id="gold-price" type="text" inputMode="numeric" autoComplete="off" placeholder="10000000" dir="ltr" value={price} onChange={(event) => { setPrice(event.target.value); setFormError(""); setSuccess(null); }} disabled={submitting} required />
                                    <span className="field-suffix">ریال</span>
                                </div>
                            </div>

                            <div className="total-box" aria-live="polite">
                                <span>مبلغ کل سفارش</span>
                                <strong dir="ltr">{totalPreview ? formatWhole(totalPreview) : "—"}<small> ریال</small></strong>
                            </div>

                            {formError && <div className="alert alert--error" role="alert"><Icon name="alert" size={19} /><span>{formError}</span></div>}
                            {success && (
                                <div className="alert alert--success" role="status">
                                    <Icon name="check" size={20} />
                                    <div>
                                        <strong>{success.type === "buy" ? "خرید" : "فروش"} با موفقیت ثبت شد.</strong>
                                        <span>سفارش شماره {persianDigits(success.id)} · {formatGold(success.amount)} گرم · {formatWhole(success.total_price)} ریال</span>
                                    </div>
                                </div>
                            )}

                            <button className={`submit-button ${type === "sell" ? "submit-button--sell" : ""}`} type="submit" disabled={submitting || loadingWallet || !wallet || Boolean(walletError)}>
                                {submitting ? "در حال ثبت سفارش..." : type === "buy" ? "ثبت سفارش خرید" : "ثبت سفارش فروش"}
                                {!submitting && <Icon name="arrow" size={19} />}
                            </button>
                        </form>
                    </section>

                    <aside className="side-stack">
                        <section className="summary-panel" aria-labelledby="summary-heading">
                            <div className="side-title"><span className="side-title__icon"><Icon name="wallet" size={19} /></span><h2 id="summary-heading">خلاصه سفارش</h2></div>
                            <div className="summary-list">
                                <div><span>نوع عملیات</span><strong>{type === "buy" ? "خرید طلا" : "فروش طلا"}</strong></div>
                                <div><span>مقدار طلا</span><strong>{validGoldAmount(amount) ? `${formatGold(normalizeNumber(amount))} گرم` : "—"}</strong></div>
                                <div><span>قیمت واحد</span><strong>{/^[1-9]\d{0,17}$/.test(normalizeNumber(price)) ? `${formatWhole(normalizeNumber(price))} ریال` : "—"}</strong></div>
                                <div className="summary-list__total"><span>مبلغ کل</span><strong>{totalPreview ? `${formatWhole(totalPreview)} ریال` : "—"}</strong></div>
                            </div>
                            <p className="summary-note">مبلغ نهایی با گرد کردن به نزدیک‌ترین ریال محاسبه می‌شود.</p>
                        </section>
                        <section className="info-panel">
                            <div className="info-panel__icon"><Icon name="shield" size={22} /></div>
                            <h3>تراکنش‌های قابل اطمینان</h3>
                            <p>ثبت سفارش‌ها در سرور با کنترل موجودی و تراکنش دیتابیس انجام می‌شود. موجودی پس از ثبت موفق به‌روزرسانی خواهد شد.</p>
                            <div className="info-panel__tag">محیط تست · بدون پرداخت واقعی</div>
                        </section>
                    </aside>
                </div>
            </main>

            <footer className="footer content-width">
                <span>© گلد اوردر · پروژه آزمایشی خرید و فروش طلا</span>
                <span>Laravel API + Next.js</span>
            </footer>
        </div>
    );
}
