import { Model } from "pocketto";
import moment from 'moment';

export class SalesInvoice extends Model {
    static dbName = 'default';
    static collectionName = 'SalesInvoices';

    color!: string;
    invoiceNumber!: string;
    customerName!: string;
    date!: string;
    subtotalAmount!: number;
    taxAmount!: number;
    taxRate!: number;
    totalAmount!: number;
    paidAmount!: number;

    setRandomHexColor() {
        this.color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        return this;
    }

    setInvoiceNumber() {
        this.invoiceNumber = moment().format('YYYYMMDDHHmmss');
        return this;
    }

    setDate() {
        this.date = moment().format('YYYY-MM-DD');
        return this;
    }

    get formattedDate() {
        return moment(this.date).format('DD MMM YYYY');
    }

    get paidPercentage() {
        const rawPercentage = this.paidAmount / this.totalAmount * 100;
        if (isNaN(rawPercentage)) return 0;
        return rawPercentage;
    }
}