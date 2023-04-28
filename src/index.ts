/*!
  * v2ray Subscription Worker v1.5
  * Copyright 2023 Vahid Farid (https://twitter.com/vahidfarid)
  * Licensed under GPLv3 (https://github.com/vfarid/v2ray-worker-sub/blob/main/Licence.md)
  */

import { Buffer } from 'buffer'

const MAX_CONFIGS = 400
const INCLUDE_ORIGINAL = true

const subLinks: Record<string, string> = {
  freefq: "https://raw.githubusercontent.com/freefq/free/master/v2",
  pawdroid: "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
  aiboboxx: "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2",
  vpei: "https://raw.githubusercontent.com/vpei/Free-Node-Merge/main/o/node.txt",
  mfuu: "https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray",
  tbbatbb: "https://raw.githubusercontent.com/tbbatbb/Proxy/master/dist/v2ray.config.txt",
  auto1: "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription1",
  auto2: "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription2",
  // auto3: "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription3",
  // auto4: "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription4",
  // auto5: "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription5",
  // auto6: "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription6",
  // auto7: "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription7",
  // auto8: "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription8",
  ermaozi: "https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt",
  ermaozi01: "https://raw.githubusercontent.com/ermaozi01/free_clash_vpn/main/subscribe/v2ray.txt",
}

const cnfLinks: Record<string, string> = {
  bardiafa: "https://raw.githubusercontent.com/Bardiafa/Free-V2ray-Config/main/configs.txt",
  mahdibland1: "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/splitted/vmess.txt",
  mahdibland2: "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/splitted/trojan.txt",
  peasoft: "https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list_raw.txt",
}

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

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/|\/$/g, "")
    const parts = path.split("/")
    const type = parts[0].toLowerCase()
    if (type === "sub") {
      if (parts[1] !== undefined) {
        if (parts[1].includes(".")) { // Subdomain or IP
          cleanIP = parts[1].toLowerCase().trim()
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

      if (includeOriginalConfigs) {
        maxConfigs = Math.floor(maxConfigs / 2)
      }

      console.log(maxConfigs, includeOriginalConfigs)
      
      var configList: Array<string> = []
      var acceptableConfigList: Array<any> = []
      var finalConfigList: Array<any> = []

      for (const [name, subLink] of Object.entries(subLinks)) {
        try {
          const newConfigs = await fetch(subLink)
            .then(r => r.text())
            .then(a => atob(a))
            .then(t => t.split("\n"))
          configList = configList.concat(newConfigs.map((cnf: string) => cnf.trim()))
          acceptableConfigList.push({
            name: name,
            configs: newConfigs.filter(cnf => cnf.match(/^(vmess|vless|trojan):\/\//i))
          })
        } catch (e) { }
      }

      for (const [name, cnfLink] of Object.entries(cnfLinks)) {
        try {
          const newConfigs = await fetch(cnfLink)
            .then(r => r.text())
            .then(t => t.split("\n"))

            configList = configList.concat(newConfigs.map((cnf: string) => cnf.trim()))
            acceptableConfigList.push({
              name: name,
              configs: newConfigs.filter(cnf => cnf.match(/^(vmess|vless|trojan):\/\//))
            })
          } catch (e) { }
      }

      var ipList = []
      if (cleanIP) {
        operators = ["IP"]
        cleanIPs = [{ip: cleanIP, operator: "IP"}]
      }
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
              el.configs.map(decodeConfig)
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
        finalConfigList = finalConfigList.concat(getMultipleRandomElements(configList, maxConfigs))
      }

      return new Response(btoa(finalConfigList.join("\n")))
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
    این لینک sub را در اپ v2ray خود کپی کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub">https://${url.hostname}/sub</a>
  </p>
  <p>
    و یا همین لینک را همراه آی‌پی تمیز در اپ خود اضافه کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/1.2.3.4">https://${url.hostname}/sub/1.2.3.4</a>
  </p>
  <p>
    می‌توانید با متغیر max تعداد کانفیگ را مشخص کنید:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/1.2.3.4?max=200">https://${url.hostname}/sub/1.2.3.4?max=200</a>
  </p>
  <p>
    همچنین می‌توانید با متغیر original مشخص کنید که کانفیگ‌های ترکیب نشده با ورکر هم در خروجی آورده شوند:
  </p>
  <p>
    <a href="https://${url.hostname}/sub/1.2.3.4?max=200&original=1">https://${url.hostname}/sub/1.2.3.4?max=200&original=1</a>
  </p>
</body>`, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      })
    }
  }
}

// function encodeVmess(conf: string): string|null {
//   try {
//     return "vmess://" + btoa(JSON.stringify(conf))
//   } catch {
//     return null
//   }
// }

// function decodeVmess(conf: string): any {
//   try {
//     return JSON.parse(atob(conf.substr(8)))
//   } catch {
//     return {}
//   }
// }

function encodeConfig(conf: any): string|null {
  var configStr: string|null = null
  if (conf.protocol === "vmess") {
    delete conf.protocol
    configStr = "vmess://" + btoa(JSON.stringify(conf))
  } else if (["vless", "trojan"].includes(conf.protocol)) {
    configStr = `${conf.protocol}://${conf.id}@${conf.add}:${conf.port}?security=${conf.tls}&type=${conf.type}&path=${encodeURIComponent(conf.path)}&host=${encodeURIComponent(conf.host)}&tls=${conf.tls}&sni=${conf.sni}#${encodeURIComponent(conf.ps)}`;
  }
  return configStr
}

function decodeConfig(configStr: string): any {
  var match: any = null
  var conf: any = null
  if (configStr.startsWith("vmess://")) {
    conf = JSON.parse(atob(configStr.substring(8)))
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
        port: match.groups?.port,
        ps: match.groups.ps,
        type: optionsObj.type ?? 'tcp',
        host: optionsObj.host,
        path: optionsObj.path,
        security: optionsObj.security ?? 'none',
        sni: optionsObj.sni,
        alpn: optionsObj.alpn,
      }
    } catch (e) {
      console.log(e)
      return null
    }
  } else {
    return null
  }
}

function mixConfig(conf: any, url: URL, ip: string, operator: string, provider = "") {
  try {
    if (conf.tls != "tls") {
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

    conf.name = conf?.name ? conf.name : conf.ps
    if (provider) {
      conf.name = provider + "-" + conf.name
    }

    conf.name = conf.name + "-worker-" + operator.toLocaleLowerCase()
    conf.ps = conf.name
    conf.sni = url.hostname
    if (ip) {
      conf.add = ip
    } else {
      conf.add = addressList[Math.floor(Math.random() * addressList.length)]
    }

    if (!conf?.host) {
      conf.host = addr
    }

    conf.path = "/" + addr + ":" + conf.port + "/" + conf?.path.replace(/^\//g, "")
    conf.fp = fpList[Math.floor(Math.random() * fpList.length)]
    conf.alpn = alpnList[Math.floor(Math.random() * alpnList.length)]
    conf.port = 443
    return conf
  } catch (e) {
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

