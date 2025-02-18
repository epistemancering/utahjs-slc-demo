import * as https from "https"
import * as fs from "fs"
import pfx from "./pfx.mjs"

const distFiles = fs.readdirSync("dist")

const gzipCompress = async (/**@type {BodyInit}*/ content) => {
    return new Uint8Array(await new Response(new Response(content).body?.pipeThrough(new CompressionStream("gzip"))).arrayBuffer())
}

const /**@type {{ [key: string]: Uint8Array }}*/ compressedFiles = {}

;(async () => {
    for (const file in distFiles) {
        compressedFiles[distFiles[file]] = await gzipCompress(fs.readFileSync(`dist/${distFiles[file]}`))
    }

    const /**@type {{ [key: string]: number }}*/ topicsList = { "Typescript isn't a language": 0, "You don't need a library to serve a website": 0, "You don't need a library to use APIs": 0, "Beware XSS": 0 }
    let compressedTopics = await gzipCompress(JSON.stringify(topicsList))
    const /**@type {{ [key: string]: Promise<void> }}*/ sessionPromises = {}
    const /**@type {{ [key: string]: () => void }}*/ sessionResolves = {}

    https.createServer(
        { pfx: Buffer.from(pfx, "base64") },
        async (request, response) => {
            response.setHeader("content-encoding", "gzip")
            let requestContent = ""

            for await (const packet of request) {
                requestContent += packet
            }

            let responseContent

            if (request.url === "/topics") {
                await sessionPromises[requestContent]
                responseContent = compressedTopics

                sessionPromises[requestContent] = new Promise((resolve) => {
                    sessionResolves[requestContent] = resolve
                })
            } else if (request.url === "/update") {
                const topicUpdate = JSON.parse(requestContent)

                if (topicUpdate.vote || topicsList[topicUpdate.topic] === undefined) {
                    if (topicUpdate.vote) {
                        topicsList[topicUpdate.topic] += topicUpdate.vote
                    } else {
                        topicsList[topicUpdate.topic] = 0
                    }

                    compressedTopics = await gzipCompress(JSON.stringify(topicsList))

                    for (const session in sessionResolves) {
                        sessionResolves[session]()

                        sessionPromises[session] = new Promise((resolve) => {
                            sessionResolves[session] = resolve
                        })
                    }
                }
            } else {
                responseContent = compressedFiles[/**@type {string}*/(request.url).slice(1)]

                if (!responseContent) {
                    response.setHeader("content-type", "text/html")
                    responseContent = compressedFiles["browser.html"]
                }
            }

            response.end(responseContent)
        }
    ).listen(443)
})()