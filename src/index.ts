import { Elysia } from "elysia";
import Swagger from "./middlewares/Swagger";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import UserModule, { Create as CreateUser } from "./modules/UserModule";
import AuthModule from "./modules/AuthModule";
import CompanyModule from "./modules/CompanyModule";
import AuthExtractor from "./middlewares/AuthExtractor";
import DatabaseModule from "./modules/DatabaseModule";

const app = new Elysia()
    .use(Swagger)
    .use(jwt({
        name: "jwt",
        secret: Bun.env.JWT_SECRET!,
    }))
    .use(bearer());
export type App = typeof app;

const protectedApp = app
    .get("/", () => 'OK', {
        tags: ["Health"],
        detail: {
            description: "Heartbeat check",
            summary: "Heartbeat",
        },
    })
    .group("/users", (group) => group.use(CreateUser))
    .use(AuthModule.Login)
    .use(AuthExtractor);
export type ProtectedApp = typeof protectedApp;

app.guard({
    beforeHandle: async ({ jwt, bearer, set }) => {
        try {
            if (!bearer) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const payload = await jwt.verify(bearer);
            if (!payload) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
        } catch (error) {
            set.status = 401;
            return { message: "Unauthorized" };
        }
    },
}, (app) => {
    return app
        .group("/users", (group) => group
            .use(UserModule.Read)
            .use(UserModule.Update)
        )
        .group("/companies", (group) => group
            .use(CompanyModule.List)
            .use(CompanyModule.Read)
            .use(CompanyModule.Create)
        )
        .group("/databases", (group) => group
            .use(DatabaseModule.List)
            .use(DatabaseModule.Read)
            .use(DatabaseModule.Create)
            .use(DatabaseModule.ReadDocuments)
            .use(DatabaseModule.ReadDocument)
            .use(DatabaseModule.CreateDocument)
            .use(DatabaseModule.UpdateDocument)
        )
})


// app;
app.listen(3000);
console.log(
    `🦊 Elysia is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`
);
