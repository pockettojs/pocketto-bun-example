import { App, ProtectedApp } from "..";
import { connectMasterDb } from "../utils/database";
import Company from "../models/master/Company";
import UserCompany from "../models/master/UserCompany";
import { t } from "elysia";
import { faker } from "@faker-js/faker";

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
        {
            tags: ["Company"],
            detail: {
                description: "List companies",
                summary: "List companies",
            },
        }
    );
}

export function Read(app: ProtectedApp) {
    return app.get(
        "/:companyId",
        async ({ set, params: { companyId }, userId }) => {
            await connectMasterDb();
            const invalidAccess = await Company.checkCompanyAccess(companyId, userId, set);
            if (invalidAccess) return invalidAccess;
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
        {
            tags: ["Company"],
            detail: {
                description: "Get a company",
                summary: "Get company",
            },
        }
    );
}

export function Create(app: ProtectedApp) {
    return app.post(
        "/",
        async ({ body, userId }) => {
            await connectMasterDb();
            const company = new Company(body);
            const userCompany = new UserCompany({
                userId,
                companyId: company._id,
            });
            await company.save();
            await userCompany.save();
            return {
                message: "Company created successfully",
                data: company.toJSON(),
            }
        },
        {
            body: t.Object({
                name: t.String({ examples: [faker.company.name()] }),
            }),
            tags: ["Company"],
            detail: {
                description: "Create a company",
                summary: "Create company",
            },
        }
    );
}

export default {
    List,
    Read,
    Create,
};