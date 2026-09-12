namespace bookshop;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Books : cuid, managed {
    title  : String(200);
    author : String(100);
    stock  : Integer;
    price  : Decimal(9, 2);
}

entity Orders : cuid, managed {
    book     : Association to Books;
    quantity : Integer;
    total    : Decimal(9, 2);
}
