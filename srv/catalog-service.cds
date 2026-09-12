using {bookshop} from '../db/schema';

service CatalogService @(path: '/catalog') {
    entity Books  as projection on bookshop.Books;

    entity Orders as projection on bookshop.Orders {
        *,
        virtual null as bookTitle : String(200)
    }

    action submitOrder(book: UUID, quantity: Integer) returns {
        orderId : UUID;
        total   : Decimal;
    };
}
