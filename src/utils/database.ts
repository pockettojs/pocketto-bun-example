import axios, { AxiosBasicCredentials } from "axios";
import mongoose from "mongoose";
import { DatabaseManager } from "pocketto";
import { Database } from "../models/master/Database";

export async function connectSlaveDb(database: Database) {
    const url = `${database.protocol}://${database.host}:${database.port}/${database.database}`;
    const db = await DatabaseManager.connect(url, {
        dbName: database.name,
        auth: {
            username: database.username,
            password: database.password,
        },
    });
    return db;
}

export async function connectMasterDb() {
    await mongoose.connect(`mongodb://${Bun.env.MONGOOSE_HOST}/${Bun.env.MONGOOSE_DATABASE}`);
}


export function dbNameToUsername(prefixedHexName: string) {
    return Buffer.from(prefixedHexName.replace('userdb-', ''), 'hex').toString(
        'utf8',
    );
}

export function usernameToDbName(name: string) {
    return 'userdb-' + Buffer.from(name).toString('hex');
}

export default async function createUser(
    host: string,
    username: string,
    password: string,
    auth: AxiosBasicCredentials,
) {
    try {
        await axios.put(
            `${host}/_users/org.couchdb.user:${username}`,
            {
                name: username,
                password: password,
                roles: ['peruser'],
                type: 'user',
            },
            {
                auth,
            },
        );
    } catch (error) {
        console.error(`Error creating user ${username}:`, (error as Error).message);
    }
}
