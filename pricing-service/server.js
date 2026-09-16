const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto')

new NodeSDK({
    serviceName: 'pricing',
    traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' }),
    instrumentations: [getNodeAutoInstrumentations()]
}).start()

const express = require('express')
const app = express()

app.use(express.json())

app.post('/price', async (req, res) => {
    const { price, quantity } = req.body
    await new Promise(r => setTimeout(r, 90))       // pretend: tax lookup
    res.json({ total: Number((price * quantity).toFixed(2)) })
})

app.listen(5005, () => console.log('pricing on 5005'))
