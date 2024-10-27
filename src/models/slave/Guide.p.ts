import { Model } from "pocketto";

export class Guide extends Model {
    static dbName = 'default';
    static collectionName = 'Guides';

    guidanceName!: string;
    followerName!: string;


    route!: string;
    routeParams!: { [key: string]: string | string[] };

    focusId!: string;
    focusType!: string;
}