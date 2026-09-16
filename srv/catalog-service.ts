import cds from '@sap/cds'
import { trace, SpanStatusCode } from '@opentelemetry/api'

const tracer = trace.getTracer('bookshop.orders')

async function computeTotal(price: number, qty: number): Promise<number> {
  const res = await fetch('http://localhost:5005/price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price, quantity: qty })
  })

  const { total } = await res.json() as { total: number }
  return total
}

// async function computeTotal(price: number, qty: number): Promise<number> {
//     await new Promise(r => setTimeout(r, 120))   // pretend: pricing service, tax lookup
//     return Number((price * qty).toFixed(2))
// }

export default class CatalogService extends cds.ApplicationService {

    init() {

        const { Books, Orders } = this.entities

        this.on('submitOrder', async (req) => {

            const { book, quantity } = req.data as { book: string; quantity: number }

            return tracer.startActiveSpan('submitOrder', async (span) => {

                try {
                    // Identify WHICH order this was. Attributes, not the span name.
                    span.setAttribute('bookshop.book.id', book)
                    span.setAttribute('bookshop.order.quantity', quantity)
                    const found = await SELECT.one.from(Books).where({ ID: book })
                    if (!found) {
                        span.setStatus({ code: SpanStatusCode.ERROR, message: 'book not found' })
                        return req.error(404, `No book #${book}`)
                    }

                    if (found.stock < quantity) {
                        // A business rejection is a legitimate outcome, not a system failure.
                        // Record it as an attribute; do NOT mark the span as ERROR.
                        span.setAttribute('bookshop.order.rejected_reason', 'insufficient_stock')
                        span.addEvent('stock check failed', { available: found.stock, requested: quantity })
                        return req.error(409, `Only ${found.stock} left of "${found.title}"`)
                    }

                    const total = await tracer.startActiveSpan('price.calculate', async (child) => {
                        
                        try {
                            const t = await computeTotal(found.price, quantity)
                            child.setAttribute('bookshop.order.total', t)
                            return t

                        } finally {
                            child.end()
                        }
                    })

                    await UPDATE(Books).set({ stock: { '-=': quantity } }).where({ ID: book })
                    const order = await INSERT.into(Orders).entries({ book_ID: book, quantity, total })
                    span.setStatus({ code: SpanStatusCode.OK })
                    return { orderId: order.results?.[0]?.ID ?? order.ID, total }

                } catch (err) {
                    span.recordException(err as Error)
                    span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message })
                    throw err

                } finally {
                    span.end()   // ALWAYS in finally. A span that never ends is never exported.
                }
            })
        })

        // Deliberately naive: one extra query per row. This is the bug you will

        // later diagnose from a trace rather than from reading the code.

        this.after('READ', 'Orders', async (orders) => {
            const rows = Array.isArray(orders) ? orders : [orders]

            for (const o of rows) {
                if (!o?.book_ID) {
                    continue
                }
                const b = await SELECT.one.from(Books).where({ ID: o.book_ID })
                o.bookTitle = b?.title
            }

        })

        return super.init()

    }

}
