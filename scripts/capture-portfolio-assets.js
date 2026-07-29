#!/usr/bin/env node

const { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('fs')
const { join } = require('path')
const { spawn } = require('child_process')

const baseUrl = process.env.CAPTURE_BASE_URL || 'http://127.0.0.1:3000'
const screenshotDir = join(process.cwd(), 'docs', 'screenshots')
const frameDir = join(process.cwd(), 'docs', 'media', 'dashboard-frames')
const browserPort = Number(process.env.CAPTURE_DEBUG_PORT || 9223)

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  const env = {}
  const content = readFileSync(filePath, 'utf8')

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }

  return env
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch {
      // Server is still warming up.
    }
    await delay(1000)
  }
  throw new Error(`Server did not respond at ${baseUrl}`)
}

async function getDashboardSessionToken() {
  const env = {
    ...parseEnvFile(join(process.cwd(), '.env')),
    ...parseEnvFile(join(process.cwd(), '.env.local')),
    ...process.env,
  }

  if (!env.DASHBOARD_USERNAME || !env.DASHBOARD_PASSWORD) {
    throw new Error('DASHBOARD_USERNAME and DASHBOARD_PASSWORD are required for dashboard capture')
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: env.DASHBOARD_USERNAME,
      password: env.DASHBOARD_PASSWORD,
    }),
  })

  const data = await response.json().catch(() => null)
  const setCookie = response.headers.get('set-cookie')
  const sessionToken = setCookie?.match(/venue_admin_session=([^;]+)/)?.[1]

  if (!response.ok || !sessionToken) {
    throw new Error(data?.error || 'Dashboard login failed')
  }

  return decodeURIComponent(sessionToken)
}

function launchBrowser() {
  rmSync('/tmp/venue-eventos-capture', { recursive: true, force: true })

  return spawn('chromium', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${browserPort}`,
    '--user-data-dir=/tmp/venue-eventos-capture',
    '--window-size=1440,1100',
    'about:blank',
  ], {
    stdio: ['ignore', 'ignore', 'pipe'],
  })
}

async function waitForBrowser() {
  const endpoint = `http://127.0.0.1:${browserPort}/json`
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(endpoint)
      if (response.ok) {
        const targets = await response.json()
        const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl)
        if (page) return page
      }
    } catch {
      // Browser is still warming up.
    }
    await delay(500)
  }
  throw new Error('Chromium DevTools endpoint did not start')
}

function createCdpClient(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl)
  let nextId = 1
  const pending = new Map()

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (!message.id) return
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) {
      request.reject(new Error(message.error.message || 'CDP command failed'))
    } else {
      request.resolve(message.result)
    }
  })

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  return {
    ready,
    send(method, params = {}) {
      const id = nextId
      nextId += 1
      socket.send(JSON.stringify({ id, method, params }))
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
      })
    },
    close() {
      socket.close()
    },
  }
}

async function capturePage(client, url, outputPath, waitMs = 2500) {
  await client.send('Page.navigate', { url })
  await delay(waitMs)
  const screenshot = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true,
  })
  writeFileSync(outputPath, Buffer.from(screenshot.data, 'base64'))
}

async function clickTab(client, label) {
  await client.send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find((button) => button.textContent && button.textContent.includes(${JSON.stringify(label)}));
        if (target) target.click();
      })();
    `,
  })
  await delay(1400)
}

async function main() {
  mkdirSync(screenshotDir, { recursive: true })
  rmSync(frameDir, { recursive: true, force: true })
  mkdirSync(frameDir, { recursive: true })

  await waitForServer()
  const sessionToken = await getDashboardSessionToken()
  const browser = launchBrowser()

  try {
    const { webSocketDebuggerUrl } = await waitForBrowser()
    const client = createCdpClient(webSocketDebuggerUrl)
    await client.ready
    await client.send('Page.enable')
    await client.send('Network.enable')
    await client.send('Runtime.enable')
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false,
    })

    await capturePage(client, `${baseUrl}/`, join(screenshotDir, 'home.png'), 3000)
    await capturePage(client, `${baseUrl}/booking`, join(screenshotDir, 'booking.png'), 3000)
    await capturePage(client, `${baseUrl}/dashboard`, join(screenshotDir, 'dashboard-login.png'), 4000)

    const captureUrl = new URL(baseUrl)
    await client.send('Network.setCookie', {
      name: 'venue_admin_session',
      value: sessionToken,
      domain: captureUrl.hostname,
      path: '/',
      httpOnly: true,
      secure: captureUrl.protocol === 'https:',
      sameSite: 'Lax',
    })
    await client.send('Page.navigate', { url: `${baseUrl}/dashboard` })
    await delay(3500)

    const frames = [
      ['dashboard-overview.png', null],
      ['dashboard-bookings.png', 'Reservas'],
      ['dashboard-calendar.png', 'Calendário'],
      ['dashboard-settings.png', 'Configurações'],
    ]

    for (const [fileName, tab] of frames) {
      if (tab) await clickTab(client, tab)
      const screenshot = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
        fromSurface: true,
      })
      const output = join(screenshotDir, fileName)
      writeFileSync(output, Buffer.from(screenshot.data, 'base64'))
      writeFileSync(join(frameDir, fileName), Buffer.from(screenshot.data, 'base64'))
    }

    client.close()
  } finally {
    browser.kill()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
