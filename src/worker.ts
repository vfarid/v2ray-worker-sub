/*
 * V2RAY Subscription Worker v2.0
 * Copyright 2023 Vahid Farid (https://twitter.com/vahidfarid)
 * Licensed under GPLv3 (https://github.com/vfarid/v2ray-worker-sub/blob/main/Licence.md)
 */

interface Env {settings: any}
import { GetPanel, PostPanel } from "./panel"

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/|\/$/g, "")
    if (path.toLowerCase() == "sub") {
      return new Response("Not implemented!")
    } else if (path) {
      const newUrl = new URL("https://" + path)
      return fetch(new Request(newUrl, request))
    } else if (request.method === 'GET') {
      return GetPanel(url, env)
    } else if (request.method === 'POST') {
      return PostPanel(request, env)
    } else {
      return new Response('Invalid request!');
    }
  }
}
