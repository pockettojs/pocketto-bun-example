import * as mongoose from 'mongoose';
import initiateCouchDB from '../../utils/couchdb';
import createUser, { connectSlaveDb } from '../../utils/database';
import Company from './Company';

export type Database = {
    name: string;
    protocol: string;
    databasableType: string;
    databasableId: mongoose.Types.ObjectId;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    encryption: boolean;
    encryptionPassword: string;
};

const DatabaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    protocol: {
        type: String,
        default: 'http',
    },
    databasableType: {
        type: String,
        required: true,
    },
    databasableId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    host: {
        type: String,
        required: true,
    },
    port: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    database: {
        type: String,
        required: true,
    },
    encryption: {
        type: Boolean,
        default: false,
    },
    encryptionPassword: {
        type: String,
    },
}, {
    statics: {
        async checkDatabaseAccess(databaseId: string, userId: string, set) {
            const database = await this.findOne({ _id: databaseId });
            if (!database) return;
            if (database.databasableType === 'User' && database.databasableId.toString() !== userId) {
                set.status = 403;
                return {
                    message: "Unauthorized",
                }
            }
            if (database.databasableType === 'Company') {
                const invalidAccess = await Company.checkCompanyAccess(database.databasableId.toString(), userId, set);
                if (invalidAccess) {
                    return invalidAccess;
                }
            }
        },
    },
    methods: {
        createUserAndDatabase: async function () {
            const host = Bun.env.COUCHDB_HOST as string;
            const auth = {
                username: Bun.env.COUCHDB_USERNAME as string,
                password: Bun.env.COUCHDB_PASSWORD as string,
            };
            await initiateCouchDB(host, auth);
            await createUser(host, this.username, this.password, auth);
        },
        async connect() {
            return connectSlaveDb(this.toJSON() as Database);
        },
    },
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
        }
    },
});

export default mongoose.model('Database', DatabaseSchema);