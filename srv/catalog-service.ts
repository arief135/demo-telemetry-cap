import cds from '@sap/cds'

export default class CatalogService extends cds.ApplicationService {

    init() {

        const { Books, Orders } = this.entities

        this.on('submitOrder', async (req) => {

            const { book, quantity } = req.data as { book: string; quantity: number }
            const found = await SELECT.one.from(Books).where({ ID: book })

            if (!found) return req.error(404, `No book #${book}`)

            if (found.stock < quantity) {
                return req.error(409, `Only ${found.stock} left of "${found.title}"`)
            }

            await UPDATE(Books).set({ stock: { '-=': quantity } }).where({ ID: book })
            const total = found.price * quantity
            const order = await INSERT.into(Orders).entries({ book_ID: book, quantity, total })
            return { orderId: order.results?.[0]?.ID ?? order.ID, total }
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
