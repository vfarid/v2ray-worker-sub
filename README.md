## اسکریپت ورکر برای ایجاد لینک ساب

محتوای فایل اسکریپت را از مسیر dist دانلود کرده و در ورکر خود کپی کنید.
ویدیو آموزشی را می‌توانید از لینک‌های زیر مشاهده کنید:

### یوتیوب

- [بخش اول، ساخت ورکر همراه آی‌پی تمیز](https://youtu.be/oxYoILJ9Hgk)
- [بخش دوم، اضافه کردن لینک ساب به ماسوری](https://youtu.be/Pq5FWdG31Yc)

### تلگرام

[ویدیوها و توضیحات در کانال تلگرام](https://t.me/vahidgeek/72)


نمونه‌ی مسیرهایی که بعد از ساخت ورکر باید در بخش ساب اپ کلاینت خود وارد کنید به شکل زیر می‌باشد. در این حالت بدون نیاز به آی‌پی تمیز، یک دامین اتفاقی از لیست دامین‌های تمیز انتخاب شده و روی برخی اوپراتورها با کیفیت قابل قبول پاسخ خواهد داد:

https://my-worker.my-id.workers.dev/sub


میتوانید در ادامه، کد سه حرفی اپراتور را وارد کنید تا آی‌پی تمیز اپراتور مربوطه به کانفیگ شما اضافه شود. برای مثال، همراه اول:

https://my-worker.my-id.workers.dev/sub/mci


لیست کدهای سه حرفی اپراتورها به شرح زیر است:

کد سه‌حرفی  | اپراتور      
---         | --- 
afn         | افرانت       
apt         | عصر تلکام    
ast         | آسیاتک       
dbn         | دیده‌بان     
dtk         | داتک    
fnv         | فن‌آوا        
hwb         | های‌وب        
mbt         | مبین‌نت       
mci         | همراه اول    
mkh         | مخابرات      
mtn         | ایرانسل      
prs         | پارس‌آنلاین    
psm         | پیشگامان    
rsp         | رسپینا       
rtl         | رایتل        
sht         | شاتل         
ztl         | زیتل
---         | ---


و یا لینک ساب را همراه آی‌پی تمیز در اپ خود اضافه کنید:

https://my-worker.my-id.workers.dev/sub/1.2.3.4

می‌توانید چند آی‌پی تمیز را با کاما جدا کنید. در این صورت برای هر آی‌پی تمیز به تعداد قید شده، کانفیک ترکیب شده با ورکر تحویل می دهد:

https://my-worker.my-id.workers.dev/sub/1.2.3.4,9.8.7.6

دقیقا با همین مدل می‌توانید دامین آی‌پی تمیز نیز استفاده کنید:

https://my-worker.my-id.workers.dev/sub/mci.ircf.space

می‌توانید از چند سابدامنین آیءی تمیز نیز استفاده کنید:

https://my-worker.my-id.workers.dev/sub/mci.ircf.space,my.domain.me

می‌توانید با متغیر max تعداد کانفیگ را مشخص کنید:

https://my-worker.my-id.workers.dev/sub?max=200

همچنین می‌توانید با متغیر original با عدد 0 یا 1 و یا با yes/no مشخص کنید که کانفیگ‌های اصلی (ترکیب نشده با ورکر) هم در خروجی آورده شوند یا نه:

https://my-worker.my-id.workers.dev/sub/1.2.3.4?max=200&original=yes

https://my-worker.my-id.workers.dev/sub?max=200&original=0

در صورت لزوم می توانید با متغیر merge مشخص کنید که کانفیگ‌های ترکیبی حذف شوند:

https://my-worker.my-id.workers.dev/sub?max=200&original=yes&merge=no

همچنین می‌توانید fp و alpn را نیز مشخص کنید:

https://my-worker.my-id.workers.dev/sub?max=200&fp=chrome&alpn=h2,http/1.1

لیست fp های قابل قبول:

ردیف | fp
---  | ---
 1   | chrome_auto
 2   | edge_auto
 3   | ios_auto
 4   | firefox_auto
 5   | qq_auto
 6   | android_11_okhttp
 7   | safari_auto
 8   | randomized
 9   | randomizedalpn
10   | randomizednoalpn
11   | firefox_55
12   | firefox_56
13   | firefox_63
14   | firefox_65
15   | firefox_99
16   | firefox_102
17   | firefox_105
18   | chrome_58
19   | chrome_62
20   | chrome_70
21   | chrome_72
22   | chrome_83
23   | chrome_87
24   | chrome_96
25   | chrome_100
26   | chrome_102
27   | ios_11_1
28   | ios_12_1
29   | ios_13
30   | ios_14
31   | edge_85
32   | edge_106
33   | safari_16_0
34   | 360_auto
35   | 360_7_5
36   | 360_11_0
37   | qq_11_1
---  | ---

لیست alpn های قابل قبول:

ردیف | alpn
---  | ---
1    | h2,http/1.1
2    | h2
3    | http/1.1
---  | ---


در صورت نیاز می‌توانید برای کانفیگ‌های اصلی، تعیین کنید که کدام نوع از کانفیگ‌ها را برای شما لیست کند:

https://my-worker.my-id.workers.dev/sub?max=200&type=vmess,ss,ssr,vless

همچنین در صورت نیاز می‌توانید لیست پرووایدرها را محدود کنید:

https://my-worker.my-id.workers.dev/sub?provider=mahdibland,vpei

لیست پرووایدرهای قابل قبول:

ردیف | fp
---  | ---
 1   | mahdibland
 2   | vpei
 3   | mfuu
 4   | peasoft
 5   | ermaozi
 6   | aiboboxx
 7   | pawdroid
 8   | autoproxy
 9   | freefq
---  | ---
