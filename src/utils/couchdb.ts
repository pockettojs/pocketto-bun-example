import axios, { AxiosBasicCredentials } from 'axios';

async function createReservedDatabase(
    host: string,
    dbName: string,
    auth: AxiosBasicCredentials,
) {
    try {
        await axios.put(
            `${host}/${dbName}`,
            {},
            {
                auth,
            },
        );
    } catch (error) { }
}

export default async function initiateCouchDB(
    host: string,
    auth: AxiosBasicCredentials,
) {
    return Promise.all([
        createReservedDatabase(host, '_users', auth),
        createReservedDatabase(host, '_replicator', auth),
        createReservedDatabase(host, '_global_changes', auth),
    ]);
}
