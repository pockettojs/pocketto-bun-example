import { ProtectedApp } from "..";
import createUser, { connectMasterDb, usernameToDbName } from "../utils/database";
import Database from "../models/master/Database";
import { t } from "elysia";
import mongoose from "mongoose";
import initiateCouchDB from "../utils/couchdb";
import shortUuid from 'short-uuid';
import { SalesInvoice } from "../models/slave/SalesInvoice.p";
import { Guide } from "../models/slave/Guide.p";
import { Model } from "pocketto";
import { ModelStatic } from "pocketto/dist/src/definitions/Model";

enum DatabasableType {
    User = "User",
    Company = "Company",
};

const List = (app: ProtectedApp) => {
    return app.get(
        "/",
        async ({ userId }) => {
            await connectMasterDb();
            const databases = await Database.find({ databasableId: userId });
            return {
                message: "Databases retrieved successfully",
                data: databases.map((database) => database.toJSON()),
            };
        },
        {
            tags: ["Database"],
            detail: {
                description: "Get all databases",
                summary: "Get databases",
            },
        }
    );
}

const Read = (app: ProtectedApp) => {
    return app.get(
        "/:databaseId",
        async ({ set, userId, params: { databaseId } }) => {
            await connectMasterDb();
            const database = await Database.findOne({ _id: databaseId });
            if (!database) {
                set.status = 404;
                return {
                    message: "Database not found",
                };
            }

            const invalidAccess = await Database.checkDatabaseAccess(databaseId, userId, set);
            if (invalidAccess) {
                return invalidAccess;
            }

            return {
                message: "Database retrieved successfully",
                data: database.toJSON(),
            };
        },
        {
            tags: ["Database"],
            detail: {
                description: "Get a database",
                summary: "Get database",
            },
        }
    );
}

const Create = (app: ProtectedApp) => {
    return app.post(
        "/",
        async ({ body, userId }) => {
            await connectMasterDb();
            const username = String(shortUuid.generate());
            const password = String(shortUuid.generate());
            const databaseName = usernameToDbName(username);

            const database = new Database();
            database.databasableType = body.databasableType || "User";
            database.databasableId = new mongoose.Types.ObjectId(body.databasableId || userId);
            database.name = `${database.databasableType}-${database.databasableId}`;
            database.protocol = Bun.env.COUCHDB_PROTOCOL as string;
            database.host = Bun.env.COUCHDB_HOST as string;
            database.port = Number(Bun.env.COUCHDB_PORT);
            database.username = username;
            database.password = password;
            database.database = databaseName;
            database.encryption = body.encryption || false;
            database.encryptionPassword = body.encryptionPassword || "";
            await database.save();

            const host = Bun.env.COUCHDB_HOST as string;
            const auth = {
                username: Bun.env.COUCHDB_USERNAME as string,
                password: Bun.env.COUCHDB_PASSWORD as string,
            };
            await initiateCouchDB(host, auth);
            const url = `${database.protocol}://${database.host}:${database.port}`;
            await createUser(url, database.username, database.password, auth);
            await new Promise((resolve) => setTimeout(resolve, 50));

            return {
                message: "Database created successfully",
                data: database.toJSON(),
            };
        },
        {
            tags: ["Database"],
            detail: {
                description: "Create a database",
                summary: "Create database",
            },
            body: t.Object({
                databasableType: t.Optional(t.Enum(DatabasableType, { examples: [DatabasableType.User] })),
                databasableId: t.Optional(t.String({ examples: [shortUuid.generate()] })),
                encryption: t.Optional(t.Boolean({ examples: [false] })),
                encryptionPassword: t.Optional(t.String({ examples: [shortUuid.generate()] })),
            }),
        },
    );
}

const ReadDocuments = (app: ProtectedApp) => {
    return app.get(
        "/:databaseId/collections/:collectionName/documents",
        async ({ set, userId, params: { databaseId, collectionName } }) => {
            await connectMasterDb();
            const database = await Database.findOne({ _id: databaseId });
            if (!database) {
                set.status = 404;
                return {
                    message: "Database not found",
                };
            }

            const invalidAccess = await Database.checkDatabaseAccess(databaseId, userId, set);
            if (invalidAccess) {
                return invalidAccess;
            }

            const collectionMapper = {
                [SalesInvoice.collectionName]: SalesInvoice,
                [Guide.collectionName]: Guide,
            } as { [key: string]: ModelStatic<Model> };

            if (!collectionMapper[collectionName]) {
                set.status = 404;
                return {
                    message: "Collection not found",
                };
            }

            await database.connect();
            const DestinationModel = collectionMapper[collectionName];
            const databaseName = database.name;
            const result = await (new DestinationModel()).getClass().via(databaseName).get();
            return {
                message: "Collection list retrieved successfully",
                data: result,
            };
        },
        {
            tags: ["Database"],
            detail: {
                description: "Get the collection list data",
                summary: "Get collection list data",
            },
        }
    );
}

const ReadDocument = (app: ProtectedApp) => {
    return app.get(
        "/:databaseId/collections/:collectionName/documents/:documentId",
        async ({ set, userId, params: { databaseId, collectionName, documentId } }) => {
            await connectMasterDb();
            const database = await Database.findOne({ _id: databaseId });
            if (!database) {
                set.status = 404;
                return {
                    message: "Database not found",
                };
            }

            const invalidAccess = await Database.checkDatabaseAccess(databaseId, userId, set);
            if (invalidAccess) {
                return invalidAccess;
            }

            const collectionMapper = {
                [SalesInvoice.collectionName]: SalesInvoice,
                [Guide.collectionName]: Guide,
            } as { [key: string]: ModelStatic<Model> };

            if (!collectionMapper[collectionName]) {
                set.status = 404;
                return {
                    message: "Collection not found",
                };
            }

            await database.connect();
            const DestinationModel = collectionMapper[collectionName];
            const databaseName = database.name;
            const result = await (new DestinationModel()).getClass().via(databaseName).find(documentId);
            if (!result) {
                set.status = 404;
                return {
                    message: "Document not found",
                };
            }
            return {
                message: "Document retrieved successfully",
                data: result,
            };
        },
        {
            tags: ["Database"],
            detail: {
                description: "Get the document data",
                summary: "Get document data",
            },
        }
    );
}

const CreateDocument = (app: ProtectedApp) => {
    return app.post(
        "/:databaseId/collections/:collectionName/documents",
        async ({ set, userId, params: { databaseId, collectionName }, body }) => {
            await connectMasterDb();
            const database = await Database.findOne({ _id: databaseId });
            if (!database) {
                set.status = 404;
                return {
                    message: "Database not found",
                };
            }

            const invalidAccess = await Database.checkDatabaseAccess(databaseId, userId, set);
            if (invalidAccess) {
                return invalidAccess;
            }

            const collectionMapper = {
                [SalesInvoice.collectionName]: SalesInvoice,
                [Guide.collectionName]: Guide,
            } as { [key: string]: ModelStatic<Model> };

            if (!collectionMapper[collectionName]) {
                set.status = 404;
                return {
                    message: "Collection not found",
                };
            }

            await database.connect();
            const DestinationModel = collectionMapper[collectionName];
            const databaseName = database.name;
            const createResult = await (new DestinationModel()).getClass().via(databaseName).create(body);
            const result = await (new DestinationModel()).getClass().via(databaseName).find(createResult._id);
            return {
                message: "Document created successfully",
                data: result,
            };
        },
        {
            tags: ["Database"],
            detail: {
                description: "Create a document",
                summary: "Create document",
            },
            body: t.Object({}),
        },
    );
}

const UpdateDocument = (app: ProtectedApp) => {
    return app.put(
        "/:databaseId/collections/:collectionName/documents/:documentId",
        async ({ set, userId, params: { databaseId, collectionName, documentId }, body }) => {
            await connectMasterDb();
            const database = await Database.findOne({ _id: databaseId });
            if (!database) {
                set.status = 404;
                return {
                    message: "Database not found",
                };
            }

            const invalidAccess = await Database.checkDatabaseAccess(databaseId, userId, set);
            if (invalidAccess) {
                return invalidAccess;
            }

            const collectionMapper = {
                [SalesInvoice.collectionName]: SalesInvoice,
                [Guide.collectionName]: Guide,
            } as { [key: string]: ModelStatic<Model> };

            if (!collectionMapper[collectionName]) {
                set.status = 404;
                return {
                    message: "Collection not found",
                };
            }

            await database.connect();
            const DestinationModel = collectionMapper[collectionName];
            const databaseName = database.name;
            const result = await (new DestinationModel()).getClass().via(databaseName).find(documentId);
            if (!result) {
                set.status = 404;
                return {
                    message: "Document not found",
                };
            }
            console.log('body: ', body);
            result.fill(body);
            result.getClass().dbName = databaseName;
            await result.save();
            return {
                message: "Document updated successfully",
                data: result,
            };
        },
        {
            tags: ["Database"],
            detail: {
                description: "Update a document",
                summary: "Update document",
            },
            body: t.Object({}),
        },
    );
}

export default {
    List,
    Read,
    Create,
    ReadDocuments,
    ReadDocument,
    CreateDocument,
    UpdateDocument,
};