const fs = require('fs')
const Fastify = require('fastify')
const server = Fastify({
  logger: true
})

server.register(require('fastify-http-proxy'), {
  upstream: 'https://app-index.sandstorm.io',
  // undici: false,
})

server.get('/jim', (request, reply) => {
  reply.send({ hello: 'world' })
})

server.get('/packages/a395d707ad612bbbf117864008ef7fa2', (request, reply) => {
  const stream = fs.createReadStream('../../hello-sandstorm-simple-rest-api-server.spk')
  reply.send(stream)
})

server.addHook('onRequest', async (request, reply) => {
  console.log('Jim onRequest headers', request.headers)
  delete request.headers['accept-encoding']
})

server.addHook('onSend', async (request, reply, payload) => {
  const err = null
  if (request.url !== '/apps/index.json') {
    return payload
  }
  console.log('Jim headers', request.headers)
  const chunks = []
  for await (const chunk of payload) {
    chunks.push(chunk)
  }
  const result = Buffer.concat(chunks)
  const json = JSON.parse(result.toString())
  // console.log('Jim3', json)
  const verify = {
    appId: '7v1jstmxakv76gn7ga3nu4d64w8k7jqpkux8sadj2vpr2n8s51g0',
    packageId: 'a395d707ad612bbbf117864008ef7fa2',
    title: { defaultText: 'HelloREST Server' },
    version: 0,
    marketingVersion: { defaultText: '0.0.0' },
    metadata: {
      icons: {},
      website:
        'https://github.com/jimpick/hello-sandstorm-simple-rest-api-server',
      codeUrl:
        'https://github.com/jimpick/hello-sandstorm-simple-rest-api-server',
      license: { openSource: 'apache2' },
      categories: [],
      author: { contactEmail: 'jim@jimpick.com' },
      shortDescription: { defaultText: 'simple rest api app' },
      screenshots: []
    }
  }
  json.apps.push({
    appId: verify.appId,
    name: verify.title.defaultText,
    version: verify.marketingVersion.defaultText,
    packageId: verify.packageId,
    imageId: '9c577b54bed5d4a0449efc3bcc4f1da0.svg',
    webLink: verify.metadata.website,
    codeLink: verify.metadata.codeUrl,
    isOpenSource: true,
    categories: verify.metadata.categories,
    author: {
      name: 'Jim Pick',
      keybaseUsername: 'jimpick',
      picture:
        'https://s3.amazonaws.com/keybase_processed_uploads/d27b0cefb64d32ca83a59a21a9c27f05_360_360.jpg'
    },
    shortDescription: verify.metadata.shortDescription.defaultText,
    upstreamAuthor: 'Jim Pick',
    createdAt: '2016-07-18T20:02:23Z',
    versionNumber: 1
  })
  // console.log('Jim', json)
  return Buffer.from(JSON.stringify(json))
  //const newPayload = payload.replace('some-text', 'some-new-text')
  // done(err, payload)
})

server.listen(5050, '0.0.0.0')
