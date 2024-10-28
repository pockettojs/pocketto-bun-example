import { App, ProtectedApp } from "..";
import { connectMasterDb } from "../utils/database";
import Company from "../models/master/Company";
import UserCompany from "../models/master/UserCompany";

function checkCompanyAccess(companyId: string, userId: string) {
    return UserCompany.findOne({ companyId, userId }).then((userCompany) => {
        if (!userCompany) {
            throw new Error("Unauthorized");
        }
    });
}

function List(app: App) {
    return app.get(
        "/",
        async () => {
            await connectMasterDb();
            const userCompanies = await UserCompany.find({ userId: "userId" });
            const companies = await Company.find({
                _id: { $in: userCompanies.map((userCompany) => userCompany.companyId) },
            });
            return {
                message: "Companies retrieved successfully",
                data: companies.map((company) => company.toJSON()),
            }
        },
    );
}

export function Read(app: ProtectedApp) {
    return app.get(
        "/:companyId",
        async ({ set, params: { companyId }, userId }) => {
            await connectMasterDb();
            await checkCompanyAccess(companyId, userId);
            const company = await Company.findOne({
                _id: companyId,
            });
            if (!company) {
                set.status = 404;
                return {
                    message: "Company not found",
                };
            }
            return {
                message: "Company retrieved successfully",
                data: company.toJSON(),
            }
        },
    );
}

export default {
    List,
    Read,
};