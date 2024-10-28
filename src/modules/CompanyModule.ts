import { App, ProtectedApp } from "..";
import { connectMasterDb } from "../utils/database";
import Company from "../models/master/Company";
import UserCompany from "../models/master/UserCompany";

async function checkCompanyAccess(companyId: string, userId: string) {
    return UserCompany.findOne({ companyId, userId }).then((userCompany) => {
        if (!userCompany) {
            throw new Error("Unauthorized");
        }
    });
}

export function List(app: App) {
    return app.get(
        "/",
        async () => {
            await connectMasterDb();
            return UserCompany.find({ userId: "userId" }).then((userCompanies) => {
                return Company.find({
                    _id: { $in: userCompanies.map((userCompany) => userCompany.companyId) },
                });
            });
        },
    );
}

export function Read(app: ProtectedApp) {
    return app.get(
        "/:companyId",
        async ({ params: { companyId }, userId }) => {
            await connectMasterDb();
            await checkCompanyAccess(companyId, userId);
            return Company.findOne({
                _id: companyId,
            });
        },
    );
}
