import { Elysia } from "elysia";
import { DatabaseManager } from "pocketto";
import { SalesInvoice } from "./models/slave/SalesInvoice.p";

async function connectDb() {
    await DatabaseManager.connect('http://localhost:5984/test', {
        dbName: 'remote',
        silentConnect: true,
        auth: {
            username: 'admin',
            password: 'qwer1234'
        }
    });
}

const app = new Elysia()
    .get("/", () => 'ok')
    .get("/sales-invoices", async () => {
        await connectDb();
        return SalesInvoice.via('remote').get().then((items) => items.map((item) => item));
    })
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
