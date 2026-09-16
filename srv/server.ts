import cds from '@sap/cds'
import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('bookshop.business')

const ordersPlaced = meter.createCounter('bookshop.orders.placed', {
  description: 'Orders successfully placed',
  unit: '{order}'
})

const ordersRejected = meter.createCounter('bookshop.orders.rejected', {
  description: 'Orders rejected by business rules',
  unit: '{order}'
})

const orderValue = meter.createHistogram('bookshop.order.value', {
  description: 'Monetary value of placed orders',
  unit: 'EUR'
})

const booksOutOfStock = meter.createUpDownCounter('bookshop.books.out_of_stock', {
  description: 'Books currently at zero stock'
})

cds.on('served', () => {
  const { CatalogService } = cds.services as any

  CatalogService.after('submitOrder', (result: any) => {
    if (!result) return
    ordersPlaced.add(1)
    orderValue.record(Number(result.total))
  })
  
  CatalogService.on('error', (err: any) => {
    if (err.code === 409) ordersRejected.add(1, { reason: 'insufficient_stock' })
  })
})

export default cds.server
