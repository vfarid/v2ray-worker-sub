/*!
  * v2ray Subscription Worker v1.4
  * Copyright 2023 Vahid Farid (https://twitter.com/vahidfarid)
  * Licensed under GPLv3 (https://github.com/vfarid/v2ray-worker-sub/blob/main/Licence.md)
  */

const maxConfigs = 100
const includeOriginalConfigs = 0
const onlyUseMyConfigs = 0
const subLinks = {
  // freefq: "https://raw.githubusercontent.com/freefq/free/master/v2",
  // pawdroid: "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
  // aiboboxx: "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2",
  // azadnetch: "https://raw.githubusercontent.com/AzadNetCH/Clash/main/V2Ray.txt",
  vpei: "https://raw.githubusercontent.com/vpei/Free-Node-Merge/main/o/node.txt",
  mfuu: "https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray",
}
const cnfLinks = {
  mahdibland: "https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/sub/sub_merge.txt",
  // awesomevpn: "https://raw.githubusercontent.com/awesome-vpn/awesome-vpn/master/all",
}
const myConfigs: Array<string> = []
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

var operators: Array<any> = []
var cleanIPs: Array<any> = []
var cleanIP = ''


export default {
  async fetch(request: Request): Promise<Response> {
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
            cleanIPs = await fetch(ipProviderLink)
              .then((r: Response) => r.json())
              .then((j: any) => j.ipv4)
            cleanIPs = cleanIPs.filter((el: any) => operators.includes(el.operator))
          } catch (e) { }
        }
      }

      var configList: Array<string> = []
      var vmessConfigList: Array<any> = []
      var finalConfigList: Array<any> = []
      if (!onlyUseMyConfigs) {
        for (const [name, subLink] of Object.entries(subLinks)) {
          try {
            const newConfigs = await fetch(subLink)
              .then(r => r.text())
              .then(a => atob(a))
              .then(t => t.split("\n"))
            
            configList = configList.concat(newConfigs)
            vmessConfigList.push({
              name: name,
              configs: newConfigs.filter(cnf => (cnf.search("vmess://") == 0))
            })
          } catch (e) { }
        }

        for (const [name, cnfLink] of Object.entries(cnfLinks)) {
          try {
            const newConfigs = await fetch(cnfLink)
              .then(r => r.text())
              .then(t => t.split("\n"))

              configList = configList.concat(newConfigs)
              vmessConfigList.push({
                name: name,
                configs: newConfigs.filter(cnf => (cnf.search("vmess://") == 0))
              })
            } catch (e) { }
        }
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

      const configPerList = Math.ceil(maxConfigs / vmessConfigList.length)
      for (const operator of operators) {
        var ipList = cleanIPs.filter(el => el.operator == operator).slice(0, 10)
        var ip = ipList[Math.floor(Math.random() * ipList.length)].ip

        for (const el of vmessConfigList) {
          finalConfigList = finalConfigList.concat(
            getMultipleRandomElements(
              el.configs.map(decodeVmess)
                .map((cnf: any) => mixConfig(cnf, url, "vmess", ip, operator, el.name))
                .filter((cnf: any) => (!!cnf && cnf.id))
                .map(encodeVmess)
                .filter((cnf: any) => !!cnf),
              configPerList
            )
          )
        }

        if (myConfigs.length) {
          var myMergedConfigs: Array<any>
          myMergedConfigs = myConfigs.filter((cnf: string) => cnf.startsWith("vmess://"))
            .map(decodeVmess)
            .map(cnf => mixConfig(cnf, url, "vmess", ip, operator))
            .filter(cnf => (!!cnf && cnf.id))
            .map(encodeVmess)
            .filter(cnf => !!cnf)

          finalConfigList = finalConfigList.concat(myMergedConfigs)
        }
      }
      
      if (includeOriginalConfigs) {
        finalConfigList = finalConfigList.concat(getMultipleRandomElements(configList, maxConfigs))
      }

      return new Response(btoa(finalConfigList.join("\n")))
    } else {
      var url = new URL(request.url)
      var newUrl = new URL("https://" + url.pathname.replace(/^\/|\/$/g, ""))
      return fetch(new Request(newUrl, request))
    }
  }
}

function encodeVmess(conf: string): string|null {
  try {
    return "vmess://" + btoa(JSON.stringify(conf))
  } catch {
    return null
  }
}

function decodeVmess(conf: string): any {
  try {
    return JSON.parse(atob(conf.substr(8)))
  } catch {
    return {}
  }
}

function mixConfig(conf: any, url: URL, protocol: string, ip: string, operator: string, provider = "") {
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

    if (conf.net.toLocaleLowerCase() == "ws") {
      conf.pingurl = `wss://${addr}:${conf.port}/${conf.path.replace(/^\//g, "")}`
    } else {
      conf.pingurl = `https://${addr}:${conf.port}/${conf.path.replace(/^\//g, "")}`
    }

    conf.name = conf.name ? conf.name : conf.ps
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

async function tcpPing(url: string, timeout: number) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (e) {
    return false;
  }
}

async function wsPing(url: string, timeout: number) {
  return new Promise((resolve) => {
    const socket = new WebSocket(url);
    const timeoutId = setTimeout(() => {
      socket.close();
      resolve(false);
    }, timeout);
    socket.addEventListener('open', () => {
      clearTimeout(timeoutId);
      socket.close();
      resolve(true);
    });
    socket.addEventListener('error', () => {
      clearTimeout(timeoutId);
      resolve(false);
    });
  });
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

