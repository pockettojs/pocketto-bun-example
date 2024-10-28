import mongoose from "mongoose";
import { DatabaseManager } from "pocketto";

export async function connectSlaveDb() {
    await DatabaseManager.connect('http://localhost:5984/test', {
        dbName: 'remote',
        silentConnect: true,
        auth: {
            username: 'admin',
            password: 'qwer1234'
        }
    });
}

export async function connectMasterDb() {
    await mongoose.connect(`mongodb://${Bun.env.MONGOOSE_HOST}/${Bun.env.MONGOOSE_DATABASE}`);
}
