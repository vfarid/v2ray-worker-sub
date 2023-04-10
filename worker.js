//  اسکریپت ورکر برای ایجاد لینک ساب
//  نمونه‌ی مسیرهایی که بعد از ساخت ورکر باید در بخش ساب اپ کلاینت خود وارد کنید به شکل زیر می‌باشد
//  https://my-worker.my-id.workers.dev/sub
//
//  میتوانید در ادامه، کد سه حرفی اپراتور را وارد کنید تا آی‌پی تمیز اپراتور مربوطه به کانفیگ شما اضافه شود. برای مثال، همراه اول
//  https://my-worker.my-id.workers.dev/sub/mci
//  لیست کدهای سه حرفی اپراتورها به شرح زیر است
//  mci/mtn/afn/apt/arx/ask/ast/dbn/fnv/hwb/mbt/mkh/prs/psm/rsp/rtl/sht/ztl
//
//  می توانید در انتهای لیسک، آی‌پی تمیز خود را قراردهید مثل زیر
//  https://my-worker.my-id.workers.dev/sub/162.159.135.87
//
//  و یا می توانید آدرس دامین آی‌پی تمیز خود را بدهید
//  https://my-worker.my-id.workers.dev/sub/ip.my-domain.com
//
//  در صورتی که از دامنه‌ی شخصی برای ورکر استفاده می کنید هم به همین شکل، فقط به جای دامین ورکر از سابدامین خودتان استفاده کنید
//  https://my-worker.my-domain.com/sub


//  تعداد کانفیگ از هر نوع را در این متغیر بنویسید
const maxPerType = 400

//  در صورتی که میخواهید کانفیگ‌های اصلی (قبل از ترکیب با ورکر) هم در خروجی آورده شود این متغیر را با عدد 1 مقداردهی کنید
//  در صورتی که ورکر شما فیلتر نیست و یا از سابدامین شخصی برای ورکر استفاده می‌کنید بهتر است این متغیر مقدار 0 داشته باشد
//  در صورتی که این مقدار صفر باشد تنها کانفیگ‌های ترکیب شده با ورکر در خروجی خواهد آمد
const includeOriginalConfigs = 0

//  در صورتی که خودتان کانفیگ هایی دارید و می‌خواهید فقط کانفیگ‌های خودتان در خروجی آورده شود، این متغیر را با عدد 1 مقداردهی کنید
const onlyUseMyConfigs = 0

//  این بخش حاوی لینک ساب های تامین کننده‌ی کانفیک می باشد. نیازی نیست این قسمت تغییر داده شود
const subLinks = [
  "https://raw.githubusercontent.com/freefq/free/master/v2",
  "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
  "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2",
  "https://raw.githubusercontent.com/AzadNetCH/Clash/main/V2Ray.txt",
  "https://raw.githubusercontent.com/vpei/Free-Node-Merge/main/o/node.txt"
]

//  این بخش حاوی لینک لیست های تامین کننده‌ی کانفیک می باشد. نیازی نیست این قسمت تغییر داده شود
const cnfLinks = [
  "https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/sub/sub_merge.txt",
  "https://raw.githubusercontent.com/awesome-vpn/awesome-vpn/master/all"
]

//  در این بخش می‌توانید کانفیگ‌های خود را وارد کنید. این کانفیگ ها را میتوانید از سایتهای رایگان بگیرید
//  اگر نمیدانید این بخش چه کاربردی برای شما دارد، آن را بدون تغییر رها کنید
//  توجه داشته باشید که هر کانفیگ باید در یک خط و داخل گیومه آورده شود و انتهای آن ویرگول قرار داده شود
//  سطر آخر نباید ویرگول در انتهای خود داشته باشد، مانند نمونه‌ی زیر. قبل از قراردادن کانفیگ‌های خود، نمونه ها را پاک کنید
//  **** ONLY VMESS ****
const myConfigs = [
  // "vmess://....",
  // "vmess://...."
]


//  ------------------------------------------------------------------------------------------------------------------------------
//  | به این متغیرها و کدی که در ادامه آمده دست نزنید، مگر اینکه برنامه نویسی جاوا اسکریپت را بلد بوده و دانسته آن را تغییر دهید |
//  ------------------------------------------------------------------------------------------------------------------------------

const ipProviderLink = "https://raw.githubusercontent.com/vfarid/cf-clean-ips/main/list.json"

const addressList = [
  "discord.com",
  "cloudflare.com",
  "nginx.com",
  "www.speedtest.com"
]

const fpList = [
  "chrome",
  "chrome",
  "chrome",
  "firefox",
  "safari",
  "edge",
  "ios",
  "android",
  "random",
  "random"
]

const alpnList = [
  "http/1.1",
  "h2,http/1.1",
  "h2,http/1.1"
]

var operators = []
var cleanIPs = []
var cleanIP = ''

export default {
  async fetch(request) {
    var url = new URL(request.url)
    var pathParts = url.pathname.replace(/^\/|\/$/g, "").split("/")
    var type = pathParts[0].toLowerCase()
    if (type == 'sub') {
      if (pathParts[1] !== undefined) {
        if (pathParts[1].includes(".")) { // Subdomain or IP
          cleanIP = pathParts[1].toLowerCase().trim()
        } else { // Operator code
          try {
            operators = pathParts[1].toUpperCase().trim().split(",")
            cleanIPs = await fetch(ipProviderLink).then(r => r.json()).then(j => j.ipv4)
            cleanIPs = cleanIPs.filter(el => operators.includes(el.operator))
          } catch (e) { console.log(e) }
        }
      }

      var configList = []
      if (!onlyUseMyConfigs) {
        for (var subLink of subLinks) {
          try {
            configList = configList.concat(await fetch(subLink).then(r => r.text()).then(a => atob(a)).then(t => t.split("\n")))
          } catch (e) { }
        }
        for (var cnfLink of cnfLinks) {
          try {
            configList = configList.concat(await fetch(cnfLink).then(r => r.text()).then(t => t.split("\n")))
          } catch (e) { }
        }
      }

      var vmessConfigList = configList.filter(cnf => (cnf.search("vmess://") == 0))
      var trojanConfigList = configList.filter(cnf => (cnf.search("trojan://") == 0))
      var ssConfigList = configList.filter(cnf => (cnf.search("ss://") == 0))
      var finalConfigList = []

      if (includeOriginalConfigs) {
        finalConfigList = finalConfigList.concat(getMultipleRandomElements(vmessConfigList, maxPerType))
      }

      var ipList = []
      if (cleanIP) {
        operators = ["GEN"]
        cleanIPs = [{ip: cleanIP, operator: "GEN"}]
      }
      if (!cleanIPs.length) {
        operators = ["COM"]
        cleanIPs = [{ip: "", operator: "COM"}]
      }

      for (var operator of operators) {
        var ipList = cleanIPs.filter(el => el.operator == operator).slice(0, 10)
        var ip = ipList[Math.floor(Math.random() * ipList.length)].ip
        finalConfigList = finalConfigList.concat(
          getMultipleRandomElements(
            vmessConfigList.map(decodeVmess).map(cnf => mixConfig(cnf, url, "vmess", ip, operator)).filter(cnf => (!!cnf && cnf.id)).map(encodeVmess).filter(cnf => !!cnf),
            maxPerType
          )
        )
        if (myConfigs.length) {
          finalConfigList = finalConfigList.concat(
            myConfigs.map(decodeVmess).map(cnf => mixConfig(cnf, url, "vmess", ip, operator)).filter(cnf => (!!cnf && cnf.id)).map(encodeVmess).filter(cnf => !!cnf)
          )
        }
      }

      if (includeOriginalConfigs) {
        finalConfigList = finalConfigList.concat(getMultipleRandomElements(trojanConfigList, maxPerType))
        finalConfigList = finalConfigList.concat(getMultipleRandomElements(ssConfigList, maxPerType))
      }

      return new Response(btoa(finalConfigList.join("\n")))
    } else {
      var url = new URL(request.url)
      var newUrl = new URL("https://" + url.pathname.replace(/^\/|\/$/g, ""))
      return fetch(new Request(newUrl, request))
    }
  }
}

function encodeVmess(conf) {
  try {
    return "vmess://" + btoa(JSON.stringify(conf))
  } catch {
    return null
  }
}

function decodeVmess(conf) {
  try {
    return JSON.parse(atob(conf.substr(8)))
  } catch {
    return {}
  }
}

function mixConfig(conf, url, protocol, ip, operator) {
  try {
    if (conf.tls != "tls") {
      return {}
    }
    var addr = conf.sni
    if (!addr) {
      if (conf.add && !isIp(conf.add)) {
        addr = conf.add
      } else if (conf.host && !isIp(conf.host)) {
        addr = conf.host
      }
    }
    if (!addr) {
      return {}
    }
    conf.name = (conf.name ? conf.name : conf.ps) + '-Worker-' + operator
    conf.ps = conf.name
    conf.sni = url.hostname
    if (ip) {
      conf.add = ip
    } else {
      conf.add = addressList[Math.floor(Math.random() * addressList.length)]
    }

    if (protocol == "vmess") {
      conf.sni = url.hostname
      conf.host = url.hostname
      if (conf.path == undefined) {
        conf.path = ""
      }
      conf.path = "/" + addr + ":" + conf.port + "/" + conf.path.replace(/^\//g, "")
      conf.fp = fpList[Math.floor(Math.random() * fpList.length)]
      conf.alpn = alpnList[Math.floor(Math.random() * alpnList.length)]
      conf.port = 443
    }
    return conf
  } catch (e) {
    return {}
  }
}

function getMultipleRandomElements(arr, num) {
  var shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, num)
}

function isIp(str) {
  try {
    if (str == "" || str == undefined) return false
    if (!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){2}\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-4])$/.test(str)) {
      return false
    }
    var ls = str.split('.')
    if (ls == null || ls.length != 4 || ls[3] == "0" || parseInt(ls[3]) === 0) {
      return false
    }
    return true
  } catch (e) { }
  return false
}
