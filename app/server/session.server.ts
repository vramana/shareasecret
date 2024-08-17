import { createSessionStorage, type CookieOptions } from "@remix-run/node";
import { prisma } from "./db.server";
import { createId } from "@paralleldrive/cuid2";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  secretUrl: string;
  secretText: string;
};

const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__session",

      // all of these are optional
      // domain: "remix.run",
      // Expires can also be set (although maxAge overrides it when used in combination).
      // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
      //
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 86400,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.COOKIE_SECRET!],
      secure: true,
    },
  });

function createDatabaseSessionStorage<SData, FData>({
  cookie,
}: {
  cookie: CookieOptions & { name: string };
}) {
  return createSessionStorage<SData, FData>({
    cookie,
    // @ts-ignore
    async createData(data: any, expires: Date) {
      // `expires` is a Date after which the data should be considered
      // invalid. You could use it to invalidate the data somehow or
      // automatically purge this record from your database.
      const session = await prisma.session.create({
        data: {
          id: createId(),
          data,
          expires: expires,
        },
      });
      return session.id;
    },
    // @ts-ignore
    async readData(id: string) {
      const session = await prisma.session.findFirst({
        where: { id },
      });

      if (session == null) {
        return null;
      }

      if (session.expires < new Date()) {
        await prisma.session.delete({ where: { id } });
        return null;
      }

      // new session data should have __flash_ keys removed
      const data = session.data as Record<string, any>;
      const newData = Object.fromEntries(
        Object.entries(data).filter(([key]) => !key.startsWith("__flash_"))
      );

      await prisma.session.update({
        where: { id },
        data: { data: newData },
      });

      return session.data;
    },
    async updateData(id: string, data: any, expires: unknown) {
      await prisma.session.update({
        where: { id },
        data: { data: data as any },
      });
    },
    async deleteData(id: string) {
      await prisma.session.delete({ where: { id } });
    },
  });
}

export { getSession, commitSession, destroySession };
