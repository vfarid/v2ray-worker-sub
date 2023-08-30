/*!
  * v2ray Subscription Worker v1.6
  * Copyright 2023 Vahid Farid (https://twitter.com/vahidfarid)
  * Licensed under GPLv3 (https://github.com/vfarid/v2ray-worker-sub/blob/main/Licence.md)
  */

const MAX_CONFIGS: number = 200
const INCLUDE_ORIGINAL: boolean = false
const ONLY_ORIGINAL: boolean = false
const SELECTED_TYPES: Array<string> = ["vmess", "vless", "trojan"]
const SELECTED_PROVIDERS: Array<string> = []

const configProviders: Array<any> = [
  {
    name: "vpei",
    type: "b64",
    random: true,
    urls: [
      "https://raw.githubusercontent.com/vpei/Free-Node-Merge/main/o/node.txt",
    ],
  },
  {
    name: "mfuu",
    type: "b64",
    random: true,
    urls: [
      "https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray",
    ],
  },
  {
    name: "peasoft",
    type: "raw",
    random: true,
    urls: [
      "https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list_raw.txt",
    ],
  },
  {
    name: "ermaozi",
    type: "b64",
    random: true,
    urls: [
      "https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt",
    ],
  },
  {
    name: "aiboboxx",
    type: "b64",
    random: true,
    urls: [
      "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2",
    ],
  },
  {
    name: "mahdibland",
    type: "raw",
    random: false,
    urls: [
      "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/splitted/vmess.txt",
      "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/splitted/trojan.txt",
    ],
  },
  {
    name: "autoproxy",
    type: "b64",
    random: true,
    urls: [
      "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription1",
      "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription2",
      "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription3",
      "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription4",
      "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription5",
      "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription6",
      "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription7",
      "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription8",
    ],
  },
  {
    name: "freefq",
    type: "b64",
    random: true,
    urls: [
      "https://raw.githubusercontent.com/freefq/free/master/v2",
    ],
  },
  {
    name: "pawdroid",
    type: "b64",
    random: true,
    urls: [
      "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
    ],
  },
  // {
  //   name: "rescuenet",
  //   type: "raw",
  //   random: true,
  //   urls: [
  //     "https://raw.githubusercontent.com/RescueNet/TelegramFreeServer/main/Raw/All_Sub",
  //   ],
  // },
]

const ipProviderLink = "https://raw.githubusercontent.com/vfarid/cf-clean-ips/main/list.json"

var selectedTypes: Array<string> = SELECTED_TYPES
var selectedProviders: Array<string> = SELECTED_PROVIDERS
var operators: Array<string> = []
var cleanIPs: Array<any> = []
var maxConfigs: number = MAX_CONFIGS
var includeOriginalConfigs: boolean = INCLUDE_ORIGINAL
var onlyOriginalConfigs: boolean = ONLY_ORIGINAL

var alpnList: Array<string> = [
  "h2,http/1.1",
  "h2,http/1.1",
  "h2,http/1.1",
  "http/1.1",
]

var fpList: Array<string> = [
  "chrome",
  "chrome",
  "chrome",
  "firefox",
  "safari",
  "edge",
  "ios",
  "android",
  "random"
]

var domainList: Array<string> = [
  "discord.com",
  "laravel.com",
  "cdnjs.com",
  "www.speedtest.net",
  "workers.dev",
  "nginx.com",
  "chat.openai.com",
  "auth0.openai.com",
  "codepen.io",
  "api.jquery.com"
]

import { Buffer } from 'buffer'

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/|\/$/g, "")
    const parts = path.split("/")
    const type = parts[0].toLowerCase()
    if (type === "sub") {
      if (parts[1] !== undefined) {
        if (parts[1].includes(".") || parts[1].includes(":")) { // Subdomain or IP
          cleanIPs = parts[1].toLowerCase().trim().split(",").map((ip: string) => {return {ip: ip, operator: "IP"}})
          operators = ["IP"]
        } else { // Operator code
          try {
            operators = parts[1].toUpperCase().trim().split(",")
            cleanIPs = await fetch(ipProviderLink)
              .then((r: Response) => r.json())
              .then((j: any) => j.ipv4)
            cleanIPs = cleanIPs.filter((el: any) => operators.includes(el.operator))
          } catch (e) { }
        }
      }

      if (url.searchParams.has("max")) {
        maxConfigs = parseInt(url.searchParams.get("max") as string)
        if (!maxConfigs) {
          maxConfigs = MAX_CONFIGS
        }
      }

      if (url.searchParams.has("original")) {
        const original = url.searchParams.get("original") as string
        includeOriginalConfigs = ["1", "true", "yes", "y"].includes(original.toLowerCase())
      }

      if (includeOriginalConfigs && url.searchParams.has("merge")) {
        const merge = url.searchParams.get("merge") as string
        onlyOriginalConfigs = !["1", "true", "yes", "y"].includes(merge.toLowerCase())
      }

      if (url.searchParams.has("fp")) {
        fpList = [(url.searchParams.get("fp") as string).toLocaleLowerCase().trim()]
      }

      if (url.searchParams.has("alpn")) {
        alpnList = [(url.searchParams.get("alpn") as string).toLocaleLowerCase().trim()]
      }

      if (url.searchParams.has("type")) {
        selectedTypes = (url.searchParams.get("type") as string).toLocaleLowerCase().split(",").map((s: string) => s.trim())
      }

      if (url.searchParams.has("provider")) {
        selectedProviders = (url.searchParams.get("provider") as string).toLocaleLowerCase().split(",").map((s: string) => s.trim())
      }

      if (includeOriginalConfigs && !onlyOriginalConfigs) {
        maxConfigs = Math.floor(maxConfigs / 2)
      }

      var configList: Array<any> = []
      var acceptableConfigList: Array<any> = []
      var finalConfigList: Array<any> = []
      var newConfigs: any
      const configPerList = Math.floor(maxConfigs / configProviders.length)

      for (const sub of configProviders) {
        try {
          if (selectedProviders.length > 0 && !selectedProviders.includes(sub.name)) {
            continue
          }
          newConfigs = []
          for (const link of sub.urls) {
            var content: string = await fetch(link).then(r => r.text())
            if (sub.type === "b64") {
              content = Buffer.from(content, "base64").toString("utf-8")
            }
            newConfigs.push(content)
          }
          newConfigs = newConfigs.join("\n").split("\n")
          if (!onlyOriginalConfigs) {
            acceptableConfigList.push({
              name: sub.name,
              random: sub.random,
              count: configPerList,
              configs: newConfigs.filter((cnf: any) => cnf.match(/^(vmess|vless|trojan):\/\//i)),
              mergedConfigs: null,
            })
          }
          if (includeOriginalConfigs) {
            configList.push({
              name: sub.name,
              random: sub.random,
              count: configPerList,
              configs: newConfigs.filter((cnf: any) => cnf.match(new RegExp(`(${selectedTypes.join("|")})`, "i"))),
              renamesConfigs: null,
            })
          }
        } catch (e) { }
      }

      var ipList = []
      if (!cleanIPs.length) {
        operators = ["General"]
        cleanIPs = [{ip: "", operator: "General"}]
      }

      for (const operator of operators) {
        var ipList = cleanIPs.filter(el => el.operator == operator).slice(0, 5)
        var ip = ipList[Math.floor(Math.random() * ipList.length)].ip
        for (const i in acceptableConfigList) {
          const el = acceptableConfigList[i]
          acceptableConfigList[i].mergedConfigs = el.configs
            .map(decodeConfig)
            .map((cnf: any) => mixConfig(cnf, url, ip, operator, el.name))
            .filter((cnf: any) => (!!cnf && cnf.id))
            .map(encodeConfig)
            .filter((cnf: any) => !!cnf)
        }
        var remaining = 0
        for (var i = 0; i < 5; i++) {
          for (const el of acceptableConfigList) {
            if (el.count > el.mergedConfigs.length) {
              remaining = remaining + el.count - el.mergedConfigs.length
              el.count = el.mergedConfigs.length
            } else if (el.count < el.mergedConfigs.length && remaining > 0) {
              el.count = el.count + Math.ceil(remaining / 3)
              remaining = remaining - Math.ceil(remaining / 3)
            }
          }
        }
        for (const el of acceptableConfigList) {
          finalConfigList = finalConfigList.concat(
            el.random ? getMultipleRandomElements(el.mergedConfigs, el.count) : el.mergedConfigs.slice(0, el.count)
          )
        }
      }
      if (includeOriginalConfigs) {
        for (const i in configList) {
          const el = configList[i]
          configList[i].renamedConfigs = el.configs
            .map(decodeConfig)
            .map((cnf: any) => renameConfig(cnf, el.name))
            .filter((cnf: any) => (!!cnf && cnf.id))
            .map(encodeConfig)
            .filter((cnf: any) => !!cnf)
        }
        var remaining = 0
        for (var i = 0; i < 5; i++) {
          for (const el of configList) {
            if (el.count > el.renamedConfigs.length) {
              remaining = remaining + el.count - el.renamedConfigs.length
              el.count = el.renamedConfigs.length
            } else if (el.count < el.renamedConfigs.length && remaining > 0) {
              el.count = el.count + Math.ceil(remaining / 3)
              remaining = remaining - Math.ceil(remaining / 3)
            }
          }
        }
        for (const el of configList) {
          finalConfigList = finalConfigList.concat(
            el.random ? getMultipleRandomElements(el.renamedConfigs, el.count) : el.renamedConfigs.slice(0, el.count)
          )
        }
      }
      // return new Response(finalConfigList.join("\n"))
      return new Response(Buffer.from(finalConfigList.join("\n"), "utf-8").toString("base64"))
    } else if (path) {
      const addrPath = url.pathname.replace(/^\/|\/$/g, "")
      const newUrl = new URL("https://" + addrPath)
      return fetch(new Request(newUrl, request))
    } else {
      return new Response(`\
<!DOCTYPE html>
<body dir="rtl">
  <h3><font color="green">همه چی درسته</font></h3>
  <p />
  <p>
    این لینک sub را در اپ v2ray خود به شکل زیر کپی کنید. در این صورت یک دامین اتفاقی از خود ورکر به عنوان آی‌پی تمیز انتخاب شده و روی بیشتر اوپراتورها با کیفیت خوب پاسخ خواهد داد:
  </p>
  <p>
    <a href="https://${url.hostname}/sub">https://${url.hostname}/sub</a>
  </p>
  <p>
    این لینک sub را همراه با کد اپراتور در اپ v2ray خود کپی کنید. برای مثال در همراه اول به شکل زیر خواهد بود:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/mci">https://${url.hostname}/sub/mci</a>
  </p>
  <p>
    و یا همین لینک را همراه آی‌پی تمیز در اپ خود اضافه کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/1.2.3.4">https://${url.hostname}/sub/1.2.3.4</a>
  </p>
  <p>
    می‌توانید چند آی‌پی تمیز را با کاما جدا کنید. در این صورت برای هر آی‌پی تمیز به تعداد قدید شده، کانفیک ترکیب شده با ورکر تحویل می دهد:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/1.2.3.4,9.8.7.6">https://${url.hostname}/sub/1.2.3.4,9.8.7.6</a>
  </p>
  <p>
    دقیقا با همین مدل می‌توانید دامین آی‌پی تمیز نیز استفاده کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/mci.ircf.space">https://${url.hostname}/sub/mci.ircf.space</a>
  </p>
  <p>
    می‌توانید از چند سابدامنین آیءی تمیز نیز استفاده کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/mci.ircf.space,my.domain.me">https://${url.hostname}/sub/mci.ircf.space,my.domain.me</a>
  </p>
  <p>
    می‌توانید با متغیر max تعداد کانفیگ را مشخص کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub?max=200">https://${url.hostname}/sub?max=200</a>
  </p>
  <p>
    همچنین می‌توانید با متغیر original با عدد 0 یا 1 و یا با yes/no مشخص کنید که کانفیگ‌های اصلی (ترکیب نشده با ورکر) هم در خروجی آورده شوند یا نه:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/1.2.3.4?max=200&original=yes">https://${url.hostname}/sub/1.2.3.4?max=200&original=yes</a>
  </p>
  <p>
    <a href="https://${url.hostname}/sub?max=200&original=0">https://${url.hostname}/sub?max=200&original=0</a>
  </p>
  <p>
    در صورت لزوم می توانید با متغیر merge مشخص کنید که کانفیگ‌های ترکیبی حذف شوند:
  </p>
  <p>
    <a href="https://${url.hostname}/sub?max=200&original=yes&merge=no">https://${url.hostname}/sub?max=200&original=yes&merge=no</a>
  </p>
  <p>
    همچنین می‌توانید fp و alpn را نیز مشخص کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub?max=200&fp=chrome&alpn=h2,http/1.1">https://${url.hostname}/sub?max=200&fp=chrome&alpn=h2,http/1.1</a>
  </p>
  <p>
    در صورت نیاز می‌توانید برای کانفیگ‌های اصلی، تعیین کنید که کدام نوع از کانفیگ‌ها را برای شما لیست کند:
  </p>
  <p>
    <a href="https://${url.hostname}/sub?max=200&type=vmess,ss,ssr,vless">https://${url.hostname}/sub?max=200&type=vmess,ss,ssr,vless</a>
  </p>
  <p>
    در صورت نیاز می‌توانید لیست پرووایدرها را محدود کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub?provider=mahdibland,vpei">https://${url.hostname}/sub?provider=mahdibland,vpei</a>
  </p>
</body>`, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      })
    }
  }
}

function encodeConfig(conf: any): string|null {
  var configStr: string|null = null
  
  try {
    if (conf.protocol === "vmess") {
      delete conf.protocol
      configStr = "vmess://" + Buffer.from(JSON.stringify(conf), "utf-8").toString("base64")
    } else if (["vless", "trojan"].includes(conf?.protocol)) {
      configStr = `${conf.protocol}://${conf.id}@${conf.add}:${conf.port}?security=${conf.tls}&type=${conf.net}&path=${encodeURIComponent(conf.path)}&host=${encodeURIComponent(conf.host)}&tls=${conf.tls}&sni=${conf.sni}#${encodeURIComponent(conf.ps)}`;
    }
  } catch (e) {
    // console.log(`Failed to encode ${JSON.stringify(conf)}`, e)
  }

  return configStr
}

function decodeConfig(configStr: string): any {
  var match: any = null
  var conf: any = null
  if (configStr.startsWith("vmess://")) {
    try {
      conf = JSON.parse(Buffer.from(configStr.substring(8), "base64").toString("utf-8"))
      conf.protocol = "vmess"
    } catch (e) { }
  } else if (match = configStr.match(/^(?<protocol>trojan|vless):\/\/(?<id>.*)@(?<add>.*):(?<port>\d+)\??(?<options>.*)#(?<ps>.*)$/)) {
    try {
      const optionsArr = match.groups.options.split('&') ?? []
      const optionsObj = optionsArr.reduce((obj: Record<string, string>, option: string) => {
        const [key, value] = option.split('=')
        obj[key] = decodeURIComponent(value)
        return obj
      }, {} as Record<string, string>)

      conf = {
        protocol: match.groups.protocol,
        id: match.groups.id,
        add: match.groups?.add,
        port: match.groups.port ?? 443,
        ps: match.groups?.ps,
        net: optionsObj.type ?? (optionsObj.net ?? "tcp"),
        host: optionsObj?.host,
        path: optionsObj?.path,
        tls: optionsObj.security ?? "none",
        sni: optionsObj?.sni,
        alpn: optionsObj?.alpn,
      }
    } catch (e) {
      // console.log(`Failed to decode ${configStr}`, e)
    }
  }
  return conf
}

function mixConfig(conf: any, url: URL, ip: string, operator: string, provider: string) {
  try {
    if (conf.tls != "tls" || conf.net == "tcp") {
      // console.log(`notls ${JSON.stringify(conf)}`)
      return {}
    }

    var addr = conf.sni
    if (!addr) {
      if (conf.host && !isIp(conf.host)) {
        addr = conf.host
      } else if (conf.add && !isIp(conf.add)) {
        addr = conf.add
      }
    }
    if (!addr) {
      // console.log(`noaddress ${JSON.stringify(conf)}`)
      return {}
    }

    if (addr.endsWith('.workers.dev')) {
      // Already merged with worker
      const part1 = conf.path.split("/").pop()
      const part2 = conf.path.substring(0, conf.path.length - part1.length - 1)
      var path
      if (part1.includes(":")) {
        addr = part1.replace(/^\//g, "").split(":")
        conf.port = parseInt(addr[1])
        addr = addr[0]
        path = "/" + part2.replace(/^\//g, "")
      } else if (part2.includes(":")) {
        addr = part2.replace(/^\//g, "").split(":")
        conf.port = parseInt(addr[1])
        addr = addr[0]
        path = "/" + part1.replace(/^\//g, "")
      } else if (part1.includes(".")) {
        addr = part1.replace(/^\//g, "")
        conf.port = 443
        path = "/" + part2.replace(/^\//g, "")
      } else {
        addr = part2.replace(/^\//g, "")
        conf.port = 443
        path = "/" + part1.replace(/^\//g, "")
      }
      conf.path = path
    }

    conf.ps = conf?.ps ? conf.ps : conf.name
    if (provider) {
      conf.ps = provider + "-" + conf.ps
    }

    conf.ps = conf.ps + "-worker-" + operator.toLocaleLowerCase()
    conf.name = conf.ps
    conf.host = url.hostname
    conf.sni = url.hostname
    if (ip) {
      conf.add = ip
    } else {
      conf.add = domainList[Math.floor(Math.random() * domainList.length)]
    }

    if (conf?.port != 443) {
      return {}
    }

    // conf.path = "/" + addr + ":" + conf.port + (conf?.path ? "/" + conf.path.replace(/^\//g, "") : "")
    conf.path = "/" + addr + (conf?.path ? "/" + conf.path.replace(/^\//g, "") : "")
    conf.alpn = alpnList[Math.floor(Math.random() * alpnList.length)]
    conf.fp = fpList[Math.floor(Math.random() * fpList.length)]
    conf.utls = conf.fp
    // conf.port = 443
    return conf
  } catch (e) {
    // console.log(`Failed to merge config ${JSON.stringify(conf)}`, e)
    return {}
  }
}

function renameConfig(conf: any, provider: string) {
  try {
    conf.ps = conf?.ps ? conf.ps : conf.name
    conf.ps = provider + "-" + conf.ps
    return conf
  } catch (e) {
    // console.log(`Failed to rename config ${JSON.stringify(conf)}`, e)
    return {}
  }
}

function getMultipleRandomElements(arr: Array<any>, num: number) {
  var shuffled = arr.slice(0, num * 2).sort(() => 0.5 - Math.random())
  return shuffled.slice(0, num)
}

function isIp(str: string) {
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
