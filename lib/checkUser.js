import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { cache } from "react";

// In-flight deduplication map: prevents parallel requests in the same process
// from running duplicate create queries simultaneously.
const inFlightSyncs = new Map();

async function performSync(user) {
  // 1. Fast path: check if user already exists by clerkUserId
  const loggedInUser = await db.user.findUnique({
    where: {
      clerkUserId: user.id,
    },
  });

  if (loggedInUser) {
    return loggedInUser;
  }

  // 2. Prepare user fields with safe fallbacks
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const primaryEmail =
    user.emailAddresses?.[0]?.emailAddress ||
    user.primaryEmailAddress?.emailAddress ||
    "";
  const name =
    fullName ||
    user.username ||
    (primaryEmail ? primaryEmail.split("@")[0] : "User");

  // 3. Check if user already exists by email (to link Clerk account and avoid unique constraint error)
  if (primaryEmail) {
    const existingUserByEmail = await db.user.findUnique({
      where: { email: primaryEmail },
    });

    if (existingUserByEmail) {
      return await db.user.update({
        where: { id: existingUserByEmail.id },
        data: {
          clerkUserId: user.id,
          name: existingUserByEmail.name || name,
          imageUrl: user.imageUrl || existingUserByEmail.imageUrl,
        },
      });
    }
  }

  // 4. Upsert user in Supabase (atomic ON CONFLICT on clerkUserId)
  const newUser = await db.user.upsert({
    where: {
      clerkUserId: user.id,
    },
    update: {
      name,
      imageUrl: user.imageUrl || null,
      ...(primaryEmail ? { email: primaryEmail } : {}),
    },
    create: {
      clerkUserId: user.id,
      name,
      imageUrl: user.imageUrl || null,
      email: primaryEmail,
    },
  });

  return newUser;
}

export const checkUser = cache(async (clerkUser) => {
  let user = clerkUser;

  try {
    if (!user) {
      user = await currentUser();
    }

    if (!user || !user.id) {
      return null;
    }

    // Deduplicate in-flight syncs for this user across concurrent layout/page/action calls
    if (inFlightSyncs.has(user.id)) {
      return await inFlightSyncs.get(user.id);
    }

    const syncPromise = performSync(user);
    inFlightSyncs.set(user.id, syncPromise);

    return await syncPromise;
  } catch (error) {
    // Next.js dynamic prerendering bailout error must be re-thrown
    if (
      error?.digest === "DYNAMIC_SERVER_USAGE" ||
      error?.message?.includes("DYNAMIC_SERVER_USAGE")
    ) {
      throw error;
    }

    // If a concurrent database write triggered a unique constraint conflict (P2002)
    if (error?.code === "P2002") {
      try {
        const primaryEmail =
          user?.emailAddresses?.[0]?.emailAddress ||
          user?.primaryEmailAddress?.emailAddress ||
          "";

        const existing = await db.user.findFirst({
          where: {
            OR: [
              ...(user?.id ? [{ clerkUserId: user.id }] : []),
              ...(primaryEmail ? [{ email: primaryEmail }] : []),
            ],
          },
        });
        if (existing) return existing;
      } catch (innerErr) {
        console.error("Error fetching user after P2002 conflict:", innerErr);
      }
    }

    console.error("Error syncing user to Supabase in checkUser:", error);
    return null;
  } finally {
    if (user?.id) {
      inFlightSyncs.delete(user.id);
    }
  }
});
