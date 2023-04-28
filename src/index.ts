/*!
  * v2ray Subscription Worker v1.5
  * Copyright 2023 Vahid Farid (https://twitter.com/vahidfarid)
  * Licensed under GPLv3 (https://github.com/vfarid/v2ray-worker-sub/blob/main/Licence.md)
  */

const MAX_CONFIGS = 500
const INCLUDE_ORIGINAL = true

const configProviders: Array<any> = [
  {
    name: "vpei",
    type: "b64",
    urls: [
      "https://raw.githubusercontent.com/vpei/Free-Node-Merge/main/o/node.txt",
    ],
  },
  {
    name: "mfuu",
    type: "b64",
    urls: [
      "https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray",
    ],
  },
  {
    name: "peasoft",
    type: "raw",
    urls: [
      "https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list_raw.txt",
    ],
  },
  {
    name: "ermaozi",
    type: "b64",
    urls: [
      "https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt",
    ],
  },
  {
    name: "aiboboxx",
    type: "b64",
    urls: [
      "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2",
    ],
  },
  {
    name: "mahdibland",
    type: "raw",
    urls: [
      "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/splitted/vmess.txt",
      "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/splitted/trojan.txt",
    ],
  },
  {
    name: "bardiafa",
    type: "raw",
    urls: [
      "https://raw.githubusercontent.com/Bardiafa/Free-V2ray-Config/main/configs.txt",
    ],
  },
  {
    name: "autoproxy",
    type: "b64",
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
    urls: [
      "https://raw.githubusercontent.com/freefq/free/master/v2",
    ],
  },
  {
    name: "pawdroid",
    type: "b64",
    urls: [
      "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
    ],
  },
]

const ipProviderLink = "https://raw.githubusercontent.com/vfarid/cf-clean-ips/main/list.json"

const addressList = [
  "discord.com",
  "cloudflare.com",
  "nginx.com",
  "www.speedtest.com",
  "laravel.com",
  "chat.openai.com",
  "auth0.openai.com",
  "codepen.io",
  "api.jquery.com"
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

var operators: Array<string> = []
var cleanIPs: Array<any> = []
var cleanIP: string = ""
var maxConfigs: number = MAX_CONFIGS
var includeOriginalConfigs: boolean = INCLUDE_ORIGINAL

import { Buffer } from 'buffer'

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/|\/$/g, "")
    const parts = path.split("/")
    const type = parts[0].toLowerCase()
    if (type === "sub") {
      if (parts[1] !== undefined) {
        if (parts[1].includes(".")) { // Subdomain or IP
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

      if (url.searchParams.has('max')) {
        maxConfigs = parseInt(url.searchParams.get('max') as string)
        if (!maxConfigs) {
          maxConfigs = MAX_CONFIGS
        }
      }

      if (url.searchParams.has('original')) {
        const original = url.searchParams.get('original') as string
        includeOriginalConfigs = ["1", "true", "yes", "y"].includes(original.toLowerCase())
      }

      var configList: Array<any> = []
      var acceptableConfigList: Array<any> = []
      var finalConfigList: Array<any> = []
      var newConfigs: any

      for (const sub of configProviders) {
        try {
          newConfigs = []
          for (const link of sub.urls) {
            newConfigs.push(await fetch(link).then(r => r.text()))
            if (sub.type === "b64") {
              newConfigs = Buffer.from(newConfigs, "base64").toString("utf-8")
            }
          }
          newConfigs = newConfigs.join("\n").split("\n")
          acceptableConfigList.push({
            name: sub.name,
            configs: newConfigs.filter((cnf: any) => cnf.match(/^(vmess|vless|trojan):\/\//i))
          })
          if (includeOriginalConfigs) {
            configList.push({
              name: sub.name,
              configs: newConfigs.filter((cnf: any) => cnf.match(/^(vmess|vless|trojan|ss|ssr):\/\//i))
            })
          }
        } catch (e) { }
      }

      var ipList = []
      if (!cleanIPs.length) {
        operators = ["General"]
        cleanIPs = [{ip: "", operator: "General"}]
      }

      const configPerList = Math.ceil(maxConfigs / acceptableConfigList.length)
      for (const operator of operators) {
        var ipList = cleanIPs.filter(el => el.operator == operator).slice(0, 5)
        var ip = ipList[Math.floor(Math.random() * ipList.length)].ip
        for (const el of acceptableConfigList) {
          finalConfigList = finalConfigList.concat(
            getMultipleRandomElements(
              el.configs
                .map(decodeConfig)
                .map((cnf: any) => mixConfig(cnf, url, ip, operator, el.name))
                .filter((cnf: any) => (!!cnf && cnf.id))
                .map(encodeConfig)
                .filter((cnf: any) => !!cnf),
              configPerList
            )
          )
        }
      }
      if (includeOriginalConfigs) {
        for (const el of configList) {
          finalConfigList = finalConfigList.concat(
            getMultipleRandomElements(
              el.configs
                .map(decodeConfig)
                .map((cnf: any) => renameConfig(cnf, el.name))
                .filter((cnf: any) => (!!cnf && cnf.id))
                .map(encodeConfig)
                .filter((cnf: any) => !!cnf),
                configPerList
            )
          )
        }
      }
      // return new Response(finalConfigList.join("\n"))
      return new Response(Buffer.from(finalConfigList.join("\n"), "utf-8").toString("base64"))
    } else if (path) {
      var newUrl = new URL("https://" + url.pathname.replace(/^\/|\/$/g, ""))
      return fetch(new Request(newUrl, request))
    } else {
      return new Response(`\
<!DOCTYPE html>
<body dir="rtl">
  <h3><font color="green">همه چی درسته</font></h3>
  <p />
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
    <a href="https://${url.hostname}/sub/1.2.3.4?max=200">https://${url.hostname}/sub/1.2.3.4?max=200</a>
  </p>
  <p>
    همچنین می‌توانید با متغیر original با عدد 0 یا 1 و یا با yes/no مشخص کنید که کانفیگ‌های اصلی (ترکیب نشده با ورکر) هم در خروجی آورده شوند یا نه:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/1.2.3.4?max=200&original=yes">https://${url.hostname}/sub/1.2.3.4?max=200&original=yes</a>
  </p>
  <p>
    <a href="https://${url.hostname}/sub/1.2.3.4?max=200&original=0">https://${url.hostname}/sub/1.2.3.4?max=200&original=0</a>
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
      configStr = `${conf.protocol}://${conf.id}@${conf.add}:${conf.port}?security=${conf.tls}&type=${conf.type}&path=${encodeURIComponent(conf.path)}&host=${encodeURIComponent(conf.host)}&tls=${conf.tls}&sni=${conf.sni}#${encodeURIComponent(conf.ps)}`;
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
    conf = JSON.parse(Buffer.from(configStr.substring(8), "base64").toString("utf-8"))
    conf.protocol = "vmess"
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
        type: optionsObj.type ?? "tcp",
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
    if (conf.tls != "tls") {
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
        conf.port = addr[1]
        addr = addr[0]
        path = "/" + part2.replace(/^\//g, "")
      } else if (part2.includes(":")) {
        addr = part2.replace(/^\//g, "").split(":")
        conf.port = addr[1]
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
      conf.add = addressList[Math.floor(Math.random() * addressList.length)]
    }

    if (!conf?.host) {
      conf.host = addr
    }

    conf.path = "/" + addr + ":" + conf.port + (conf?.path ? "/" + conf.path.replace(/^\//g, "") : "")
    conf.fp = fpList[Math.floor(Math.random() * fpList.length)]
    conf.alpn = alpnList[Math.floor(Math.random() * alpnList.length)]
    conf.port = 443
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
  var shuffled = [...arr].sort(() => 0.5 - Math.random())
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
